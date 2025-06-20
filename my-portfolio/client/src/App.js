import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Hero from './components/Hero';
import About from './components/About';
import Certificate from './components/Certificate';
import Experience from './components/Experiences';
import Skills from './components/Skills';
import Contact from './components/Contact';
import ProjectCard from './components/ProjectCard';
import './components/Certificate.css';

// Admin password (should be moved to .env or handled securely in production)
const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD || 'admin123';

const App = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [mode, setMode] = useState(null); // 'editContent' | 'addSkill'
  const [showDropdown, setShowDropdown] = useState(false);

  const handleEditClick = () => {
    if (!isAdmin) {
      const pwd = prompt('Enter admin password:');
      if (pwd === ADMIN_PASSWORD) setIsAdmin(true);
      else {
        alert('Incorrect password');
        return;
      }
    }
    setShowDropdown((v) => !v);
  };

  const selectMode = (m) => {
    setMode(m);
    setShowDropdown(false);
  };

  return (
    <div style={styles.appContainer}>
      <div style={styles.headerWrapper}>
        <Navbar />
        <button
          onClick={handleEditClick}
          style={isAdmin ? styles.editBtnActive : styles.editBtn}
        >
          Edit
        </button>
        {isAdmin && showDropdown && (
          <div style={styles.dropdown}>
            <button
              onClick={() => selectMode('editContent')}
              style={styles.dropdownItem}
            >
              Edit Content
            </button>
            <button
              onClick={() => selectMode('addSkill')}
              style={styles.dropdownItem}
            >
              Add Skill
            </button>
          </div>
        )}
      </div>

      <main style={styles.mainContent}>
        <Hero editingGlobal={mode === 'editContent'} />
        <About editingGlobal={mode === 'editContent'} />
        <Certificate />
        <Experience />
        <Skills
          showFormOnLoad={mode === 'addSkill'}
          editingGlobal={mode === 'editContent'}
        />
        
        {/* New Project Section */}
        <section id="projects" style={{ textAlign: 'center', padding: '50px 20px', background: '#f9fafb' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '40px', color: '#1e293b' }}>My Projects</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            <ProjectCard
              name="Sample Project"
              link="https://example.com"
              image="https://via.placeholder.com/350x200?text=Project+1"
            />
            <ProjectCard
              name="Another Cool App"
              link="https://example.com"
              image="https://via.placeholder.com/350x200?text=Project+2"
            />
            {/* You can add more <ProjectCard /> components here */}
          </div>
        </section>

        <Contact />
      </main>

      <Footer />
    </div>
  );
};

const styles = {
  appContainer: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },
  headerWrapper: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0a0e17',
    padding: '0 20px',
    height: '60px',
    zIndex: 1000,
  },
  editBtn: {
    background: 'transparent',
    border: '1px solid #00bfff',
    color: '#00bfff',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  editBtnActive: {
    background: '#00bfff',
    border: '1px solid #00bfff',
    color: '#0a0e17',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  dropdown: {
    position: 'absolute',
    top: '60px',
    right: '20px',
    background: '#1e293b',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    overflow: 'hidden',
    zIndex: 1001,
  },
  dropdownItem: {
    display: 'block',
    width: '100%',
    padding: '10px 20px',
    background: 'transparent',
    border: 'none',
    color: '#e2e8f0',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  mainContent: {
    marginTop: '60px',
    flex: 1,
  },
};

export default App;
