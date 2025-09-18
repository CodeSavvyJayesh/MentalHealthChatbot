import React, { useState } from 'react';
import Signup from './components/Signup';
import Login from './components/Login';
import Chat from './components/Chat';
import UserMenu from './components/UserMenu';
import './App.css';
import doctorImage from './doctor.png';
import mediverseLogo from './mediverseLogo.png';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setShowChatbot(false);
  };

  // Not logged in: show login or signup form
  if (!isLoggedIn) {
    return (
      <div className="main-container">
        <div className="auth-wrapper">
          <div className="auth-left">
            <img src={doctorImage} alt="Doctor" />
          </div>
          <div className="auth-right">
            {showSignup ? (
              <>
                <Signup onSignupSuccess={() => setShowSignup(false)} />
                <p>
                  Already have an account?{' '}
                  <button onClick={() => setShowSignup(false)}>Log in</button>
                </p>
              </>
            ) : (
              <>
                <Login onLoginSuccess={() => setIsLoggedIn(true)} />
                <p>
                  Don't have an account?{' '}
                  <button onClick={() => setShowSignup(true)}>Sign up</button>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Logged in: show top bar, chatbot, or welcome text
  return (
    <div className="main-container">
      <div className="top-bar">
        <div className="logo-container">
          <img src={mediverseLogo} alt="MediVerse Logo" className="logo-img" />
          <span className="logo-text">MediVerse</span>
        </div>

        <UserMenu
          showChatbot={showChatbot}
          setShowChatbot={setShowChatbot}
          onLogout={handleLogout}
        />
      </div>

      {showChatbot ? (
        <div className="chat-container">
          <Chat />
        </div>
      ) : (
        <div className="welcome-text">
          <h2>Welcome to our Mental Health Platform</h2>
          <p>Please enable the chatbot from the top-right menu to begin.</p>
        </div>
      )}
    </div>
  );
}

export default App;
