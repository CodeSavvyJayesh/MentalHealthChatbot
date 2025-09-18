import React, { useState } from 'react';

function Signup({ onSignupSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  const handleSendOtp = async () => {
    if (!email || !password || !confirmPassword) {
      return alert("Please fill all the fields");
    }
    if (password !== confirmPassword) {
      return alert("Passwords do not match");
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        alert("OTP sent to your email");
        setOtpSent(true);
      } else {
        alert(data.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      alert("Error sending OTP");
    }
  };

  const handleVerifyAndSignup = async () => {
    if (!otp) return alert("Please enter OTP");

    try {
      const response = await fetch('http://127.0.0.1:8000/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, otp })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        alert("Signup successful!");
        if (onSignupSuccess) onSignupSuccess();
      } else {
        alert(data.message || "OTP verification failed");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      alert("Error verifying OTP");
    }
  };

  return (
    <div className="auth-container">
      <h2>Signup</h2>
      {!otpSent ? (
        <>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          /><br />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          /><br />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          /><br />
          <button onClick={handleSendOtp}>Send OTP</button>
        </>
      ) : (
        <>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          /><br />
          <button onClick={handleVerifyAndSignup}>Verify & Signup</button>
        </>
      )}
    </div>
  );
}

export default Signup;
