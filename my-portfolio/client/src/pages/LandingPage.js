import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';
import Footer from '../components/Footer';

const LandingPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [registeredUserCount, setRegisteredUserCount] = useState(0);

  useEffect(() => {
    fetch('/api/user-count')
      .then(res => res.json())
      .then(data => setRegisteredUserCount(data.count))
      .catch(() => setRegisteredUserCount(0));
  }, []);

  const handleFindPortfolio = async () => {
    if (username.trim()) {
      try {
        const res = await fetch(`/api/users/username/${username.trim()}`);
        if (!res.ok) throw new Error('User not found');
        const data = await res.json();
        // Navigate to the public portfolio view for this user
        navigate(`/portfolio/${data.user.username}?viewOnly=true`);
      } catch (err) {
        alert('User not found!');
      }
    }
  };

  return (
    <>
    <div className="landing-root">
      <h1 className="landing-title text-gradient">"Build. Share. Impress."</h1>
      
      <div className="landing-badge">
        <Sparkles className="badge-icon" />
        <span className="badge-text">Portfolio</span>
      </div>

      {/* Registered User Count Box */}
      <div className="user-count-box">
        <span className="user-count-number">{registeredUserCount}</span>
        <span className="user-count-label">Registered Users</span>
      </div>

      <p className="landing-desc">
        Create a stunning portfolio that showcases your professional identity with elegant design, smooth animations, and powerful customization features.
      </p>
      <div className="landing-actions">
        <button className="btn-gradient" onClick={() => navigate('/register')}>SignUp To Create</button>
        <button className="btn-outline" onClick={() => navigate('/login')}>Have an Account already? Login</button>
      </div>

      {/* Username Search Box */}
      <div className="portfolio-search-box">
        <input
          type="text"
          className="portfolio-search-input"
          placeholder="Enter username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <button className="btn-gradient" onClick={handleFindPortfolio}>
          Find Portfolio
        </button>
      </div>
    </div>
      <Footer />
    </>
  );
};

export default LandingPage;