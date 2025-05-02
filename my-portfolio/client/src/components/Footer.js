import React from 'react';
import './Footer.css';    // ← our custom CSS
import { FaLinkedin, FaGithub, FaTwitter } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        {/* Brand */}
        <div className="footer__brand">
          <h1>Your Name</h1>
          <p>Full-Stack Developer &amp; Designer</p>
        </div>

        {/* Nav Links */}
        <ul className="footer__nav">
          {['about', 'projects', 'contact'].map((sec) => (
            <li key={sec}>
              <a href={`#${sec}`} className="footer__link">
                {sec.charAt(0).toUpperCase() + sec.slice(1)}
                <span className="footer__underline" />
              </a>
            </li>
          ))}
        </ul>

        {/* Social Icons */}
        <div className="footer__social">
          {[FaLinkedin, FaGithub, FaTwitter].map((Icon, i) => (
            <a
              key={i}
              href="/"
              className="footer__social-btn"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon />
            </a>
          ))}
        </div>
      </div>
      <div className="footer__copyright">
        © {new Date().getFullYear()} Your Name. All rights reserved.
      </div>
    </footer>
);
}
