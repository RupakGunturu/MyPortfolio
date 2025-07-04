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
import API_BASE_URL from '../utils/api';

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

  // State for public view user
  const [viewedUser, setViewedUser] = React.useState(null);
  const [viewLoading, setViewLoading] = React.useState(false);
  const [viewError, setViewError] = React.useState(null);

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

  // Fetch user by username for public view
  React.useEffect(() => {
    if (!isOwner && username) {
      setViewLoading(true);
      fetch(`${API_BASE_URL}/api/users/username/${username}`)
        .then(res => {
          if (!res.ok) throw new Error('User not found');
          return res.json();
        })
        .then(data => {
          setViewedUser(data.user);
          setViewLoading(false);
        })
        .catch(err => {
          setViewError('User not found');
          setViewLoading(false);
        });
    }
  }, [isOwner, username]);

  // Show loading while checking authentication or fetching public user
  if (loading || viewLoading) {
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
  if (viewError) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: '#c00'
      }}>
        {viewError}
      </div>
    );
  }

  // Determine which userId to use
  const userIdToUse = isEditMode
    ? (user && user._id)
    : (!isOwner && viewedUser ? viewedUser._id : undefined);

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
            userId={userIdToUse}
          />
          <About 
            viewOnly={!isEditMode}
            userId={userIdToUse}
          />
          <Certificate viewOnly={!isEditMode} theme="light" userId={userIdToUse} />
          <Experience viewOnly={!isEditMode} userId={userIdToUse} />
          <Skills viewOnly={!isEditMode} theme="light" userId={userIdToUse} />
          <ProjectCard viewOnly={!isEditMode} userId={userIdToUse} />
          <Contact viewOnly={!isEditMode} userId={userIdToUse} />
        </main>
      </div>
    </>
  );
};

export default PortfolioPage; 