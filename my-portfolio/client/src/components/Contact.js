import React from 'react';

const Contact = () => {
  return (
    <section style={styles.contactSection} id="contact">
      <h2 style={styles.heading}>Contact Me</h2>
      <div style={styles.contactContainer}>
        <form style={styles.form}>
          <input type="text" placeholder="Your Name" style={styles.input} required />
          <input type="email" placeholder="Your Email" style={styles.input} required />
          <textarea placeholder="Your Message" style={styles.textarea} rows="5" required></textarea>
          <button type="submit" style={styles.button}>Send Message</button>
        </form>
        <div style={styles.mapContainer}>
          <iframe 
            title="location-map"
            src="https://www.google.com/maps/embed?pb=YOUR_GOOGLE_MAP_EMBED_CODE"
            style={styles.map}
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </section>
  );
};

export default Contact;

const styles = {
  contactSection: {
    padding: '60px 20px',
    backgroundColor: '#eef2f3',
    textAlign: 'center',
  },
  heading: {
    fontSize: '2.5rem',
    marginBottom: '40px',
    color: '#333',
  },
  contactContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '40px',
    alignItems: 'center',
  },
  form: {
    width: '100%',
    maxWidth: '500px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  input: {
    padding: '15px',
    fontSize: '1em',
    borderRadius: '5px',
    border: '1px solid #ccc',
  },
  textarea: {
    padding: '15px',
    fontSize: '1em',
    borderRadius: '5px',
    border: '1px solid #ccc',
    resize: 'none',
  },
  button: {
    padding: '15px',
    fontSize: '1em',
    borderRadius: '5px',
    backgroundColor: '#28A745',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
  },
  mapContainer: {
    width: '100%',
    maxWidth: '500px',
    height: '300px',
  },
  map: {
    width: '100%',
    height: '100%',
    border: 'none',
  },
};
