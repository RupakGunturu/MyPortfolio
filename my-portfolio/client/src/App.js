import React from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Project';
import Contact from './components/Contact';
import Experience from './components/Experience';

const App = () => {
  return (
    <div style={styles.appContainer}>
      <Navbar />
      <main style={styles.mainContent}>
        <Hero />
        <About />
        <Projects />
        <Experience />
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
  mainContent: {
    marginTop: '60px', // Adjust based on Navbar height
    flex: 1,
  },
};

export default App;