// ForgotPassword.js
import React, { useState } from 'react';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSendOtp = async () => {
    const response = await fetch('http://127.0.0.1:8000/forgot-password/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await response.json();
    if (data.success) {
      alert("OTP sent to your email");
      setOtpSent(true);
    } else {
      alert(data.message);
    }
  };

  const handleVerifyOtp = async () => {
    const response = await fetch('http://127.0.0.1:8000/forgot-password/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, new_password: newPassword })
    });
    const data = await response.json();
    if (data.success) {
      alert("Password reset successful!");
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="auth-container">
      <h2>Forgot Password</h2>
      <input
        type="email"
        placeholder="Enter Registered Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      /><br />
      {!otpSent ? (
        <button onClick={handleSendOtp}>Send OTP</button>
      ) : (
        <>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          /><br />
          <input
            type="password"
            placeholder="Enter New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          /><br />
          <button onClick={handleVerifyOtp}>Reset Password</button>
        </>
      )}
    </div>
  );
}

export default ForgotPassword;
