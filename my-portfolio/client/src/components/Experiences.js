import React from 'react';
import { motion } from 'framer-motion';
import { FaBriefcase, FaCode, FaGraduationCap } from 'react-icons/fa';
import './Experiences.css';

// --- Sample Data: Easy to update for your own experiences ---
const experiences = [
  {
    icon: <FaBriefcase />,
    date: 'Summer 2023',
    title: 'Software Engineer Intern',
    company: 'Tech Solutions Inc.',
    description: 'Developed and maintained features for a large-scale web application using React and Node.js. Collaborated with a team of 10 engineers.',
  },
  {
    icon: <FaCode />,
    date: 'Spring 2023',
    title: 'Full-Stack Portfolio Project',
    company: 'University Coursework',
    description: 'Built a full-stack MERN application to showcase my skills. Implemented user authentication, a RESTful API, and a responsive frontend.',
  },
  {
    icon: <FaGraduationCap />,
    date: '2020 - 2024',
    title: 'B.Sc. in Computer Science',
    company: 'University of Technology',
    description: 'Focused on algorithms, data structures, and software engineering principles. Maintained a 3.8 GPA.',
  },
];
// -------------------------------------------------------------

const Experience = () => {
  return (
    <section className="experience-section" id="experience">
      <h2 className="experience-heading">My Journey</h2>
      <div className="experience-timeline">
        {experiences.map((exp, index) => (
          <motion.div
            key={index}
            className="timeline-item"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            viewport={{ once: true }}
          >
            <div className="timeline-icon">{exp.icon}</div>
            <div className="timeline-content">
              <span className="timeline-date">{exp.date}</span>
              <h3 className="timeline-title">{exp.title}</h3>
              <p className="timeline-company">{exp.company}</p>
              <p className="timeline-description">{exp.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Experience;
