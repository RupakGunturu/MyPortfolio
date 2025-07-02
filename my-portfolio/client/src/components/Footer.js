import React from 'react';
import './Footer.css';    // ← our custom CSS
import logo from '../logo.svg'; // Use your actual logo path
import { FaInstagram, FaFacebook, FaTwitter } from 'react-icons/fa';

const Footer = () => (
  <footer className="custom-footer">
    <div className="footer-left">
      <img src="/footer-logo.png" alt="Logo" className="footer-logo" />
      <span>© 2025 My Portfolio, Inc</span>
    </div>
    <div className="footer-center">
      This web application was developed and designed by Rupak Gunturu 
    </div>
    <div className="footer-right">
      <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
        <FaInstagram />
      </a>
      <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
        <FaFacebook />
      </a>
      <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
        <FaTwitter />
      </a>
    </div>
  </footer>
);

export default Footer;
