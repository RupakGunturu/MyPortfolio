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
  // Default to view mode on refresh unless ?edit=true is present and user is owner
  const isEditMode = requestedEdit && isOwner;

  // Only redirect to login if user is not authenticated and trying to access edit mode
  React.useEffect(() => {
    if (!loading && requestedEdit && !isAuthenticated) {
      navigate('/login');
    }
  }, [requestedEdit, isAuthenticated, navigate, loading]);

  // If trying to edit but not the owner, redirect to view-only
  React.useEffect(() => {
    if (!loading && requestedEdit && isAuthenticated && !isOwner) {
      navigate(`/portfolio/${username}`);
    }
  }, [requestedEdit, isOwner, isAuthenticated, navigate, username, loading]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Loading portfolio...
      </div>
    );
  }

  const onUpdatePortfolio = () => {
    console.log('User in onUpdatePortfolio:', user);
    if (user) {
      navigate(`/portfolio/${user.username}?edit=true`);
    } else {
      alert('User not loaded!');
    }
  };

  return (
    <>
      <CursorTrail />
      <div className="App">
        <Navbar />
        <main style={{ marginTop: 0, flex: 1 }}>
          <Hero 
            viewOnly={!isEditMode}
            userId={isEditMode ? (user && user._id) : undefined}
          />
          <About 
            viewOnly={!isEditMode}
            userId={isEditMode ? (user && user._id) : undefined}
          />
          <Certificate viewOnly={!isEditMode} theme="light" />
          <Experience viewOnly={!isEditMode} />
          <Skills viewOnly={!isEditMode} theme="light" />
          <ProjectCard viewOnly={!isEditMode} />
          <Contact viewOnly={!isEditMode} />
        </main>
      </div>
    </>
  );
};

export default PortfolioPage; 