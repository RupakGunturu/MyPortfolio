import React from 'react';
import './ProjectCard.css';

const ProjectCard = ({ name, link, image }) => (
  <div className="project-card">
    <div className="project-image">
      {image ? (
        <img
          src={image}
          alt={name}
          onError={e => {
            e.target.onerror = null;
            e.target.src = "https://via.placeholder.com/300x200?text=Project+Preview";
          }}
        />
      ) : (
        <div className="no-image-placeholder">
          <span>No Preview Available</span>
        </div>
      )}
    </div>
    <div className="project-details">
      <h3>{name}</h3>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="project-link"
      >
        View Project
      </a>
    </div>
  </div>
);

export default ProjectCard; 