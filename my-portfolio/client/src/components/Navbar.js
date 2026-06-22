import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { useScrollDirection } from '../hooks/useScrollDirection';
import './Navbar.css';

const Navbar = () => {
  const authContext = useContext(AuthContext);
  const { isAuthenticated, logout, user } = authContext;
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navbarRef = useRef(null);

  const { scrollDirection, scrollY } = useScrollDirection();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

  const onLogout = () => {
    logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const isHidden =
    scrollDirection === 'down' &&
    scrollY > 56 &&
    !isMobileMenuOpen;

  const displayName =
    user && (user.fullname || user.name)
      ? (user.fullname || user.name).toUpperCase()
      : 'USER';

  return (
    <nav
      ref={navbarRef}
      className={`navbar${isHidden ? ' navbar--hidden' : ''}`}
    >
      <div className="navbar-logo">
        <Link to="/dashboard" onClick={closeMobileMenu}>
          <img
            src={process.env.PUBLIC_URL + '/logo192.png'}
            alt="Dev Desk Logo"
            className="navbar-logo-icon"
          />
          <span>DevDesk</span>
        </Link>
      </div>

      <button
        className={`mobile-menu-toggle${isMobileMenuOpen ? ' active' : ''}`}
        onClick={toggleMobileMenu}
        aria-label="Toggle mobile menu"
        aria-expanded={isMobileMenuOpen}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div className={`navbar-links${isMobileMenuOpen ? ' active' : ''}`}>
        {isAuthenticated && user ? (
          <>
            <span className="welcome-message">WELCOME {displayName}!</span>
            <button onClick={onLogout} className="logout-button">
              LOGOUT
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link" onClick={closeMobileMenu}>
              Login
            </Link>
            <Link to="/register" className="nav-link" onClick={closeMobileMenu}>
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
