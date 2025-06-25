import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import './Navbar.css';
import logo from '../logo.svg'; 

const Navbar = () => {
  const authContext = useContext(AuthContext);
  const { isAuthenticated, logout, user } = authContext;
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">
          <img src={logo} alt="Logo" />
          <span>MY PORTFOLIO</span>
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
    </nav>
  );
};

export default Navbar;