import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import './Navbar.css';
import { motion } from 'framer-motion';
// import logo from '../logo.svg';

const Navbar = () => {
  const authContext = useContext(AuthContext);
  const { isAuthenticated, logout, user } = authContext;
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(window.scrollY);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY < 10) {
        setShowNavbar(true);
      } else if (window.scrollY > lastScrollY) {
        setShowNavbar(false); // scrolling down
      } else {
        setShowNavbar(true); // scrolling up
      }
      setLastScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const onLogout = () => {
    logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.nav
      className={`navbar${showNavbar ? '' : ' navbar--hidden'}`}
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="navbar-logo">
        <Link to="/" onClick={closeMobileMenu}>
          <img src={process.env.PUBLIC_URL + '/image/devdesk777.jpg'} alt="Dev Desk Logo" className="navbar-logo" />
          <span>DevDesk</span>
        </Link>
      </div>
      
      {/* Mobile Menu Toggle */}
      <button 
        className={`mobile-menu-toggle ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={toggleMobileMenu}
        aria-label="Toggle mobile menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div className={`navbar-links ${isMobileMenuOpen ? 'active' : ''}`}>
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
            <Link to="/login" className="nav-link" onClick={closeMobileMenu}>Login</Link>
            <Link to="/register" className="nav-link" onClick={closeMobileMenu}>Register</Link>
          </>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;