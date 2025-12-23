import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaEyeSlash } from "react-icons/fa";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const RegisterPage = () => {
  const [form, setForm] = useState({
    fullname: '',
    username: '',
    email: '',
    password: '',
  });
  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  // Step 1: Send OTP
  const handleSendOtp = async e => {
    e.preventDefault();
    setError('');
    setInfo('');
    setRegisterLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/auth/register-send-otp`, { email: form.email });
      setStep('otp');
      setInfo('OTP sent to your email. Please check your inbox.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setRegisterLoading(false);
    }
  };

  // Step 2: Verify OTP and Register
  const handleVerifyOtp = async e => {
    e.preventDefault();
    setError('');
    setInfo('');
    setVerifyLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/auth/register-verify-otp`, {
        ...form,
        otp,
      });
      setInfo('🎉🥳 Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setInfo('');
    setResendLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/auth/register-send-otp`, { email: form.email });
      setInfo('A new OTP has been sent to your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .register-main-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5f7fa;
          padding: 0 2vw;
          overflow: hidden;
        }
        .register-card {
          background: #fff;
          border-radius: 28px;
          box-shadow: 0 8px 32px rgba(60, 60, 60, 0.13);
          max-width: 400px;
          width: 100%;
          min-height: 520px;
          padding: 2.5rem 2rem 2rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin: 2rem 0;
          /* Animation */
          opacity: 0;
          transform: translateY(40px);
          animation: fadeInCard 1s 0.2s forwards;
        }
        @keyframes fadeInCard {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .register-title {
          font-size: 2rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 0.2rem;
          letter-spacing: 1px;
          text-align: center;
          width: 100%;
        }
        .register-underline {
          display: block;
          width: 36px;
          height: 3px;
          background: #2563eb;
          border-radius: 2px;
          margin: 0.2rem auto 1.2rem auto;
        }
        .register-form {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
          opacity: 0;
          transform: translateY(20px);
          animation: fadeInForm 0.5s 1.15s forwards;
        }
        @keyframes fadeInForm {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .register-form input,
        .register-form input[type="text"] {
          padding-top: 1.3rem;   /* Increased top padding */
          padding-bottom: 0.7rem; /* Optional: adjust bottom padding */
          padding-left: 1.1rem;
          padding-right: 1.1rem;
          border: 1.5px solid #2563eb;
          border-radius: 8px;
          font-size: 1.1rem;
          background: #f8fafc;
          margin-bottom: 0.5rem;
          transition: border 0.2s, box-shadow 0.2s;
        }
        .register-form input:focus {
          outline: none;
          border-color: #059669;
          box-shadow: 0 0 0 2px #05966922;
        }
        .register-btn {
          margin-top: 1.2rem;
          padding: 0.8rem 0;
          background: #2563eb;
          color: #fff;
          font-size: 1.1rem;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s, box-shadow 0.2s, transform 0.1s;
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.08);
          will-change: transform;
          position: relative;
          min-height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .register-btn:hover:not(:disabled) {
          background: #1742a0;
          box-shadow: 0 4px 16px rgba(37, 99, 235, 0.12);
          transform: translateY(-2px) scale(1.03);
        }
        .register-btn:active:not(:disabled) {
          transform: scale(0.97);
        }
        .register-btn:disabled {
          background: #94a3b8;
          cursor: not-allowed;
          transform: none;
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
        .register-links {
          margin-top: 1.2rem;
          width: 100%;
          text-align: center;
          font-size: 0.98rem;
          opacity: 0;
          animation: fadeInForm 0.8s 1.7s forwards;
        }
        .register-links a {
          color: #2563eb;
          text-decoration: none;
          transition: color 0.2s;
        }
        .register-links a:hover {
          color: #059669;
          text-decoration: underline;
        }
        .password-wrapper {
          position: relative;
          width: 100%;
          display: flex;
          align-items: center;
        }
        .password-input {
          width: 100%;
          padding-right: 2.5rem;
        }
        .eye-icon {
          position: absolute;
          right: 0.8rem;
          top: 50%;
          transform: translateY(-50%);
          cursor: pointer;
          color: #b0b3b8;
          font-size: 1.2rem;
          user-select: none;
          transition: color 0.2s;
          min-height: 44px;
          min-width: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .eye-icon:hover {
          color: #2563eb;
        }
        .resend-otp-row {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.3rem;
          margin: 0.5rem 0 1rem 0;
          font-size: 0.98rem;
          color: #64748b;
          flex-wrap: wrap;
        }
        .resend-otp-btn {
          background: none;
          border: none;
          color: #2563eb;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.98rem;
          text-decoration: underline;
          padding: 8px 12px;
          transition: color 0.2s;
          min-height: 44px;
          min-width: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .resend-otp-btn:disabled {
          color: #b0b3b8;
          cursor: not-allowed;
          text-decoration: none;
        }
        .resend-otp-btn:hover:enabled {
          color: #1742a0;
        }
        /* For the OTP input only */
        .otp-input {
          margin-top: 1.2rem;    /* Adds space above the input */
          margin-bottom: 1.2rem; /* Adds space below the input */
          padding-top: 1.3rem;   /* Keeps placeholder lower */
          padding-bottom: 0.7rem;
          padding-left: 1.1rem;
          padding-right: 1.1rem;
          border: 1.5px solid #2563eb;
          border-radius: 8px;
          font-size: 1.1rem;
          background: #f8fafc;
          width: 100%;
          transition: border 0.2s, box-shadow 0.2s;
        }
        .typewriter {
          overflow: hidden;
          border-right: .15em solid #2563eb;
          white-space: nowrap;
          margin: 0 auto 0.5rem auto;
          letter-spacing: 1px;
          width: 0;
          animation:
            typing 1.1s steps(12, end) forwards,
            blink-caret 0.7s step-end 1.1;
        }
        @keyframes typing {
          from { width: 0 }
          to { width: 12ch }
        }
        @keyframes blink-caret {
          from, to { border-color: transparent }
          50% { border-color: #2563eb; }
        }

        /* Mobile Responsive Styles */
        @media (max-width: 768px) {
          .register-main-wrapper {
            padding: 0 1rem;
          }
          .register-card {
            padding: 2rem 1.5rem;
            min-height: 480px;
            margin: 1rem 0;
          }
          .register-title {
            font-size: 1.75rem;
          }
          .register-form input,
          .register-form input[type="text"],
          .otp-input {
            font-size: 16px; /* Prevents zoom on iOS */
            padding: 1rem 1rem;
          }
          .register-btn {
            padding: 1rem 0;
            font-size: 1rem;
            min-height: 48px;
          }
          .resend-otp-row {
            font-size: 0.9rem;
            text-align: center;
          }
          .resend-otp-btn {
            font-size: 0.9rem;
            padding: 10px 14px;
          }
        }

        @media (max-width: 480px) {
          .register-main-wrapper {
            padding: 0 0.5rem;
          }
          .register-card {
            padding: 1.5rem 1rem;
            min-height: 450px;
            border-radius: 20px;
          }
          .register-title {
            font-size: 1.5rem;
          }
          .register-form {
            gap: 0.9rem;
          }
          .register-form input,
          .register-form input[type="text"],
          .otp-input {
            padding: 0.9rem 0.9rem;
            font-size: 16px;
          }
          .register-btn {
            padding: 0.9rem 0;
            font-size: 0.95rem;
            min-height: 44px;
          }
          .register-links {
            font-size: 0.9rem;
          }
          .resend-otp-row {
            font-size: 0.85rem;
          }
          .resend-otp-btn {
            font-size: 0.85rem;
            padding: 8px 10px;
          }
        }

        @media (max-width: 360px) {
          .register-card {
            padding: 1rem 0.8rem;
            min-height: 420px;
          }
          .register-title {
            font-size: 1.3rem;
          }
          .register-form input,
          .register-form input[type="text"],
          .otp-input {
            padding: 0.8rem 0.8rem;
          }
          .register-btn {
            padding: 0.8rem 0;
            font-size: 0.9rem;
          }
        }

        /* Touch-friendly improvements */
        @media (hover: none) and (pointer: coarse) {
          .register-btn:hover {
            transform: none;
          }
          .register-btn:active {
            transform: scale(0.98);
          }
        }
      `}</style>
      <div className="register-main-wrapper">
        <div className="register-card">
          <div className="register-title typewriter">Registration</div>
          <span className="register-underline"></span>
          {error && <div style={{ color: 'red', marginBottom: 8, textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}
          {info && <div style={{ color: '#2563eb', marginBottom: 8, textAlign: 'center', fontSize: '0.9rem' }}>{info}</div>}

          {step === 'form' && (
            <form onSubmit={handleSendOtp} className="register-form">
            <input
              type="text"
                name="fullname"
              placeholder="Full Name"
                value={form.fullname}
                onChange={handleChange}
              required
            />
            <input
              type="text"
              name="username"
                placeholder="Username"
                value={form.username}
                onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
              required
            />
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="password-input"
                />
                <span
                  className="eye-icon"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
          </div>
              <button type="submit" className="register-btn" disabled={registerLoading}>
                {registerLoading ? (
                  <>
                    <div className="loading-spinner"></div>
                    Registering...
                  </>
                ) : (
                  'Register & Get OTP'
                )}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="register-form">
            <input
                type="text"
                name="otp"
                placeholder="Enter OTP from your email"
                value={otp}
                onChange={e => setOtp(e.target.value)}
              required
                className="otp-input"
              />
              <div className="resend-otp-row">
                Didn't get the code?
                <button
                  type="button"
                  className="resend-otp-btn"
                  onClick={handleResendOtp}
                  disabled={resendLoading}
                >
                  {resendLoading ? 'Sending...' : 'Resend OTP'}
                </button>
              </div>
              <button type="submit" className="register-btn" disabled={verifyLoading}>
                {verifyLoading ? (
                  <>
                    <div className="loading-spinner"></div>
                    Verifying...
                  </>
                ) : (
                  'Verify OTP & Register'
                )}
              </button>
            </form>
          )}

          <div className="register-links">
            Already have an account? <a href="/login">Sign in</a>
          </div>
        </div>
    </div>
    </>
  );
};

export default RegisterPage; 