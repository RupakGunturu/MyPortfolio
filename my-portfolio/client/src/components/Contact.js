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
        Contact Me
      </motion.h2>

      <motion.div
        style={styles.container}
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
          <input
            name="name"
            type="text"
            placeholder="Your Name"
            style={styles.input}
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Your Email"
            style={styles.input}
            value={formData.email}
            onChange={handleChange}
            required
          />
          <textarea
            name="message"
            placeholder="Your Message"
            style={styles.textarea}
            rows={5}
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

// Same styles as before
const styles = {
  section: { padding: '60px 20px', backgroundColor: '#f9f9f9', textAlign: 'center' },
  heading: { fontSize: '2.5rem', color: '#222', marginBottom: '40px' },
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '40px',
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    width: '100%',
    maxWidth: '500px',
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '15px',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  input: {
    padding: '15px',
    fontSize: '1em',
    borderRadius: '8px',
    border: '1px solid #ccc',
    outline: 'none',
  },
  textarea: {
    padding: '15px',
    fontSize: '1em',
    borderRadius: '8px',
    border: '1px solid #ccc',
    resize: 'none',
    outline: 'none',
  },
  button: {
    padding: '15px',
    fontSize: '1em',
    borderRadius: '8px',
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  mapWrapper: {
    width: '100%',
    maxWidth: '500px',
    height: '300px',
    borderRadius: '15px',
    overflow: 'hidden',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
  },
  map: {
    width: '100%',
    height: '100%',
    border: 'none',
  },
};
