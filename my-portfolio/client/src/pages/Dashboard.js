import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthContext from '../context/AuthContext';
import Navbar from '../components/Navbar';
import './Dashboard.css';
import logo from '../logo.svg'; // Assuming you have a logo file

const Dashboard = () => {
  const authContext = useContext(AuthContext);
  const { user, isAuthenticated } = authContext;
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Show loading if user data is not available yet
  if (!isAuthenticated || !user) {
    return (
      <div className="dashboard-container">
        <Navbar />
        <div className="dashboard-content">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '50vh',
            fontSize: '1.2rem',
            color: '#666'
          }}>
            Loading dashboard...
          </div>
        </div>
      </div>
    );
  }

  const onUpdatePortfolio = () => {
    console.log('onUpdatePortfolio called');
    console.log('User object:', user);
    console.log('User username:', user?.username);
    
    // Navigate to the edit page for the user's portfolio
    // This will likely be the portfolio page with edit mode enabled
    if(user && user.username) {
      const portfolioUrl = `/portfolio/${user.username}?edit=true`;
      console.log('Navigating to:', portfolioUrl);
      navigate(portfolioUrl);
    } else {
      console.error('User or username not available:', user);
      alert('User data not loaded. Please try again.');
    }
  };

  const onViewPortfolio = () => {
    if(user) {
      navigate(`/portfolio/${user.username}`);
    }
  };

  const onSharePortfolio = () => {
    if (user) {
      const portfolioUrl = `${window.location.origin}/portfolio/${user.username}`;
      navigator.clipboard.writeText(portfolioUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
      });
    }
  };

  return (
    <div className="dashboard-container">
      <Navbar />
      <div className="dashboard-content">
        <motion.div
          className="dashboard-card"
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="dashboard-logo">
            <img src={logo} alt="My Portfolio Logo" />
          </div>
          <h1 className="dashboard-title">Welcome, {user.fullname || user.username}!</h1>
          <p className="dashboard-description">
            Build your standout portfolio effortlessly! Our user-friendly platform lets you create and showcase your achievements in minutes. Enjoy a seamless experience, all in one place. Craft your professional online presence quickly and easily!
          </p>
          <div className="dashboard-buttons">
            <button className="btn-view" onClick={onViewPortfolio}>View My Portfolio</button>
            <button className="btn-update" onClick={onUpdatePortfolio}>Update My Portfolio</button>
          </div>
          <div className="dashboard-share-section">
            <h2 className="share-title">Share Your Portfolio</h2>
            <p className="share-description">
              Here's the link to your public portfolio. Share it with the world!
            </p>
            <div className="share-link-container">
              <input 
                type="text" 
                value={user ? `${window.location.origin}/portfolio/${user.username}` : ''} 
                readOnly 
                className="share-link-input"
              />
              <button className="btn-copy" onClick={onSharePortfolio}>
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard; 