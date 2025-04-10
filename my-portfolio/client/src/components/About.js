import React from 'react';

const About = () => {
  return (
    <section style={styles.aboutSection} id="about">
      <div style={styles.container}>
        <img 
          src="/images/profile.jpg" 
          alt="Profile" 
          style={styles.profilePic}
        />
        <div style={styles.textContent}>
          <h2 style={styles.heading}>About Me</h2>
          <p style={styles.paragraph}>
            I'm a passionate Frontend Developer with expertise in React and modern web technologies. I love crafting intuitive, dynamic, and responsive websites that deliver excellent user experiences.
          </p>
          <div style={styles.skills}>
            <div style={styles.skill}>
              <img src="/images/react-icon.png" alt="React" style={styles.skillIcon} />
              <span>React</span>
            </div>
            <div style={styles.skill}>
              <img src="/images/js-icon.png" alt="JavaScript" style={styles.skillIcon} />
              <span>JavaScript</span>
            </div>
            {/* Add more skills as needed */}
          </div>
          <div style={styles.buttonGroup}>
            <a href="mailto:your.email@example.com" style={styles.contactButton}>Contact Me</a>
            <a href="/resume.pdf" download style={styles.resumeButton}>Download Resume</a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;

const styles = {
  aboutSection: {
    padding: '60px 20px',
    backgroundColor: '#f4f4f4',
    color: '#333',
    textAlign: 'center',
  },
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '30px',
  },
  profilePic: {
    width: '150px',
    height: '150px',
    borderRadius: '50%',
  },
  textContent: {
    maxWidth: '600px',
  },
  heading: {
    fontSize: '2.5rem',
    marginBottom: '20px',
  },
  paragraph: {
    fontSize: '1.1rem',
    lineHeight: '1.7',
    marginBottom: '20px',
  },
  skills: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '15px',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  skill: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#fff',
    padding: '5px 10px',
    borderRadius: '5px',
    boxShadow: '0 0 5px rgba(0,0,0,0.1)',
  },
  skillIcon: {
    width: '30px',
    height: '30px',
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
  },
  contactButton: {
    padding: '10px 20px',
    backgroundColor: '#007BFF',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '5px',
  },
  resumeButton: {
    padding: '10px 20px',
    backgroundColor: '#28A745',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '5px',
  },
};
