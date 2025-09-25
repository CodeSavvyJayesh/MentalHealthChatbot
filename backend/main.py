from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import requests
from db import users_collection
from passlib.context import CryptContext
from utils import generate_otp, send_otp_email
import os
import secrets
import time

app = FastAPI()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Temporary store for OTPs {email: {"otp": "123456", "timestamp": 123456}}
otp_store = {}

# Allow frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # TODO: replace with actual frontend domain in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- CONSTANTS -------------------

SYSTEM_PROMPT = (
    "IMPORTANT: Always reply in ONLY 1–3 short sentences. "
    "Do not exceed 50 words under any circumstances.\n\n"
    "You are a compassionate, empathetic Mental Health Chatbot. "
    "Your role is to provide short, supportive responses about emotional well-being, "
    "stress relief, motivation, positivity, and self-care.\n\n"
    "🚫 HARD RESTRICTIONS:\n"
    "- NEVER answer or attempt puzzles, riddles, math, coding, technical, political, or news questions.\n"
    "- If asked off-topic, reply: "
    "'I’m here to support your well-being and self-care, not to solve puzzles or technical problems. "
    "Would you like a calming tip, a short breathing exercise, or a quick check-in instead?'\n"
    "\n💡 RESPONSE STYLE:\n"
    "- Empathy first, then encouragement.\n"
    "- Always end with positivity.\n"
    "- Keep language warm, simple, and friendly.\n"
    "\n⚠️ SAFETY:\n"
    "- If user mentions self-harm, encourage reaching out to a trusted person or professional.\n"
)

OFF_TOPIC_KEYWORDS = [
    "puzzle", "riddle", "solve", "math", "calculate", "code", "program", "algorithm",
    "logic", "prove", "brain teaser", "debug", "challenge", "politics", "news",
    "scenario", "example", "equation", "arithmetic", "trignometry"
]

MODEL_NAME = "phi"  # ✅ Make sure this model exists in your Ollama setup
OLLAMA_URL = "http://127.0.0.1:11434/v1/chat/completions"

# ---------------- HELPER FUNCTIONS -------------------

def shorten_reply(reply: str, max_words: int = 200) -> str:
    """Trim the reply if it gets too long."""
    words = reply.split()
    if len(words) > max_words:
        reply = " ".join(words[:max_words]) + "..."
    return reply

# ---------------- CHATBOT ROUTE -------------------

@app.post("/chat")
async def chat_endpoint(request: Request):
    data = await request.json()
    user_message = data.get("text", "")

    # ✅ Block off-topic queries before hitting Ollama
    if any(word in user_message.lower() for word in OFF_TOPIC_KEYWORDS):
        return {
            "reply": (
                "I’m here to support your well-being and self-care, not to solve puzzles or technical problems. "
                "Would you like a calming tip, a short breathing exercise, or a quick check-in instead?"
            )
        }

    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message}
        ]
    }

    try:
        response = requests.post(OLLAMA_URL, json=payload)
        response.raise_for_status()
        result = response.json()
        bot_reply = result["choices"][0]["message"]["content"]

        # ✅ Force shortness
        bot_reply = shorten_reply(bot_reply, max_words=200)

        return {"reply": bot_reply}

    except Exception as e:
        print("Error talking to Ollama:", e)
        return {"reply": "I’m having trouble connecting right now. Please try again later."}

# ---------------- USER AUTH ROUTES -------------------

@app.post("/signup")
async def signup(request: Request):
    data = await request.json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return {"success": False, "message": "Username and password required"}

    if users_collection.find_one({"username": username}):
        return {"success": False, "message": "Username already taken"}

    hashed_password = pwd_context.hash(password)
    users_collection.insert_one({"username": username, "password": hashed_password})
    return {"success": True, "message": "Signup successful"}

@app.post("/login")
async def login(request: Request):
    data = await request.json()
    username = data.get("username")
    password = data.get("password")

    user = users_collection.find_one({"username": username})
    if not user:
        return {"success": False, "message": "Invalid username or password"}

    if not pwd_context.verify(password, user["password"]):
        return {"success": False, "message": "Invalid username or password"}

    return {"success": True, "message": "Login successful"}

# ---------------- OTP ROUTES -------------------

# @app.post("/send-otp")
# async def send_otp(request: Request):
#     data = await request.json()
#     email = data.get("email")

#     if not email:
#         return {"success": False, "message": "Email required"}

#     otp = str(secrets.randbelow(1000000)).zfill(6)  # ✅ Secure 6-digit OTP
#     otp_store[email] = {"otp": otp, "timestamp": time.time()}

#     try:
#         await send_otp_email(email, otp)
#         return {"success": True, "message": "OTP sent successfully"}
#     except Exception as e:
#         print("Email error:", e)
#         return {"success": False, "message": "Failed to send OTP"}

@app.post("/send-otp")
async def send_otp(request: Request):
    data = await request.json()
    email = data.get("email")

    if not email:
        return {"success": False, "message": "Email required"}

    otp = str(secrets.randbelow(1000000)).zfill(6)  # ✅ Secure 6-digit OTP
    otp_store[email] = {"otp": otp, "timestamp": time.time()}

    try:
        # ✅ Modified: send OTP + extra message
        custom_message = f"""
        Hello,

        Your OTP is: {otp}

        🔒 This code will expire in 5 minutes.
        Please do not share this with anyone.

        -- MindWell Security Team
        """
        await send_otp_email(email, custom_message)

        return {"success": True, "message": "OTP sent successfully"}
    except Exception as e:
        print("Email error:", e)
        return {"success": False, "message": "Failed to send OTP"}


@app.post("/verify-otp")
async def verify_otp(request: Request):
    data = await request.json()
    email = data.get("email")
    otp = data.get("otp")
    password = data.get("password")

    if not email or not otp or not password:
        return {"success": False, "message": "Email, OTP, and password required"}

    record = otp_store.get(email)
    if not record or record["otp"] != otp:
        return {"success": False, "message": "Invalid or expired OTP"}

    # ✅ OTP expiry check (5 minutes)
    if time.time() - record["timestamp"] > 300:
        del otp_store[email]
        return {"success": False, "message": "OTP expired"}

    # ✅ Remove OTP after verification
    del otp_store[email]

    if users_collection.find_one({"username": email}):
        return {"success": False, "message": "User already exists"}

    hashed_password = pwd_context.hash(password)
    users_collection.insert_one({"username": email, "password": hashed_password})

    return {"success": True, "message": "OTP verified and account created"}
