import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthContext from '../context/AuthContext';
import Navbar from '../components/Navbar';
import './Dashboard.css';
import logo from '../logo.svg'; // Assuming you have a logo file

const Dashboard = () => {
  const authContext = useContext(AuthContext);
  const { user, loadUser } = authContext;
  const navigate = useNavigate();

  useEffect(() => {
    // On initial mount, load the user's data
    loadUser();
    // eslint-disable-next-line
  }, []);

  const onUpdatePortfolio = () => {
    // Navigate to the edit page for the user's portfolio
    // This will likely be the portfolio page with edit mode enabled
    if(user) {
      navigate(`/portfolio/${user.username}?edit=true`);
    }
  };

  const onViewPortfolio = () => {
    if(user) {
      navigate(`/portfolio/${user.username}`);
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
          <h1 className="dashboard-title">My Portfolio</h1>
          <p className="dashboard-description">
            Build your standout portfolio effortlessly! Our user-friendly platform lets you create and showcase your achievements in minutes. Enjoy a seamless experience, all in one place. Craft your professional online presence quickly and easily!
          </p>
          <div className="dashboard-buttons">
            <button className="btn-view" onClick={onViewPortfolio}>View My Portfolio</button>
            <button className="btn-update" onClick={onUpdatePortfolio}>Update My Portfolio</button>
          </div>
          <div className="dashboard-share">
            <h2>Share Your Portfolio on</h2>
            <div className="social-icons">
              {/* Add your social share icons/logic here */}
              <div className="icon">F</div>
              <div className="icon">W</div>
              <div className="icon">E</div>
              <div className="icon">M</div>
              <div className="icon">I</div>
              <div className="icon">T</div>
              <div className="icon">In</div>
              <div className="icon">Tw</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard; 