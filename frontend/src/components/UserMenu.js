import React, { useState } from 'react';
import './UserMenu.css'; // optional

function UserMenu({ showChatbot, setShowChatbot, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleToggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  return (
    <div className="user-menu">
      <button onClick={handleToggleMenu} className="user-button">
        Account ⌄
      </button>

      {menuOpen && (
        <div className="dropdown">
          <button onClick={() => setShowChatbot(!showChatbot)}>
            {showChatbot ? '❌ Disable Chatbot' : '✅ Enable Chatbot'}
          </button>
          <button onClick={onLogout}>🚪 Logout</button>
        </div>
      )}
    </div>
  );
}

export default UserMenu;
