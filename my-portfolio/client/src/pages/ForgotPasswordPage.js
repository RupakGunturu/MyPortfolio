import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // Here you would send a request to your backend
  };

  return (
    <div className="auth-container">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="auth-title">Forgot Password</h1>
        <p className="auth-subtitle">
          Enter your email address and we'll send you a link to reset your password.
        </p>
        {submitted ? (
          <div style={{ textAlign: 'center', margin: '24px 0' }}>
            <p style={{ color: '#2563eb', fontWeight: 500 }}>
              If an account with that email exists, a reset link has been sent.
            </p>
            <Link to="/login" style={{ color: '#2563eb', textDecoration: 'underline' }}>
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <input
                type="email"
                placeholder="Email Address"
                name="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <motion.button
              type="submit"
              className="btn btn-primary auth-button login-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Send Reset Link
            </motion.button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage; 