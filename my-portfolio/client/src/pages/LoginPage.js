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

  const onSubmit = (e) => {
    e.preventDefault();
    login({
      email,
      password,
    });
  };

  return (
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
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                color: '#888',
                fontSize: '1.1rem',
              }}
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
          >
            Login
          </motion.button>
        </form>
        <p className="auth-switch">
          Don't have an account? <Link to="/register">Sign Up</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage; 