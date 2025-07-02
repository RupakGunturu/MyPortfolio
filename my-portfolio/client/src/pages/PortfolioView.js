import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import './PortfolioView.css';

const PortfolioView = () => {
  const { username } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/portfolio/${username}`);
        setPortfolio(response.data);
      } catch (err) {
        console.error('Error fetching portfolio:', err);
        setError('Portfolio not found or user does not exist');
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchPortfolio();
    }
  }, [username]);

  if (loading) {
    return (
      <div className="portfolio-loading">
        <div className="loading-spinner"></div>
        <p>Loading portfolio...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="portfolio-error">
        <h2>Portfolio Not Found</h2>
        <p>{error}</p>
        <Link to="/" className="btn btn-primary">
          Back to Home
        </Link>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="portfolio-error">
        <h2>Portfolio Not Found</h2>
        <p>This portfolio doesn't exist.</p>
        <Link to="/" className="btn btn-primary">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="portfolio-view">
      {/* Header */}
      <header className="portfolio-header">
        <div className="container">
          <div className="portfolio-profile">
            <div className="profile-image">
              <img 
                src={portfolio.imageUrl || '/images/profile-placeholder.png'} 
                alt={portfolio.name}
              />
            </div>
            <div className="profile-info">
              <h1>{portfolio.name}</h1>
              <p className="bio">{portfolio.bio}</p>
              <p className="tech-stack">{portfolio.techStackMessage}</p>
            </div>
          </div>
        </div>
      </header>

      {/* About Section */}
      {portfolio.about && (
        <section className="portfolio-section">
          <div className="container">
            <h2>About</h2>
            <div className="about-content">
              {portfolio.about}
            </div>
          </div>
        </section>
      )}

      {/* Skills Section */}
      {portfolio.skills && portfolio.skills.length > 0 && (
        <section className="portfolio-section">
          <div className="container">
            <h2>Skills</h2>
            <div className="skills-grid">
              {portfolio.skills.map((skill, index) => (
                <motion.div
                  key={skill._id || index}
                  className={`skill-card skill-${skill.level}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <h3>{skill.title}</h3>
                  <span className="skill-level">{skill.level}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Experience Section */}
      {portfolio.experiences && portfolio.experiences.length > 0 && (
        <section className="portfolio-section">
          <div className="container">
            <h2>Experience</h2>
            <div className="experience-timeline">
              {portfolio.experiences.map((exp, index) => (
                <motion.div
                  key={exp._id || index}
                  className="experience-item"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 }}
                >
                  <div className="experience-icon">
                    <i className={`fas fa-${exp.iconType}`}></i>
                  </div>
                  <div className="experience-content">
                    <h3>{exp.title}</h3>
                    <h4>{exp.company}</h4>
                    <p className="date">{exp.date}</p>
                    <p className="description">{exp.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Projects Section */}
      {portfolio.projects && portfolio.projects.length > 0 && (
        <section className="portfolio-section">
          <div className="container">
            <h2>Projects</h2>
            <div className="projects-grid">
              {portfolio.projects.map((project, index) => (
                <motion.div
                  key={project._id || index}
                  className="project-card"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="project-image">
                    <img src={project.image} alt={project.name} />
                  </div>
                  <div className="project-content">
                    <h3>{project.name}</h3>
                    <a 
                      href={project.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="project-link"
                    >
                      View Project
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default PortfolioView; 