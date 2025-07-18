import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');
  const [sendOtpLoading, setSendOtpLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // Here you would send a request to your backend to send OTP
  };

  const handleSendOtp = async () => {
    if (!email) {
      setError('Please enter your registered email.');
      return;
    }
    setError('');
    setInfo('Sending OTP...');
    setSendOtpLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/send-forgot-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setInfo('OTP sent to your email!');
        setOtpSent(true);
        setOtpCooldown(30);
        // Start cooldown timer
        const interval = setInterval(() => {
          setOtpCooldown(prev => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(data.message || 'Failed to send OTP.');
        setInfo('');
      }
    } catch (err) {
      setError('Failed to send OTP.');
      setInfo('');
    } finally {
      setSendOtpLoading(false);
    }
  };

  const handleUpdate = async () => {
    setError('');
    setInfo('');
    if (!email || !password || !confirmPassword || !otp) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setUpdateLoading(true);
    // Call backend to verify OTP and update password
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword: password }),
      });
      const data = await res.json();
      if (res.ok) {
        setInfo('🎉 Password updated successfully! You can now login.');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        if (data.message === 'You entered the same password as before.') {
          setError('You entered the same password as before. Please choose a new password.');
        } else {
          setError(data.message || 'Failed to update password.');
        }
      }
    } catch (err) {
      setError('Failed to update password.');
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .forgot-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5f7fa;
          padding: 0 2vw;
        }
        .forgot-card {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 4px 24px rgba(59, 130, 246, 0.10);
          max-width: 480px;
          width: 100%;
          padding: 2.5rem 2rem 2rem 2rem;
        }
        .forgot-title {
          font-size: 2rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 0.2rem;
          text-align: left;
        }
        .forgot-underline {
          display: block;
          width: 48px;
          height: 4px;
          background: #2563eb;
          border-radius: 2px;
          margin-bottom: 2rem;
          animation: underlineIn 0.7s cubic-bezier(0.4,0,0.2,1) forwards;
          transform: scaleX(0);
        }
        @keyframes underlineIn {
          to { transform: scaleX(1); }
        }
        .forgot-form label {
          font-size: 1rem;
          color: #1e293b;
          margin-bottom: 0.2rem;
          display: block;
        }
        .forgot-form input[type="email"],
        .forgot-form input[type="password"],
        .forgot-form input[type="text"] {
          width: 100%;
          padding: 0.9rem 1rem;
          border: 1.5px solid #d1d5db;
          border-radius: 8px;
          font-size: 1rem;
          background: #f8fafc;
          margin-bottom: 0.7rem;
          transition: border 0.2s;
        }
        .forgot-form input:focus {
          outline: none;
          border-color: #2563eb;
        }
        .show-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.7rem;
        }
        .forgot-btn-row {
          display: flex;
          gap: 1rem;
          margin: 1.2rem 0 0.7rem 0;
        }
        .forgot-btn, .verify-btn {
          flex: 1;
          padding: 0.7rem 0;
          border: none;
          border-radius: 6px;
          font-size: 1.08rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
          min-height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .forgot-btn {
          background: #2563eb;
          color: #fff;
        }
        .forgot-btn:hover:not(:disabled) { background: #1742a0; }
        .verify-btn {
          background: #22c55e;
          color: #fff;
        }
        .verify-btn:hover:not(:disabled) { background: #15803d; }
        .update-btn {
          width: 100%;
          padding: 0.7rem 0;
          background: #38bdf8;
          color: #fff;
          border: none;
          border-radius: 6px;
          font-size: 1.08rem;
          font-weight: 600;
          margin-bottom: 0.7rem;
          cursor: pointer;
          transition: background 0.2s;
          min-height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .update-btn:hover:not(:disabled) { background: #0ea5e9; }
        .update-btn:disabled {
          background: #94a3b8;
          cursor: not-allowed;
        }
        .forgot-switch {
          margin-top: 1.2rem;
          font-size: 0.98rem;
          color: #475569;
          text-align: center;
        }
        .forgot-switch a {
          color: #2563eb;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s;
        }
        .forgot-switch a:hover {
          text-decoration: underline;
        }
        .send-otp-btn {
          background: none;
          border: none;
          color: #2563eb;
          font-weight: 600;
          cursor: pointer;
          font-size: 1rem;
          padding: 8px 12px;
          min-width: 80px;
          min-height: 44px;
          transition: color 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .send-otp-btn:disabled {
          color: #94a3b8;
          cursor: not-allowed;
        }
        .send-otp-btn:hover:enabled {
          color: #AFE1AF;
        }
        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: #fff;
          animation: spin 1s ease-in-out infinite;
          margin-right: 8px;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .eye-icon {
          position: absolute;
          right: 0.8rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #2563eb;
          font-size: 1.1rem;
          padding: 8px;
          min-height: 44px;
          min-width: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }
        .eye-icon:hover {
          color: #1742a0;
        }

        /* Mobile Responsive Styles */
        @media (max-width: 768px) {
          .forgot-container {
            padding: 0 1rem;
          }
          .forgot-card {
            padding: 2rem 1.5rem;
            margin: 1rem 0;
          }
          .forgot-title {
            font-size: 1.75rem;
          }
          .forgot-form input[type="email"],
          .forgot-form input[type="password"],
          .forgot-form input[type="text"] {
            font-size: 16px; /* Prevents zoom on iOS */
            padding: 1rem 1rem;
            min-height: 48px;
          }
          .update-btn {
            padding: 1rem 0;
            font-size: 1rem;
            min-height: 48px;
          }
          .send-otp-btn {
            font-size: 0.9rem;
            padding: 10px 14px;
            min-height: 48px;
          }
          .forgot-switch {
            font-size: 0.9rem;
          }
        }

        @media (max-width: 480px) {
          .forgot-container {
            padding: 0 0.5rem;
          }
          .forgot-card {
            padding: 1.5rem 1rem;
            border-radius: 12px;
          }
          .forgot-title {
            font-size: 1.5rem;
          }
          .forgot-form input[type="email"],
          .forgot-form input[type="password"],
          .forgot-form input[type="text"] {
            padding: 0.9rem 0.9rem;
            font-size: 16px;
            min-height: 44px;
          }
          .update-btn {
            padding: 0.9rem 0;
            font-size: 0.95rem;
            min-height: 44px;
          }
          .send-otp-btn {
            font-size: 0.85rem;
            padding: 8px 10px;
            min-height: 44px;
          }
          .forgot-switch {
            font-size: 0.85rem;
          }
        }

        @media (max-width: 360px) {
          .forgot-card {
            padding: 1rem 0.8rem;
          }
          .forgot-title {
            font-size: 1.3rem;
          }
          .forgot-form input[type="email"],
          .forgot-form input[type="password"],
          .forgot-form input[type="text"] {
            padding: 0.8rem 0.8rem;
          }
          .update-btn {
            padding: 0.8rem 0;
            font-size: 0.9rem;
          }
        }

        /* Touch-friendly improvements */
        @media (hover: none) and (pointer: coarse) {
          .update-btn:hover {
            background: #38bdf8;
          }
          .send-otp-btn:hover {
            color: #2563eb;
          }
        }
      `}</style>
      <div className="forgot-container">
        <motion.div
          className="forgot-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="forgot-title">Forgot password reset it</div>
          <span className="forgot-underline"></span>
          <form onSubmit={handleSubmit} className="forgot-form">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />

            <label>Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                style={{ paddingRight: "2.5rem" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="eye-icon"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <label>Confirm Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                style={{ paddingRight: "2.5rem" }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="eye-icon"
                tabIndex={-1}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <label>OTP</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '0.7rem' }}>
              <input
                type="text"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                placeholder="Enter your otp"
                required
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={otpCooldown > 0 || sendOtpLoading}
                className="send-otp-btn"
              >
                {sendOtpLoading ? (
                  <>
                    <div className="loading-spinner"></div>
                    Sending...
                  </>
                ) : otpCooldown > 0 ? (
                  `Resend (${otpCooldown})`
                ) : (
                  'Send OTP'
                )}
              </button>
            </div>
            {error && <div style={{ color: '#ef4444', marginBottom: '0.7rem', fontWeight: 500, textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}
            {info && <div style={{ color: '#2563eb', marginBottom: '0.7rem', fontWeight: 500, textAlign: 'center', fontSize: '0.9rem' }}>{info}</div>}

            <button type="button" className="update-btn" onClick={handleUpdate} disabled={updateLoading}>
              {updateLoading ? (
                <>
                  <div className="loading-spinner"></div>
                  Updating...
                </>
              ) : (
                'Update'
              )}
            </button>
          </form>
          <div className="forgot-switch">
            I know my password? <Link to="/login">Login</Link>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default ForgotPasswordPage; 