import React from 'react';
import { useSearchParams } from 'react-router-dom';
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

const PortfolioPage = () => {
  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.get('edit') === 'true';

  return (
    <>
      <CursorTrail />
      <div className="App">
        <Navbar />
        <main style={{ marginTop: 0, flex: 1 }}>
          <Hero viewOnly={!isEditMode} />
          <About viewOnly={!isEditMode} />
          <Certificate viewOnly={!isEditMode} theme="light" />
          <Experience viewOnly={!isEditMode} />
          <Skills viewOnly={!isEditMode} theme="light" />
          <ProjectCard viewOnly={!isEditMode} />
          <Contact viewOnly={!isEditMode} />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default PortfolioPage; 