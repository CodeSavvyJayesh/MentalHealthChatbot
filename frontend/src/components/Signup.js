// import React, { useState } from 'react';

// function Signup({ onSignupSuccess }) {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [otpSent, setOtpSent] = useState(false);
//   const [otp, setOtp] = useState('');

//   const handleSendOtp = async () => {
//     if (!email || !password || !confirmPassword) {
//       return alert("Please fill all the fields");
//     }
//     if (password !== confirmPassword) {
//       return alert("Passwords do not match");
//     }

//     try {
//       const response = await fetch('http://127.0.0.1:8000/send-otp', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email })
//       });

//       const data = await response.json();
//       if (response.ok && data.success) {
//         alert("OTP sent to your email");
//         setOtpSent(true);
//       } else {
//         alert(data.message || "Failed to send OTP");
//       }
//     } catch (error) {
//       console.error("Error sending OTP:", error);
//       alert("Error sending OTP");
//     }
//   };

//   const handleVerifyAndSignup = async () => {
//     if (!otp) return alert("Please enter OTP");

//     try {
//       const response = await fetch('http://127.0.0.1:8000/verify-otp', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, password, otp })
//       });

//       const data = await response.json();
//       if (response.ok && data.success) {
//         alert("Signup successful!");
//         if (onSignupSuccess) onSignupSuccess();
//       } else {
//         alert(data.message || "OTP verification failed");
//       }
//     } catch (error) {
//       console.error("Error verifying OTP:", error);
//       alert("Error verifying OTP");
//     }
//   };

//   return (
//     <div className="auth-container">
//       <h2>Signup</h2>
//       {!otpSent ? (
//         <>
//           {/* <input
//             type="email"
//             placeholder="Email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//           /> */}
//            {/* Email Field */}
//            {/* Email Field */}
//           <input
//             type="email"
//             placeholder="Email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//           />

//           {/* Email validation */}
//           {email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
//             <span
//               style={{
//                 color: "red",
//                 fontSize: "14px",
//                 display: "block",
//                 marginTop: "5px",
//                 marginLeft: "18px",  
//                 textAlign: "left"
//               }}
//             >
//               Please enter a valid email address
//             </span>
//           )}


//           <br />


//           {/* <input
//             type="password"
//             placeholder="Password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//           /><br />
//           <input
//             type="password"
//             placeholder="Confirm Password"
//             value={confirmPassword}
//             onChange={(e) => setConfirmPassword(e.target.value)}
//           /> */}

//           <input
//             type="password"
//             placeholder="Password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//           />

//           {/* Password length validation */}
//           {password && password.length < 8 && (
//             <span style={{ color: "red", fontSize: "14px", display: "block", marginTop: "5px",textAlign: "left",  marginLeft: "18px" }}>
//               Password must be at least 8 characters
//             </span>
//           )}

//           {/* Special character validation */}
//           {password && !/[!@#$%^&*(),.?":{}|<>]/.test(password) && (
//             <span style={{ color: "red", fontSize: "14px", display: "block", marginTop: "5px",textAlign: "left",  marginLeft: "18px" }}>
//               Password must contain at least one special character
//             </span>
//           )}

//           {/* Confirm Password Field */}
//           <input
//             type="password"
//             placeholder="Confirm Password"
//             value={confirmPassword}
//             onChange={(e) => setConfirmPassword(e.target.value)}
//             style={{ marginTop: "12px" }}
//           />

//           {/* Confirm password match validation */}
//           {confirmPassword && confirmPassword !== password && (
//             <span style={{ color: "red", fontSize: "14px", display: "block", marginTop: "5px" }}>
//               Passwords do not match
//             </span>
//           )}

         

          
          
//           <br />
//           <button onClick={handleSendOtp}>Send OTP</button>
//         </>
//       ) : (
//         <>
//           <input
//             type="text"
//             placeholder="Enter OTP"
//             value={otp}
//             onChange={(e) => setOtp(e.target.value)}
//           /><br />
//           <button onClick={handleVerifyAndSignup}>Verify & Signup</button>
//         </>
//       )}
//     </div>
//   );
// }

// export default Signup;


import React, { useState } from 'react';

function Signup({ onSignupSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');       // For success/error messages
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  const handleSendOtp = async () => {
    setMessage(''); // Clear previous messages
    if (!email || !password || !confirmPassword) {
      setMessage('Please fill all the fields');
      setMessageType('error');
      return;
    }
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      setMessageType('error');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setMessage('OTP sent to your email');
        setMessageType('success');
        setOtpSent(true);
      } else {
        setMessage(data.message || 'Failed to send OTP');
        setMessageType('error');
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      setMessage('Error sending OTP');
      setMessageType('error');
    }
  };

  const handleVerifyAndSignup = async () => {
    setMessage('');
    if (!otp) {
      setMessage('Please enter OTP');
      setMessageType('error');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, otp })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setMessage('Signup successful!');
        setMessageType('success');
        if (onSignupSuccess) onSignupSuccess();
      } else {
        setMessage(data.message || 'OTP verification failed');
        setMessageType('error');
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setMessage('Error verifying OTP');
      setMessageType('error');
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
          />
          {/* Email validation */}
          {email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
            <span style={{ color: 'red', fontSize: '14px', display: 'block', marginTop: '5px', marginLeft: '18px',textAlign: 'left' }}>
              Please enter a valid email address
            </span>
          )}
          <br />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
         

          {password && password.length < 8 && (
          <span
            style={{
              color: 'red',
              fontSize: '14px',
              display: 'block',
              marginTop: '5px',
              paddingLeft: '18px', // matches input padding
              textAlign: 'left',
            }}
          >
            Password must be at least 8 characters
          </span>
          )}

          {password && !/[!@#$%^&*(),.?":{}|<>]/.test(password) && (
              <span
                style={{
                  color: 'red',
                  fontSize: '14px',
                  display: 'block',
                  marginTop: '5px',
                  paddingLeft: '18px', // matches input padding
                  textAlign: 'left',
                }}
              >
                Password must contain at least one special character
              </span>
            )}


          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ marginTop: '12px' }}
          />
          {confirmPassword && confirmPassword !== password && (
            <span style={{ color: 'red', fontSize: '14px', display: 'block', marginTop: '5px', marginLeft: '18px' }}>
              Passwords do not match
            </span>
          )}

          {/* Inline success/error message */}
          {message && (
            <span
              style={{
                color: messageType === 'success' ? 'green' : 'red',
                fontSize: '14px',
                display: 'block',
                marginTop: '10px',
                marginLeft: '18px'
              }}
            >
              {message}
            </span>
          )}

          <br />
          <button onClick={handleSendOtp}>Send OTP</button>
        </>
      ) : (
        <>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <br />

          {/* Inline success/error message for OTP verification */}
          {message && (
            <span
              style={{
                color: messageType === 'success' ? 'green' : 'red',
                fontSize: '14px',
                display: 'block',
                marginTop: '10px',
                marginLeft: '18px'
              }}
            >
              {message}
            </span>
          )}

          <button onClick={handleVerifyAndSignup} style={{ marginTop: '12px' }}>
            Verify & Signup
          </button>
        </>
      )}
    </div>
  );
}

export default Signup;

