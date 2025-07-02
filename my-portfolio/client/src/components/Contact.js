import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiMessageSquare, FiMapPin, FiPhone, FiSend } from 'react-icons/fi';
import AuthContext from '../context/AuthContext';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');
  const [visitorLocation, setVisitorLocation] = useState('Fetching your location...');
  const [coords, setCoords] = useState(null);
  const authContext = useContext(AuthContext);
  const { user } = authContext || {};

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ latitude, longitude });
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          setVisitorLocation(data.display_name || 'Location found');
        } catch (err) {
          setVisitorLocation('Unable to fetch location');
        }
      }, () => {
        setVisitorLocation('Location permission denied');
      });
    } else {
      setVisitorLocation('Geolocation not supported');
    }
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setStatus('Sending...');
    try {
      const res = await fetch('/api/contact', { // Using relative path for proxy
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus('Message sent successfully!');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus('Failed to send message.');
      }
    } catch (error) {
      console.error('Error:', error);
      setStatus('Something went wrong. Please try again.');
    } finally {
        setTimeout(() => setStatus(''), 5000); // Clear status after 5 seconds
    }
  };

  return (
    <section style={styles.section} id="contact">
      <div style={styles.container}>
        <motion.h2
          style={styles.heading}
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: 'spring' }}
          viewport={{ once: true }}
        >
          Let's Build Something Amazing
        </motion.h2>
        <motion.div
          style={styles.animatedLine}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.7, delay: 0.2, type: 'spring' }}
        />

        <motion.p
          style={styles.description}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Have a project, an idea, or just want to say hi? I'd love to hear from you.
        </motion.p>

        <div style={styles.grid}>
          <motion.form
            style={styles.form}
            onSubmit={handleSubmit}
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div style={styles.inputGroup}>
              <FiUser style={styles.icon} />
              <input
                name="name"
                type="text"
                placeholder="Your Name"
                style={styles.input}
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div style={styles.inputGroup}>
              <FiMail style={styles.icon} />
              <input
                name="email"
                type="email"
                placeholder="Your Email"
                style={styles.input}
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div style={styles.inputGroup}>
              <FiMessageSquare style={styles.icon} />
              <textarea
                name="message"
                placeholder="Your Message..."
                style={styles.textarea}
                rows={5}
                value={formData.message}
                onChange={handleChange}
                required
              />
            </div>
            <motion.button
              type="submit"
              style={styles.button}
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.03, ...styles.buttonHover }}
            >
              Send Message <FiSend style={{ marginLeft: '8px' }}/>
            </motion.button>
            {status && <p style={styles.statusMessage}>{status}</p>}
          </motion.form>

          <motion.div 
            style={styles.rightColumn}
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <div style={styles.contactInfoCard}>
              <h3 style={styles.cardHeading}>Contact Details</h3>
              <div style={styles.infoItem}>
                <FiMapPin style={styles.infoIcon} />
                <span>{visitorLocation}</span>
              </div>
              <div style={styles.infoItem}>
                <FiMail style={styles.infoIcon} />
                <span>{user?.email || "Not logged in"}</span>
              </div>
            </div>
            <div style={styles.mapWrapper}>
              <iframe
                title="User Location"
                src={
                  coords
                    ? `https://maps.google.com/maps?q=${coords.latitude},${coords.longitude}&z=15&output=embed`
                    : "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d61320.94981151849!2d80.9602996486328!3d16.439447400000004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a36093444503953%3A0x4414251a364b496!2sGudivada%2C%20Andhra%20Pradesh!5e0!3m2!1sen!2sin!4v1678886400000"
                }
                style={styles.map}
                allowFullScreen=""
                loading="lazy"
              ></iframe>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;

const styles = {
  section: {
    padding: '100px 20px',
    background: 'linear-gradient(135deg, #F5F7FA 0%, #C3CFE2 100%)',
    minHeight: '100vh',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    textAlign: 'center',
  },
  heading: {
    fontSize: '3.5rem',
    color: '#1e293b',
    marginBottom: '1rem',
    fontWeight: '800',
    letterSpacing: '-1px',
  },
  description: {
    fontSize: '1.2rem',
    color: '#475569',
    maxWidth: '700px',
    margin: '0 auto 60px',
    lineHeight: '1.7',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '40px',
    alignItems: 'flex-start',
  },
  form: {
    background: 'rgba(255, 255, 255, 0.6)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
    border: '1px solid rgba(255, 255, 255, 0.8)',
    display: 'flex',
    flexDirection: 'column',
    gap: '25px',
    textAlign: 'left',
  },
  inputGroup: {
    position: 'relative',
  },
  icon: {
    position: 'absolute',
    left: '15px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#64748b',
    fontSize: '1.2rem',
  },
  input: {
    padding: '15px 15px 15px 50px',
    width: '100%',
    fontSize: '1rem',
    borderRadius: '12px',
    border: '1px solid #cbd5e1',
    outline: 'none',
    background: '#f8fafc',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box',
  },
  textarea: {
    padding: '15px 15px 15px 50px',
    width: '100%',
    fontSize: '1rem',
    borderRadius: '12px',
    border: '1px solid #cbd5e1',
    outline: 'none',
    background: '#f8fafc',
    resize: 'vertical',
    minHeight: '120px',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box',
  },
  button: {
    padding: '16px 24px',
    fontSize: '1.1rem',
    borderRadius: '12px',
    background: 'linear-gradient(45deg, #3b82f6, #6366f1)',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.3s ease-in-out',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)',
  },
  buttonHover: {
    boxShadow: '0 12px 25px rgba(99, 102, 241, 0.4)',
    transform: 'translateY(-2px)',
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  },
  contactInfoCard: {
    background: 'rgba(255, 255, 255, 0.6)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: '30px',
    boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
    border: '1px solid rgba(255, 255, 255, 0.8)',
    textAlign: 'left',
  },
  cardHeading: {
    fontSize: '1.5rem',
    color: '#1e293b',
    marginBottom: '20px',
    fontWeight: '700',
  },
  infoItem: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '15px',
    fontSize: '1rem',
    color: '#334155',
  },
  infoIcon: {
    color: '#3b82f6',
    fontSize: '1.4rem',
    marginRight: '15px',
  },
  mapWrapper: {
    width: '100%',
    height: '350px',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
  },
  map: {
    width: '100%',
    height: '100%',
    border: 'none',
  },
  statusMessage: {
      marginTop: '15px',
      textAlign: 'center',
      color: '#3b82f6',
      fontWeight: '500',
  },
  animatedLine: {
    height: '4px',
    width: '60px',
    background: 'linear-gradient(90deg, #3b82f6 0%, #6366f1 100%)',
    borderRadius: '2px',
    margin: '0.5rem auto 2rem auto',
    transformOrigin: 'left',
  },
};
