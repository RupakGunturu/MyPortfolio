import React from 'react';
import { motion } from 'framer-motion';

const Contact = () => {
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
          initial={{ x: -50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
        >
          <input type="text" placeholder="Your Name" style={styles.input} required />
          <input type="email" placeholder="Your Email" style={styles.input} required />
          <textarea placeholder="Your Message" style={styles.textarea} rows={5} required />
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
            title="Google Map"
            src="https://www.google.com/maps/embed?pb=YOUR_GOOGLE_MAP_EMBED_CODE"
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
    padding: '60px 20px',
    backgroundColor: '#f9f9f9',
    textAlign: 'center',
  },
  heading: {
    fontSize: '2.5rem',
    color: '#222',
    marginBottom: '40px',
  },
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
