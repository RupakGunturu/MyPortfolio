import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:9000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert('Message sent successfully!');
        setFormData({ name: '', email: '', message: '' });
      } else {
        alert('Failed to send message.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong. Please try again.');
    }
  };

  return (
    <section style={styles.section} id="contact">
      <motion.h2
        style={styles.heading}
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Let’s Work Together
      </motion.h2>

      <motion.p
        style={styles.description}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        Have an idea or a project in mind? Let’s connect and make something awesome together.
      </motion.p>

      <motion.div
        style={styles.grid}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.form
          style={styles.form}
          onSubmit={handleSubmit}
          initial={{ x: -50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
        >
          <label style={styles.label}>Name</label>
          <input
            name="name"
            type="text"
            placeholder="Enter your full name"
            style={styles.input}
            value={formData.name}
            onChange={handleChange}
            required
          />
          <label style={styles.label}>Email</label>
          <input
            name="email"
            type="email"
            placeholder="Enter your email address"
            style={styles.input}
            value={formData.email}
            onChange={handleChange}
            required
          />
          <label style={styles.label}>Message</label>
          <textarea
            name="message"
            placeholder="Write your message here..."
            style={styles.textarea}
            rows={6}
            value={formData.message}
            onChange={handleChange}
            required
          />
          <motion.button
            type="submit"
            style={styles.button}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
          >
            Send Message
          </motion.button>
        </motion.form>

        <motion.div
          style={styles.mapWrapper}
          initial={{ x: 50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
        >
          <iframe
            title="Gudivada, Andhra Pradesh"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3802.1234567890123!2d80.949000!3d16.437000!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a35b0abcdef1234%3A0xabcdef1234567890!2sGudivada%2C%20Andhra%20Pradesh!5e0!3m2!1sen!2sin!4v0000000000000"
            style={styles.map}
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Contact;

const styles = {
  section: {
    padding: '80px 20px',
    background: 'linear-gradient(145deg, #f0f4f8, #dbeafe)',
    minHeight: '100vh',
    textAlign: 'center',
  },
  heading: {
    fontSize: '3.5rem',
    color: '#0f172a',
    marginBottom: '10px',
    fontWeight: '800',
  },
  description: {
    fontSize: '1.2rem',
    color: '#334155',
    maxWidth: '760px',
    margin: '0 auto 50px',
    lineHeight: '1.8',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '40px',
    padding: '0 20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  form: {
    background: '#ffffff',
    borderRadius: '20px',
    padding: '40px 30px',
    boxShadow: '0 12px 35px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
    textAlign: 'left',
  },
  label: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1e293b',
  },
  input: {
    padding: '12px 18px',
    fontSize: '1rem',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    outline: 'none',
    background: '#f9fafb',
  },
  textarea: {
    padding: '12px 18px',
    fontSize: '1rem',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    outline: 'none',
    background: '#f9fafb',
    resize: 'vertical',
  },
  button: {
    padding: '14px 24px',
    fontSize: '1rem',
    borderRadius: '12px',
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.3s ease-in-out',
  },
  mapWrapper: {
    width: '100%',
    minHeight: '400px',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 12px 35px rgba(0,0,0,0.1)',
  },
  map: {
    width: '100%',
    height: '100%',
    border: 'none',
  },
  // Responsive style fallback
  '@media screen and (max-width: 768px)': {
    grid: {
      gridTemplateColumns: '1fr',
    },
  },
};
