import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CursorTrail from '../components/CursorTrail';
import Hero from '../components/Hero';
import About from '../components/About';
import Certificate from '../components/Certificate';
import Experience from '../components/Experiences';
import Skills from '../components/Skills';
import Contact from '../components/Contact';
import ProjectCard from '../components/ProjectCard';

const Dashboard = () => {
  return (
    <>
      <CursorTrail />
      <div className="App">
        <Navbar />
        <main style={{ marginTop: 0, flex: 1 }}>
          <Hero />
          <About />
          <Certificate theme="light" />
          <Experience />
          <Skills theme="light" />
          <ProjectCard />
          <Contact />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Dashboard; 