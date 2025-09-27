// import React, { useState, useEffect, useRef } from 'react';
// import '../App.css';

// function Chat() {
//   const [messages, setMessages] = useState([
//     { text: "Hi! I'm your mental health assistant. How can I support you today? 💙", sender: 'bot' }
//   ]);
//   const [input, setInput] = useState('');
//   const [isTyping, setIsTyping] = useState(false);
//   const chatBoxRef = useRef(null);

//   useEffect(() => {
//     if (chatBoxRef.current) {
//       chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
//     }
//   }, [messages]);

//   const handleSend = async () => {
//     if (input.trim() === '') return;

//     const userMessage = { text: input };
//     setMessages((prev) => [...prev, { text: input, sender: 'user' }]);
//     setInput('');
//     setIsTyping(true);

//     try {
//       const response = await fetch('http://127.0.0.1:8000/chat', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(userMessage),
//       });

//       const data = await response.json();
//       if (data.reply) {
//         setMessages((prev) => [...prev, { text: data.reply, sender: 'bot' }]);
//       } else {
//         setMessages((prev) => [...prev, { text: "No reply from server.", sender: 'bot' }]);
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       setMessages((prev) => [...prev, { text: "Error talking to server.", sender: 'bot' }]);
//     } finally {
//       setIsTyping(false);
//     }
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter') {
//       handleSend();
//     }
//   };

//   return (
//     <div className="chat-container">
//       <h2>AI Mental Health Chatbot 💙</h2>
//       <div className="chat-box" ref={chatBoxRef}>
//         {messages.map((msg, index) => (
//           <div
//             key={index}
//             className={msg.sender === 'user' ? 'message user' : 'message bot'}
//           >
//             {msg.text}
//           </div>
//         ))}
//         {isTyping && <div className="message bot">Bot is typing...</div>}
//       </div>
//       <div className="input-area">
//         <input
//           type="text"
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyDown={handleKeyPress}
//           placeholder="Type your message..."
//         />
//         <button onClick={handleSend}>Send</button>
//       </div
//     </div>
//   );
// }

// export default Chat;







"use client"



import { useState, useEffect, useRef } from "react"
import { FiSend, FiPaperclip, FiUser } from "react-icons/fi"
import mediverseLogo from '../mediverseLogo.png'; // import from src

function Chat({ chatId }) {
  const [messages, setMessages] = useState([
    { text: "Hi! I'm your  MindWell AI assistant. How can I support you today? 💙", sender: "bot" },
  ])
  // ... rest of your code remains the same

  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const chatBoxRef = useRef(null)

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight
    }
  }, [messages])

  // Reset messages when chat changes
  useEffect(() => {
    setMessages([{ text: "Hi! I'm your MindWell AI assistant. How can I support you today? 💙", sender: "bot" }])
  }, [chatId])

  const handleSend = async () => {
    if (input.trim() === "") return

    const userMessage = { text: input }
    setMessages((prev) => [...prev, { text: input, sender: "user" }])
    setInput("")
    setIsTyping(true)

   
    setTimeout(() => {
      const responses = [
        "I understand how you're feeling. Can you tell me more about what's been on your mind?",
        "That sounds challenging. What coping strategies have you tried before?",
        "Thank you for sharing that with me. How has this been affecting your daily life?",
        "I'm here to support you. Would you like to explore some mindfulness techniques?",
        "It's completely normal to feel this way. What would help you feel more comfortable right now?",
      ]
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
      setMessages((prev) => [...prev, { text: randomResponse, sender: "bot" }])
      setIsTyping(false)
    }, 2000)
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const adjustTextareaHeight = (e) => {
    const textarea = e.target
    textarea.style.height = "auto"
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px"
  }

  return (
    <div className="mindwell-chat-container">
      <div className="mindwell-chat-messages" ref={chatBoxRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`mindwell-message-row ${msg.sender === "user" ? "user-row" : "assistant-row"}`}>
            <div className="mindwell-message-content">
              <div className="mindwell-avatar">
                {msg.sender === "user" ? (
                  <div className="user-avatar-circle">
                    <FiUser size={16} color="#8395eb"/>
                  </div>
                ) : (
                  <div className="bot-avatar-circle">
                    <img src={mediverseLogo } alt="MindWell AI" className="mediverse-logo" />
                  </div>
                )}
              </div>
              <div className="mindwell-message-text">
                <div className="mindwell-message-author">{msg.sender === "user" ? "You" : "MindWell AI"}</div>
                <div className="mindwell-message-body">{msg.text}</div>
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="mindwell-message-row assistant-row">
            <div className="mindwell-message-content">
              <div className="mindwell-avatar">
                <div className="bot-avatar-circle typing-avatar">
                  <img
                    src={mediverseLogo}
                    alt="MediVerse AI"
                    className="mediverse-logo typing-logo"
                  />
                </div>
              </div>
              <div className="mindwell-message-text">
                <div className="mindwell-message-author">MindWell AI</div>
                <div className="mindwell-message-body">
                  <div className="mindwell-typing-indicator">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mindwell-input-container">
        <div className="mindwell-input-wrapper">
          <div className="mindwell-input-inner">
            <button className="mindwell-attachment-btn">
              <FiPaperclip size={20} />
            </button>
            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                adjustTextareaHeight(e)
              }}
              onKeyDown={handleKeyPress}
              placeholder="Message MindWell AI..."
              className="mindwell-textarea"
              rows="1"
            />
            <button
              onClick={handleSend}
              className={`mindwell-send-btn ${input.trim() ? "active" : ""}`}
              disabled={!input.trim()}
            >
              <FiSend size={16}  color="#3955e2ff" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chat
