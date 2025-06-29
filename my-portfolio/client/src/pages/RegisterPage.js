import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  // Step 1: Send OTP
  const handleSendOtp = async e => {
    e.preventDefault();
    setError('');
    setInfo('');
    try {
      await axios.post('/api/auth/register-send-otp', { email: form.email });
      setStep('otp');
      setInfo('OTP sent to your email. Please check your inbox.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    }
  };

  // Step 2: Verify OTP and Register
  const handleVerifyOtp = async e => {
    e.preventDefault();
    setError('');
    setInfo('');
    try {
      await axios.post('/api/auth/register-verify-otp', {
        ...form,
        otp,
      });
      setInfo('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Register</h1>
        {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
        {info && <div style={{ color: '#2563eb', marginBottom: 8 }}>{info}</div>}

        {step === 'form' && (
          <form onSubmit={handleSendOtp} className="auth-form">
            <div className="form-group">
              <input
                type="text"
                name="fullname"
                placeholder="Full Name"
                value={form.fullname}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={form.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary auth-button">
              Register & Get OTP
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="auth-form">
            <div className="form-group">
              <input
                type="text"
                name="otp"
                placeholder="Enter OTP from your email"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary auth-button">
              Verify OTP & Register
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default RegisterPage; 