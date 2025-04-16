import React, { useState } from 'react';

const About = () => {
  const [profilePic, setProfilePic] = useState('/images/profile.jpg');
  const [skills, setSkills] = useState([
    { name: 'React', icon: '/images/react-icon.png' },
    { name: 'JavaScript', icon: '/images/js-icon.png' },
  ]);

  const handleAddSkill = () => {
    const name = prompt('Enter skill name:');
    const icon = prompt('Enter skill icon URL:');

    if (name && icon) {
      const confirmAdd = window.confirm(`Should we add "${name}" to your portfolio?`);
      if (confirmAdd) {
        setSkills([...skills, { name, icon }]);
      }
    }
  };

  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfilePic(imageUrl);
    }
  };

  const triggerFileInput = () => {
    document.getElementById('profileUploader').click();
  };

  return (
    <section style={styles.section}>
      <input
        type="file"
        id="profileUploader"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleProfileChange}
      />
      <div style={styles.card}>
        <div style={styles.profileContainer}>
          <img src={profilePic} alt="Profile" style={styles.profilePic} />
          <button style={styles.updateBtn} onClick={triggerFileInput}>
            Update Profile
          </button>
        </div>

        <h2 style={styles.heading}>About Me</h2>
        <p style={styles.description}>
          I'm a passionate Frontend Developer with expertise in React and modern web technologies.
          I love crafting intuitive, dynamic, and responsive websites that deliver excellent user experiences.
        </p>

        <h3 style={styles.subHeading}>Skills</h3>
        <div style={styles.skills}>
          {skills.map((skill, index) => (
            <div key={index} style={styles.skillBox}>
              <img src={skill.icon} alt={skill.name} style={styles.skillIcon} />
              <span>{skill.name}</span>
            </div>
          ))}
        </div>

        <button onClick={handleAddSkill} style={styles.addSkillBtn}>+ Add Skill</button>
      </div>
    </section>
  );
};

export default About;

const styles = {
  section: {
    minHeight: '100vh',
    backgroundColor: '#f2f4f8',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px 20px',
  },
  card: {
    backgroundColor: '#fff',
    maxWidth: '600px',
    width: '100%',
    borderRadius: '16px',
    padding: '30px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  profileContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '25px',
  },
  profilePic: {
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    objectFit: 'cover',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
  },
  updateBtn: {
    marginTop: '10px',
    padding: '8px 20px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  heading: {
    fontSize: '2rem',
    marginBottom: '10px',
    color: '#333',
  },
  description: {
    fontSize: '1rem',
    color: '#555',
    marginBottom: '20px',
    lineHeight: '1.6',
  },
  subHeading: {
    fontSize: '1.3rem',
    marginBottom: '10px',
    color: '#333',
  },
  skills: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '20px',
  },
  skillBox: {
    backgroundColor: '#f9f9f9',
    borderRadius: '20px',
    padding: '8px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
  },
  skillIcon: {
    width: '22px',
    height: '22px',
  },
  addSkillBtn: {
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '25px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};
