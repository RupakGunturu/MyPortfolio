import React, { useState } from 'react';

const Navbar = () => {
  const [isMobile, setIsMobile] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobile(!isMobile);
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.brand}>Mortal Prime</div>
      <div style={styles.hamburger} onClick={toggleMobileMenu}>
        ☰
      </div>
      <ul style={{ ...styles.navLinks, display: isMobile ? 'flex' : 'none' }}>
        <li style={styles.navItem}><a href="#home" style={styles.navLink}>Home</a></li>
        <li style={styles.navItem}><a href="#about" style={styles.navLink}>About</a></li>
        <li style={styles.navItem}><a href="#projects" style={styles.navLink}>Projects</a></li>
        <li style={styles.navItem}><a href="#contact" style={styles.navLink}>Contact</a></li>
      </ul>
    </nav>
  );
};

const styles = {
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#0F172A',
    color: 'white',
    position: 'fixed',
    width: '100%',
    top: 0,
    zIndex: 1000,
  },
  brand: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#00BFFF',
  },
  hamburger: {
    fontSize: '2rem',
    cursor: 'pointer',
    display: 'none',
  },
  navLinks: {
    display: 'flex',
    listStyle: 'none',
    gap: '1.5rem',
  },
  navItem: {
    fontSize: '1.2rem',
  },
  navLink: {
    textDecoration: 'none',
    color: 'white',
    transition: 'color 0.3s',
  },
  '@media (maxWidth: 768px)': {
    hamburger: {
      display: 'block',
    },
    navLinks: {
      flexDirection: 'column',
      alignItems: 'center',
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      backgroundColor: '#0F172A',
    },
  },
};

export default Navbar;
