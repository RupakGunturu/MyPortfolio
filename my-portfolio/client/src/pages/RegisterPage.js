import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthContext from '../context/AuthContext';
import './AuthPage.css';

const RegisterPage = () => {
  const authContext = useContext(AuthContext);
  const { register, error, clearErrors } = authContext;

  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
    email: '',
    password: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      console.error(error);
      clearErrors();
    }
  }, [error, clearErrors]);

  const { fullname, username, email, password } = formData;

  const onChange = (e) => {
    console.log('CHANGED:', e.target.name, e.target.value);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      return;
    }
    console.log('REGISTER FORM DATA:', formData);
    const result = await register({
      fullname,
      username,
      email,
      password,
    });
    
    // If registration is successful, redirect to login
    if (result && result.success) {
      navigate('/login');
    }
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
          <div className="form-group">
            <input
              type="text"
              placeholder="Full Name"
              name="fullname"
              value={fullname}
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