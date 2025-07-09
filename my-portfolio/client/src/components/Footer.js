import React from 'react';
import './Footer.css';    // ← our custom CSS
// import logo from '../logo.svg'; // No longer needed
import { FaLinkedin, FaGithub } from 'react-icons/fa';

const Footer = () => (
  <footer className="custom-footer" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', width: '100%' }}>
    <div className="footer-logo-row" style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
      <img src={process.env.PUBLIC_URL + '/image/devdesk777.jpg'} alt="Dev Desk Logo" className="footer-logo" />
      <span>© 2025 My Portfolio, Inc</span>
    </div>
    <div className="footer-center" style={{ textAlign: 'center', margin: '0 1.2rem', whiteSpace: 'nowrap' }}>
      This web application was developed and designed by Rupak Gunturu
    </div>
    <div className="footer-right" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
      <a href="https://www.linkedin.com/in/rupak-gunturu-52568a2b9/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
        <FaLinkedin />
      </a>
      <a href="https://github.com/rupakgunturu" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
        <FaGithub />
      </a>
    </div>
  </footer>
);

export default Footer;
