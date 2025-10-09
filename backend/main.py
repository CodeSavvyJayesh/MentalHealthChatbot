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
    allow_origins=["*"],  # TODO: replace with actual frontend domain in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- CONSTANTS -------------------

SYSTEM_PROMPT = (
    "IMPORTANT: Reply in 2–5 supportive sentences. "
    "Keep language warm, compassionate, and friendly. "
    "Prioritize empathy, positivity, and emotional support.\n\n"
    "🚫 HARD RESTRICTIONS:\n"
    "- NEVER answer puzzles, riddles, math, coding, technical, political, or news questions.\n"
    "- If asked off-topic, reply: "
    "'I’m here to support your well-being, not technical problems. "
    "Would you like a calming tip, a short breathing exercise, or a quick check-in instead?'\n"
    "\n⚠️ SAFETY:\n"
    "- If the user mentions self-harm or suicidal thoughts, encourage reaching out to a trusted person or professional immediately.\n"
)

OFF_TOPIC_KEYWORDS = [
    "puzzle", "riddle", "solve", "math", "calculate", "code", "program", "algorithm",
    "logic", "prove", "brain teaser", "debug", "challenge", "politics", "news",
    "scenario", "example", "equation", "arithmetic", "trignometry"
]

MODEL_NAME = "phi"  # Make sure this model exists in your Ollama setup
OLLAMA_URL = "http://127.0.0.1:11434/v1/chat/completions"


import threading

def warm_up_model():
    try:
        print("🔥 Warming up Ollama model...")
        payload = {
            "model": MODEL_NAME,
            "messages": [
                {"role": "system", "content": "You are a helpful mental health support assistant."},
                {"role": "user", "content": "Hello!"}
            ]
        }
        # Send a small dummy request just to load the model into memory
        requests.post(OLLAMA_URL, json=payload, timeout=20)
        print("✅ Model warm-up complete! Ready to chat.")
    except Exception as e:
        print("⚠️ Warm-up failed:", e)

# Run warm-up in a background thread so server starts instantly
threading.Thread(target=warm_up_model, daemon=True).start()


# ---------------- HELPER FUNCTIONS -------------------

def shorten_reply(reply: str) -> str:
    """Return the reply as-is to avoid incomplete responses."""
    return reply

# ---------------- CHATBOT ROUTE -------------------

@app.post("/chat")
async def chat_endpoint(request: Request):
    data = await request.json()
    user_message = data.get("text", "").strip()

    if not user_message:
        return {"reply": "I’m here whenever you want to talk 💙"}

    # ✅ Crisis handling
    crisis_keywords = ["suicid",
"kill myself",
"end my life",
"self-harm",
"hurt myself",
"want to die",
"can't live anymore",
"no reason to live",
"give up on life",
"tired of living",
"cut myself",
"life is worthless",
"die",
"commit suicide",
"take my life",
"ending it all",
"overdose",
"jump off",
"hang myself",
"slit my wrist",
"want to disappear",
"nobody cares if I die",
"wish I was dead",
"don’t want to be here",
"life has no meaning",
"pain is too much",
"can’t go on",
"feel hopeless",
"want everything to stop"]
    if any(word in user_message.lower() for word in crisis_keywords):
        return {
            "reply": (
                "I’m really concerned about your safety 💙. "
                "If you’re in immediate danger, please call your local emergency number. "
                "In India: AASRA +91-9820466726, Snehi Helpline +91-9582208181. "
                "You are not alone, and reaching out is a strong step."
            )
        }

    # ✅ Off-topic block
    if any(word in user_message.lower() for word in OFF_TOPIC_KEYWORDS):
        return {
            "reply": (
                 "I’m here to support your well-being 🌱 — not tackle technical stuff ⚙️ "
                 "Would you prefer a 🧘‍♀️ breathing exercise, 🌻 mindfulness tip, or 💬 quick emotional check?"
            )
        }

    # ✅ Prepare payload for Ollama phi model
    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message}
        ]
    }

    try:
        response = requests.post(OLLAMA_URL, json=payload, timeout=30)
        response.raise_for_status()
        result = response.json()
        bot_reply = result["choices"][0]["message"]["content"]

        # Return full reply
        return {"reply": shorten_reply(bot_reply)}
    
    

    except Exception as e:
        print("Error talking to Ollama:", e)
        return {
            "reply": (
                "I’m having trouble connecting right now 💙. "
                "Take a deep breath and reach out to someone you trust if needed."
            )
        }

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

@app.post("/send-otp")
async def send_otp(request: Request):
    data = await request.json()
    email = data.get("email")

    if not email:
        return {"success": False, "message": "Email required"}

    otp = str(secrets.randbelow(1000000)).zfill(6)  # Secure 6-digit OTP
    otp_store[email] = {"otp": otp, "timestamp": time.time()}

    try:
        await send_otp_email(email, otp)
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

    if time.time() - record["timestamp"] > 300:  # OTP expiry 5 min
        del otp_store[email]
        return {"success": False, "message": "OTP expired"}

    del otp_store[email]

    if users_collection.find_one({"username": email}):
        return {"success": False, "message": "User already exists"}

    hashed_password = pwd_context.hash(password)
    users_collection.insert_one({"username": email, "password": hashed_password})

    return {"success": True, "message": "OTP verified and account created"}
