"use client"

import { useState } from "react"
import { FiSearch, FiLogOut, FiSettings,FiEdit,FiBook, FiActivity, FiBarChart2, FiFolder } from 'react-icons/fi';
import Signup from "./components/Signup"
import Login from "./components/Login"
import Chat from "./components/Chat"
import UserMenu from "./components/UserMenu"
import "./App.css"
import doctorImage from "./doctor.png"
import mediverseLogo from "./mediverseLogo.png"

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showSignup, setShowSignup] = useState(false)
  const [showChatbot, setShowChatbot] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)

  const handleLogout = () => {
    setIsLoggedIn(false)
    setShowChatbot(false)
    setShowSidebar(false)
  }

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar)
  }

  const handleDashboardClick = () => {
    setShowSidebar(false)
    setShowChatbot(false)
  }

  // Not logged in: show login or signup form
  if (!isLoggedIn) {
    return (
      <div className="main-container">
        <div className="auth-wrapper">
          <div className="auth-left">
            <img src={doctorImage || "/placeholder.svg"} alt="Doctor" />
          </div>
          <div className="auth-right">
            {showSignup ? (
              <>
                <Signup onSignupSuccess={() => setShowSignup(false)} />
                <p>
                  Already have an account? <button onClick={() => setShowSignup(false)}>Log in</button>
                </p>
              </>
            ) : (
              <>
                <Login onLoginSuccess={() => setIsLoggedIn(true)} />
                <p>
                  Don't have an account? <button onClick={() => setShowSignup(true)}>Sign up</button>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Logged in: show top bar, sidebar, chatbot, or welcome text
  return (
    <div className="main-container">
      {showSidebar && <div className="sidebar-overlay" onClick={() => setShowSidebar(false)}></div>}

      <div className={`sidebar ${showSidebar ? "sidebar-open" : ""}`}>
        <div className="sidebar-header">

         <img
            src={mediverseLogo || "/placeholder.svg"}
            alt="MediVerse Logo"
            className="logo-img clickable"
            onClick={toggleSidebar}
          />

          <span className="sidebar-title">MindWell</span>
        </div>

        <div className="sidebar-menu">
          <div className="sidebar-item">
            
            <span className="sidebar-icon"><FiEdit  color="#8395eb" /></span>
            <span>New therapy session</span>
          </div>
          <div className="sidebar-item">
          
            <span className="sidebar-icon"><FiSearch  color="#8395eb" /></span>
            <span>Search conversations</span>
          </div>
          <div className="sidebar-item">
             <span className="sidebar-icon"><FiBook  color="#8395eb"/></span>
            <span>Mental health library</span>
          </div>
          <div className="sidebar-item">
          <span className="sidebar-icon"><FiActivity  color="#8395eb" /></span>
            <span>Mindfulness exercises</span>
          </div>
          <div className="sidebar-item">
            <span className="sidebar-icon"><FiBarChart2  color="#8395eb"/></span>
            <span>Progress tracking</span>
          </div>
          <div className="sidebar-item">
          <span className="sidebar-icon"><FiFolder  color="#8395eb"/></span>
            <span>My sessions</span>
            <span className="sidebar-badge">NEW</span>
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-item sidebar-logout" onClick={handleLogout} >
          <span className="sidebar-icon"><FiLogOut /></span>
            <span>Log out</span>
          </div>
        </div>
      </div>

      <div className="top-bar">
        <div className="logo-container">
          <img
            src={mediverseLogo || "/placeholder.svg"}
            alt="MediVerse Logo"
            className="logo-img clickable"
            onClick={toggleSidebar}
          />
          <span className="logo-text" onClick={handleDashboardClick}>
            MindWell
          </span>

          
        </div>

        <UserMenu showChatbot={showChatbot} setShowChatbot={setShowChatbot} onLogout={handleLogout} />
      </div>

      {showChatbot ? (
        <div className="chat-container">
          <Chat />
        </div>
      ) : (
        <div className="welcome-text" onClick={handleDashboardClick}>
          <h2>Welcome to our Mental Health Platform</h2>
          <p>Please enable the chatbot from the top-right menu to begin.</p>
        </div>
      )}
    </div>
  )
}

export default App

