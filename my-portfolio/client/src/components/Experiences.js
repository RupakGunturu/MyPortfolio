import React, { useEffect, useState } from 'react';
import './Experiences.css'; // Custom styles here
import axios from 'axios';

const Experience = () => {
  const [experiences, setExperiences] = useState([]);

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        const res = await axios.get('http://localhost:9000/api/experience');
        setExperiences(res.data);
      } catch (err) {
        console.error('Failed to fetch experience:', err);
      }
    };
    fetchExperiences();
  }, []);

  return (
    <section className="experience-section">
      <h2 className="section-title">
        Experience <span className="underline" />
      </h2>
      <div className="experience-grid">
        {experiences.map((exp, idx) => (
          <div key={idx} className="experience-card">
            <div className="experience-image" style={{ backgroundImage: `url(${exp.image || '/default-exp.jpg'})` }}></div>
            <div className="experience-overlay">
              <h3>{exp.role}</h3>
              <p>{exp.company}</p>
              <p>{exp.duration}</p>
              <p className="experience-desc">{exp.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Experience;
