import React, { useContext } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
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
  const { username } = useParams();
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const { user, isAuthenticated, loading } = authContext;

  // Only allow edit mode if logged-in user matches the username in the URL
  const requestedEdit = searchParams.get('edit') === 'true';
  const isOwner = isAuthenticated && user && user.username === username;
  const isEditMode = requestedEdit && isOwner;

  // Wait for loading to finish before redirecting
  React.useEffect(() => {
    if (!loading && requestedEdit && !isEditMode) {
      navigate(`/portfolio/${username}`);
    }
  }, [requestedEdit, isEditMode, navigate, username, loading]);

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