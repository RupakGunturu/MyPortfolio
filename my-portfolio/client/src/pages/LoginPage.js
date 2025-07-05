import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthContext from '../context/AuthContext';
import './AuthPage.css';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const LoginPage = () => {
  const authContext = useContext(AuthContext);
  const { login, error, clearErrors, isAuthenticated } = authContext;

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    console.log('isAuthenticated:', isAuthenticated, 'user:', authContext.user);
    if (isAuthenticated) {
      navigate('/dashboard'); // Redirect if logged in
    }
    if (error) {
      // You can add a toast notification here
      console.error(error);
      clearErrors();
    }
  }, [error, isAuthenticated, navigate, clearErrors]);

  const { email, password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      await login({
        email,
        password,
      });
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <>
      <style>{`
        /* Mobile Responsive Styles for Login */
        @media (max-width: 768px) {
          .auth-container {
            padding: 1rem;
          }
          .auth-card {
            padding: 2rem 1.5rem;
            min-height: 480px;
          }
          .auth-title {
            font-size: 1.75rem;
          }
          .auth-subtitle {
            font-size: 0.95rem;
          }
          .auth-form input {
            font-size: 16px; /* Prevents zoom on iOS */
            padding: 1rem 1rem;
            min-height: 48px;
          }
          .auth-button {
            padding: 1rem 0;
            font-size: 1rem;
            min-height: 48px;
          }
          .auth-switch {
            font-size: 0.9rem;
          }
        }

        @media (max-width: 480px) {
          .auth-container {
            padding: 0.5rem;
          }
          .auth-card {
            padding: 1.5rem 1rem;
            min-height: 450px;
            border-radius: 20px;
          }
          .auth-title {
            font-size: 1.5rem;
          }
          .auth-subtitle {
            font-size: 0.9rem;
          }
          .auth-form input {
            padding: 0.9rem 0.9rem;
            font-size: 16px;
            min-height: 44px;
          }
          .auth-button {
            padding: 0.9rem 0;
            font-size: 0.95rem;
            min-height: 44px;
          }
          .auth-switch {
            font-size: 0.85rem;
          }
        }

        @media (max-width: 360px) {
          .auth-card {
            padding: 1rem 0.8rem;
            min-height: 420px;
          }
          .auth-title {
            font-size: 1.3rem;
          }
          .auth-form input {
            padding: 0.8rem 0.8rem;
          }
          .auth-button {
            padding: 0.8rem 0;
            font-size: 0.9rem;
          }
        }

        /* Loading spinner styles */
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

        /* Touch-friendly improvements */
        @media (hover: none) and (pointer: coarse) {
          .auth-button:hover {
            transform: none;
          }
          .auth-button:active {
            transform: scale(0.98);
          }
        }

        /* Enhanced button styles */
        .auth-button {
          position: relative;
          min-height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .auth-button:disabled {
          background: #94a3b8;
          cursor: not-allowed;
          transform: none;
        }

        /* Enhanced eye icon */
        .eye-icon {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          color: #888;
          font-size: 1.1rem;
          min-height: 44px;
          min-width: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }

        .eye-icon:hover {
          color: #2563eb;
        }
      `}</style>
      <div className="auth-container">
        <motion.div
          className="auth-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="auth-title">Welcome Back!</h1>
          <span className="login-underline"></span>
          <p className="auth-subtitle">
            Sign in to access and edit your portfolio.
          </p>
          <form onSubmit={onSubmit} className="auth-form">
            {/* Add error display logic here */}
            <div className="form-group">
              <input
                type="email"
                placeholder="Email Address"
                name="email"
                value={email}
                onChange={onChange}
                required
              />
            </div>
            <div className="form-group" style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                name="password"
                value={password}
                onChange={onChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="eye-icon"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {/* Forgot password link */}
            <div style={{ textAlign: 'right', marginBottom: 12 }}>
              <Link to="/forgot-password" style={{ fontSize: '0.95rem', color: '#2563eb', textDecoration: 'none' }}>
                Forgot password?
              </Link>
            </div>
            <motion.button
              type="submit"
              className="btn btn-primary auth-button login-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loginLoading}
            >
              {loginLoading ? (
                <>
                  <div className="loading-spinner"></div>
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </motion.button>
          </form>
          <p className="auth-switch">
            Don't have an account? <Link to="/register">Sign Up</Link>
          </p>
        </motion.div>
      </div>
    </>
  );
};

export default LoginPage; 