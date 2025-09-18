import React, { useState, useEffect, useRef } from 'react';
import '../App.css';

function Chat() {
  const [messages, setMessages] = useState([
    { text: "Hi! I'm your mental health assistant. How can I support you today? 💙", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBoxRef = useRef(null);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === '') return;

    const userMessage = { text: input };
    setMessages((prev) => [...prev, { text: input, sender: 'user' }]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userMessage),
      });

      const data = await response.json();
      if (data.reply) {
        setMessages((prev) => [...prev, { text: data.reply, sender: 'bot' }]);
      } else {
        setMessages((prev) => [...prev, { text: "No reply from server.", sender: 'bot' }]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [...prev, { text: "Error talking to server.", sender: 'bot' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="chat-container">
      <h2>AI Mental Health Chatbot 💙</h2>
      <div className="chat-box" ref={chatBoxRef}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={msg.sender === 'user' ? 'message user' : 'message bot'}
          >
            {msg.text}
          </div>
        ))}
        {isTyping && <div className="message bot">Bot is typing...</div>}
      </div>
      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type your message..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

export default Chat;
