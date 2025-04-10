import React from 'react';

const projectData = [
  {
    title: 'Portfolio Website',
    description: 'A responsive, dynamic portfolio site built using React.',
    imageUrl: '/images/project1.jpg',
    projectUrl: 'https://yourportfolio.com',
  },
  {
    title: 'E-commerce App',
    description: 'A full-stack MERN e-commerce application with a modern UI.',
    imageUrl: '/images/project2.jpg',
    projectUrl: 'https://ecommerce.com',
  },
  {
    title: 'Blog Platform',
    description: 'A fully-featured blog platform with user authentication and content management.',
    imageUrl: '/images/project3.jpg',
    projectUrl: 'https://blogplatform.com',
  },
];

const Projects = () => {
  return (
    <section style={styles.projectsSection} id="projects">
      <h2 style={styles.heading}>My Projects</h2>
      <div style={styles.projectsContainer}>
        {projectData.map((project, idx) => (
          <div key={idx} style={styles.card}>
            <img src={project.imageUrl} alt={project.title} style={styles.cardImage} />
            <div style={styles.cardContent}>
              <h3 style={styles.cardTitle}>{project.title}</h3>
              <p style={styles.cardDesc}>{project.description}</p>
              <a 
                href={project.projectUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                style={styles.cardButton}
              >
                View Project
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Projects;

const styles = {
  projectsSection: {
    padding: '60px 20px',
    backgroundColor: '#eef2f3',
    textAlign: 'center',
  },
  heading: {
    fontSize: '2.5rem',
    marginBottom: '40px',
    color: '#333',
  },
  projectsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
    justifyContent: 'center',
  },
  card: {
    width: '300px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    transition: 'transform 0.3s',
    textAlign: 'left',
  },
  cardImage: {
    width: '100%',
    height: 'auto',
  },
  cardContent: {
    padding: '20px',
  },
  cardTitle: {
    fontSize: '1.5rem',
    marginBottom: '10px',
    color: '#333',
  },
  cardDesc: {
    fontSize: '1rem',
    marginBottom: '20px',
    color: '#666',
  },
  cardButton: {
    padding: '10px 15px',
    backgroundColor: '#007BFF',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '5px',
  },
};
