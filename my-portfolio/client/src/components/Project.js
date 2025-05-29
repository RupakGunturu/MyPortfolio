import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

// 5 random certificate image URLs
const imageUrls = [
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTiLFZBG2PYmWOT81iUFfesPYTJVg7rNe2YIM9FXjX-Vlj_FkLH54MBzc9eLIBMQbuUMIo&usqp=CAU",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_Nh9l0oOTzpzuUsqi6jxT3txXjD2bTUagBascKyzzWFMvyuW7Z0QOT650oDLDIclHmDQ&usqp=CAU",
  "https://miro.medium.com/v2/resize:fit:1358/0*2ApW5OWboyV571oB.png",
  "https://www.deliveryhero.com/wp-content/uploads/2021/04/DH_Blog_Header_WomenInTech_2000x1100px_2_Blue-1200x660.png",
  "https://cdn-talent-wp.arc.dev/wp-content/uploads/2022/03/best-programming-languages-1128x635.jpg"
];

export default function Certificates() {
  const [certs, setCerts] = useState([]);
  const [form, setForm] = useState({
    title: '',
    issuer: '',
    date: '',
    file: null,
  });
  const [error, setError] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [pressedCert, setPressedCert] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const pressTimer = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const response = await axios.get('/api/certificates');
      const withImages = response.data.map(cert => ({
        ...cert,
        image: imageUrls[Math.floor(Math.random() * imageUrls.length)]
      }));
      setCerts(withImages);
    } catch (err) {
      console.error('Failed to fetch certificates:', err);
      setError('Failed to load certificates. Please try again.');
    }
  };

  const handleFileChange = e => {
    setForm(prev => ({
      ...prev,
      file: e.target.files[0]
    }));
  };

  const onSubmit = async e => {
    e.preventDefault();
    setError('');

    try {
      if (!form.title || !form.issuer || !form.date) {
        throw new Error('All required fields must be filled');
      }

      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('issuer', form.issuer);
      formData.append('date', form.date);

      if (form.file) {
        if (form.file.type !== 'application/pdf') {
          throw new Error('Only PDF files are allowed');
        }
        formData.append('certificate', form.file);
      }

      const response = await axios.post('/api/certificates', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const newCert = {
        ...response.data,
        image: imageUrls[Math.floor(Math.random() * imageUrls.length)],
      };

      setCerts(prev => [newCert, ...prev]);
      resetForm();
      setIsFormVisible(false);
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.message || 'Something went wrong.');
    }
  };

  const resetForm = () => {
    setForm({ title: '', issuer: '', date: '', file: null });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startPressTimer = id => {
    setPressedCert(id);
    pressTimer.current = setTimeout(() => setDeletingId(id), 2000);
  };

  const cancelPressTimer = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
    setPressedCert(null);
  };

  const deleteCertificate = async id => {
    try {
      await axios.delete(`/api/certificates/${id}`);
      setCerts(prev => prev.filter(cert => cert._id !== id));
      setDeletingId(null);
    } catch (err) {
      console.error('Delete failed:', err);
      setError('Failed to delete certificate. Please try again.');
    }
  };

  const openPdf = url => {
    window.open(url, '_blank');
  };

  return (
    <div className="certificates-container">
      <div className="header">
        <h2>My Certificates</h2>
        <button
          onClick={() => setIsFormVisible(!isFormVisible)}
          className={`add-btn ${isFormVisible ? 'cancel' : ''}`}
        >
          {isFormVisible ? '✕ Close' : '＋ Add Certificate'}
        </button>
      </div>

      <AnimatePresence>
        {isFormVisible && (
          <motion.form
            onSubmit={onSubmit}
            className="cert-form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            encType="multipart/form-data"
          >
            <div className="form-group">
              <label>Certificate Title *</label>
              <input
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Issued By *</label>
              <input
                value={form.issuer}
                onChange={e => setForm({ ...form, issuer: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Date Issued *</label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>PDF Document (optional)</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
              />
            </div>

            <button type="submit" className="submit-btn">
              Save Certificate
            </button>
            {error && <div className="error">{error}</div>}
          </motion.form>
        )}
      </AnimatePresence>

      {certs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📄</div>
          <p>No certificates yet. Add your first one!</p>
        </div>
      ) : (
        <div className="certificates-grid">
          {certs.map(cert => (
            <motion.div
              key={cert._id}
              className="cert-card"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onTouchStart={() => startPressTimer(cert._id)}
              onTouchEnd={cancelPressTimer}
              onMouseDown={() => startPressTimer(cert._id)}
              onMouseUp={cancelPressTimer}
              onMouseLeave={cancelPressTimer}
            >
              <div className="cert-image">
                <img
                  src={cert.image} // ✅ This line is updated
                  alt="Certificate"
                />
              </div>

              <div className="cert-details">
                <h3>{cert.title}</h3>
                <p className="issuer">{cert.issuer}</p>
                <p className="date">
                  {new Date(cert.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
                {cert.fileUrl && (
                  <button
                    onClick={() => openPdf(cert.fileUrl)}
                    className="pdf-btn"
                  >
                    View PDF
                  </button>
                )}
              </div>

              {pressedCert === cert._id && (
                <div className="press-indicator">
                  <div className="press-bar" />
                  <span>Hold to delete</span>
                </div>
              )}

              {deletingId === cert._id && (
                <div className="delete-confirm">
                  <p>Delete this certificate?</p>
                  <div className="delete-actions">
                    <button onClick={() => setDeletingId(null)}>Cancel</button>
                    <button
                      onClick={() => deleteCertificate(cert._id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
         
         <style jsx>{`
  .certificates-container {
    max-width: 1440px;
    margin: 2rem auto;
    padding: 0 1.5rem;
    font-family: 'Inter', system-ui, sans-serif;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2.5rem;
  }

  h2 {
    font-size: 2rem;
    font-weight: 700;
    background: linear-gradient(45deg, #2563eb, #3b82f6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0;
  }

  .add-btn {
    background: linear-gradient(45deg, #3b82f6, #60a5fa);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .add-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(59, 130, 246, 0.2);
  }

  .add-btn.cancel {
    background: linear-gradient(45deg, #ef4444, #f87171);
  }

  .cert-form {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(12px);
    border-radius: 1rem;
    margin-bottom: 2rem;
    padding: 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
  }

  .form-group {
    margin-bottom: 1.25rem;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #1e293b;
  }

  .form-group input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    font-size: 1rem;
    transition: all 0.2s ease;
    background: rgba(255, 255, 255, 0.8);
  }

  .form-group input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .certificates-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
    padding: 1rem 0;
  }

  .cert-card {
    background: white;
    border-radius: 1rem;
    overflow: hidden;
    position: relative;
    transition: transform 0.3s ease;
    will-change: transform;
    border: 1px solid rgba(226, 232, 240, 0.6);
  }

  .cert-card:hover {
    transform: translateY(-0.5rem);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }

  .cert-image {
    height: 200px;
    background: #f8fafc;
    position: relative;
    overflow: hidden;
  }

  .cert-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  .cert-card:hover .cert-image img {
    transform: scale(1.05);
  }

  .cert-details {
    padding: 1.25rem;
    background: white;
  }

  .cert-details h3 {
    margin: 0 0 0.5rem;
    font-size: 1.125rem;
    font-weight: 600;
    color: #1e293b;
  }

  .issuer {
    color: #64748b;
    font-size: 0.875rem;
    margin: 0.25rem 0;
  }

  .date {
    color: #94a3b8;
    font-size: 0.875rem;
    margin: 0.5rem 0;
  }

  .pdf-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: #3b82f6;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .pdf-btn:hover {
    color: #2563eb;
    transform: translateX(2px);
  }

  .delete-confirm {
    background: rgba(239, 68, 68, 0.95);
    backdrop-filter: blur(4px);
  }

  @keyframes press-bar {
    0% { width: 0%; opacity: 0.5; }
    100% { width: 100%; opacity: 1; }
  }

  .press-bar {
    animation: press-bar 2s linear forwards;
  }
`}</style>

    </div>
  );
}