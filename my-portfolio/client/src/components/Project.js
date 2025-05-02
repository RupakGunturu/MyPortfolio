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
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        h2 {
          font-size: 24px;
          color: #333;
          margin: 0;
        }
        
        .add-btn {
          background: #4CAF50;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }
        
        .add-btn.cancel {
          background: #f44336;
        }
        
        .add-btn:hover {
          opacity: 0.9;
          transform: translateY(-2px);
        }
        
        .cert-form {
          background: #f9f9f9;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
          overflow: hidden;
        }
        
        .form-group {
          margin-bottom: 15px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
          color: #444;
        }
        
        .form-group input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }
        
        .image-preview {
          margin-top: 10px;
        }
        
        .image-preview img {
          max-width: 100%;
          max-height: 150px;
          border-radius: 4px;
          border: 1px solid #ddd;
        }
        
        .submit-btn {
          background: #2196F3;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          margin-top: 10px;
          transition: all 0.2s;
        }
        
        .submit-btn:hover {
          background: #0b7dda;
        }
        
        .error {
          color: #f44336;
          margin-top: 10px;
          font-size: 14px;
          padding: 8px;
          background: rgba(244, 67, 54, 0.1);
          border-radius: 4px;
        }
        
        .empty-state {
          text-align: center;
          padding: 50px 20px;
          color: #777;
          background: #f9f9f9;
          border-radius: 8px;
        }
        
        .empty-icon {
          font-size: 50px;
          margin-bottom: 15px;
          opacity: 0.5;
        }
        
        .certificates-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }
        
        .cert-card {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          position: relative;
          transition: transform 0.2s;
        }
        
        .cert-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .cert-image {
          height: 180px;
          background: #f5f5f5;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        
        .cert-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .image-placeholder {
          font-size: 60px;
          opacity: 0.3;
        }
        
        .cert-details {
          padding: 15px;
        }
        
        .cert-details h3 {
          margin: 0 0 5px;
          font-size: 18px;
          color: #333;
        }
        
        .issuer {
          color: #666;
          font-size: 14px;
          margin: 5px 0;
        }
        
        .date {
          color: #888;
          font-size: 13px;
          margin: 5px 0 10px;
        }
        
        .pdf-btn {
          background: none;
          border: none;
          color: #2196F3;
          padding: 5px 0;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }
        
        .pdf-btn:hover {
          color: #0b7dda;
          text-decoration: underline;
        }
        
        .press-indicator {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(0,0,0,0.7);
          color: white;
          padding: 10px;
          text-align: center;
          font-size: 12px;
        }
        
        .press-bar {
          height: 3px;
          background: white;
          width: 0%;
          margin-bottom: 5px;
          animation: press 2s linear forwards;
        }
        
        @keyframes press {
          to { width: 100%; }
        }
        
        .delete-confirm {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(244, 67, 54, 0.9);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          padding: 15px;
          text-align: center;
        }
        
        .delete-confirm p {
          margin-bottom: 15px;
        }
        
        .delete-actions {
          display: flex;
          gap: 10px;
        }
        
        .delete-actions button {
          padding: 5px 15px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .delete-actions button:first-child {
          background: white;
          color: #333;
        }
        
        .delete-btn {
          background: white;
          color: #f44336;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
}