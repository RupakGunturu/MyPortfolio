import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-container">
      <motion.div 
        className="landing-content"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <h1 className="landing-title">
          Create and Share Your Professional Portfolio in Minutes
        </h1>
        <p className="landing-subtitle">
          Showcase your skills, projects, and experiences with a sleek, modern, and customizable portfolio. Perfect for developers, designers, and creators.
        </p>
        <div className="landing-cta-buttons">
          <Link to="/register">
            <motion.button 
              className="btn btn-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started for Free
            </motion.button>
          </Link>
          <Link to="/login">
            <motion.button 
              className="btn btn-secondary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Login
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default LandingPage; 