import React from 'react';

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <div style={styles.socialIcons}>
        <a href="https://linkedin.com" style={styles.icon} aria-label="LinkedIn">🔗</a>
        <a href="https://github.com" style={styles.icon} aria-label="GitHub">🐱</a>
        <a href="https://twitter.com" style={styles.icon} aria-label="Twitter">🐦</a>
      </div>
      <ul style={styles.footerLinks}>
        <li><a href="#privacy" style={styles.footerLink}>Privacy Policy</a></li>
        <li><a href="#terms" style={styles.footerLink}>Terms of Service</a></li>
        <li><a href="#contact" style={styles.footerLink}>Contact</a></li>
      </ul>
      <p style={styles.copyright}>
        © {new Date().getFullYear()} Mortal Prime. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;

const styles = {
  footer: {
    backgroundColor: '#0F172A',
    color: '#fff',
    textAlign: 'center',
    padding: '2rem 1rem',
    marginTop: 'auto',
  },
  socialIcons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    marginBottom: '1rem',
  },
  icon: {
    fontSize: '1.5rem',
    textDecoration: 'none',
    color: '#fff',
    transition: 'color 0.3s',
  },
  footerLinks: {
    listStyle: 'none',
    padding: 0,
    display: 'flex',
    justifyContent: 'center',
    gap: '1.5rem',
    marginBottom: '1rem',
  },
  footerLink: {
    textDecoration: 'none',
    color: '#fff',
    transition: 'color 0.3s',
  },
  copyright: {
    fontSize: '0.9rem',
  },
};
