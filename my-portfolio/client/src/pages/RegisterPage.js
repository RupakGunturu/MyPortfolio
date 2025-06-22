import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthContext from '../context/AuthContext';
import './AuthPage.css';

const RegisterPage = () => {
  const authContext = useContext(AuthContext);
  const { register, error, clearErrors, isAuthenticated } = authContext;

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard'); // Redirect if logged in
    }
    if (error) {
      // You can add a toast notification here
      console.error(error);
      clearErrors();
    }
  }, [error, isAuthenticated, navigate, clearErrors]);

  const { name, username, email, password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      // This state is local to the component, not from context
      // You might want a different state for this kind of validation error
      return;
    }
    register({
      name,
      username,
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
        <h1 className="auth-title">Create Your Account</h1>
        <p className="auth-subtitle">
          Join now to create your personal portfolio.
        </p>
        <form onSubmit={onSubmit} className="auth-form">
          {/* Consider a more robust error display */}
          <div className="form-group">
            <input
              type="text"
              placeholder="Full Name"
              name="name"
              value={name}
              onChange={onChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Username (for your public URL)"
              name="username"
              value={username}
              onChange={onChange}
              required
            />
          </div>
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
          <div className="form-group">
            <input
              type="password"
              placeholder="Password (min. 6 characters)"
              name="password"
              value={password}
              onChange={onChange}
              required
            />
          </div>
          <motion.button
            type="submit"
            className="btn btn-primary auth-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Register
          </motion.button>
        </form>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Log In</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterPage; 