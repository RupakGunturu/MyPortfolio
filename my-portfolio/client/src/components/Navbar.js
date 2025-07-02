import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import './Navbar.css';
import { motion } from 'framer-motion';
// import logo from '../logo.svg';

const Navbar = () => {
  const authContext = useContext(AuthContext);
  const { isAuthenticated, logout, user } = authContext;
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.nav
      className="navbar"
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="navbar-logo">
        <Link to="/">
          <img src={process.env.PUBLIC_URL + '/image/devdesk777.jpg'} alt="Dev Desk Logo" className="navbar-logo" />
          <span>DevDesk</span>
        </Link>
      </div>
      <div className="navbar-links">
        {isAuthenticated && user ? (
          <>
            <span className="welcome-message">
              WELCOME {(user && (user.fullname || user.name) ? (user.fullname || user.name).toUpperCase() : 'USER')}!
            </span>
            <button onClick={onLogout} className="logout-button">
              LOGOUT
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="nav-link">Register</Link>
          </>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;