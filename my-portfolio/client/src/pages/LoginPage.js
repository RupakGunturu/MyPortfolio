import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiLock } from 'react-icons/fi';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // --- Authentication Logic Placeholder ---
    // In a real application, you would make an API call here.
    setTimeout(() => {
      if (username === 'admin' && password === 'password') {
        alert('Login successful!');
        // Redirect to the dashboard or update app state
      } else {
        setError('Invalid username or password.');
      }
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div style={styles.page}>
      <motion.div
        initial={{ opacity: 0, y: -40, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={styles.container}
      >
        <div style={styles.header}>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={styles.title}
          >
            Admin Login
          </motion.h2>
          <p style={styles.subtitle}>Access your portfolio dashboard</p>
        </div>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <FiUser style={styles.icon} />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <FiLock style={styles.icon} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          {error && <p style={styles.errorMessage}>{error}</p>}

          <motion.button
            type="submit"
            style={styles.loginButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isLoading}
          >
            {isLoading ? (
              <span style={styles.spinner}></span>
            ) : (
              'Log In Securely'
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

const styles = {
  page: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    fontFamily: "'Inter', sans-serif",
  },
  container: {
    width: '100%',
    maxWidth: '420px',
    padding: '48px',
    background: '#ffffff',
    borderRadius: '24px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
    textAlign: 'center',
  },
  header: {
    marginBottom: '32px',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1f2937',
    margin: 0,
  },
  subtitle: {
    fontSize: '1rem',
    color: '#6b7280',
    marginTop: '8px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    position: 'relative',
  },
  input: {
    width: '100%',
    padding: '16px 16px 16px 48px',
    border: '1px solid #d1d5db',
    borderRadius: '12px',
    fontSize: '1rem',
    color: '#1f2937',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
  },
  icon: {
    position: 'absolute',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af',
    fontSize: '1.2rem',
  },
  errorMessage: {
    color: '#ef4444',
    fontSize: '0.875rem',
    margin: '-10px 0 10px',
  },
  loginButton: {
    padding: '16px',
    border: 'none',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    color: '#ffffff',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.2)',
  },
  spinner: {
    width: '20px',
    height: '20px',
    border: '3px solid rgba(255, 255, 255, 0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 1s linear infinite',
  },
  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  },
};

export default LoginPage; 