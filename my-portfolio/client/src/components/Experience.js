// src/components/Experience.js

import React, { useState } from 'react';
import { motion } from 'framer-motion';

const initialExperiences = [
  {
    id: 1,
    title: 'Web & UI',
    description: 'Building responsive, accessible UIs with React and modern CSS.',
    imageUrl: '/logos/techcorp.png',
  },
];

const Experience = () => {
  const [experiences, setExperiences] = useState(initialExperiences);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newExp, setNewExp] = useState({ title: '', description: '', image: null });

  const handleChange = e => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setNewExp(prev => ({ ...prev, image: files[0] }));
    } else {
      setNewExp(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    const entry = {
      id: experiences.length ? Math.max(...experiences.map(x => x.id)) + 1 : 1,
      title: newExp.title,
      description: newExp.description,
      imageUrl: newExp.image ? URL.createObjectURL(newExp.image) : '',
    };
    setExperiences([entry, ...experiences]);
    setNewExp({ title: '', description: '', image: null });
    setIsFormOpen(false);
  };

  return (
    <section id="experience" style={styles.section}>
      <div style={styles.header}>
        <motion.h2
          style={styles.heading}
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          Experience
        </motion.h2>
        <button
          type="button"
          style={styles.addButton}
          onClick={() => setIsFormOpen(true)}
        >
          + Add Experience
        </button>
      </div>

      {isFormOpen && (
        <motion.form
          style={styles.form}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          onSubmit={handleSubmit}
        >
          <input
            name="title"
            placeholder="Title"
            value={newExp.title}
            onChange={handleChange}
            style={styles.input}
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            rows={3}
            value={newExp.description}
            onChange={handleChange}
            style={styles.textarea}
            required
          />
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
            style={styles.input}
            required
          />
          <div style={styles.formActions}>
            <button type="submit" style={styles.submitButton}>
              Save
            </button>
            <button
              type="button"
              style={styles.cancelButton}
              onClick={() => setIsFormOpen(false)}
            >
              Cancel
            </button>
          </div>
        </motion.form>
      )}

      <div style={styles.grid}>
        {experiences.map(exp => (
          <motion.div
            key={exp.id}
            style={styles.card}
            initial={{ opacity: 0, y: 80, rotateX: 15 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ type: 'spring', stiffness: 120, damping: 20, duration: 0.8 }}
            whileHover={{ scale: 1.05, boxShadow: '0 12px 24px rgba(0,0,0,0.15)' }}
          >
            {exp.imageUrl && (
              <img src={exp.imageUrl} alt="" style={styles.logo} />
            )}
            <h3 style={styles.title}>{exp.title}</h3>
            <p style={styles.description}>{exp.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Experience;

// Styles
const styles = {
  section: { padding: '40px 20px', backgroundColor: '#fff' },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
  heading: { fontSize: '2rem', color: '#222' },
  addButton: {
    padding: '6px 12px',
    fontSize: '1rem',
    borderRadius: '4px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '30px',
    padding: '15px',
    border: '1px solid #ddd',
    borderRadius: '6px',
  },
  input: {
    padding: '8px',
    fontSize: '1rem',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  textarea: {
    padding: '8px',
    fontSize: '1rem',
    borderRadius: '4px',
    border: '1px solid #ccc',
    resize: 'vertical',
  },
  formActions: { display: 'flex', gap: '10px' },
  submitButton: {
    padding: '8px 16px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  cancelButton: {
    padding: '8px 16px',
    backgroundColor: '#6c757d',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
  },
  card: {
    background: '#f9fafb',
    borderRadius: '8px',
    padding: '20px',
    textAlign: 'left',
    cursor: 'pointer',
  },
  logo: {
    width: '100%',
    maxHeight: '200px',
    objectFit: 'cover',
    borderRadius: '4px',
    marginBottom: '10px',
  },
  title: { fontSize: '1.2rem', fontWeight: '600', color: '#111', margin: '10px 0 5px' },
  description: { fontSize: '0.9rem', color: '#666', margin: 0 },
};
