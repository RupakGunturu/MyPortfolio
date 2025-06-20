import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import './Certificate.css';

function Certificates() {
  const [certs, setCerts] = useState([]);
  const [form, setForm] = useState({
    title: '',
    issuer: '',
    date: '',
    file: null,
  });
  const [error, setError] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const response = await axios.get('/api/certificates');
      setCerts(response.data);
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
        // Accept both images and PDFs
        if (!form.file.type.match(/image\/(jpeg|png|gif|jpg)|application\/pdf/)) {
          throw new Error('Only images (JPEG, PNG, GIF) and PDF files are allowed');
        }
        formData.append('file', form.file);
      }

      const response = await axios.post('/api/certificates', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setCerts(prev => [response.data, ...prev]);
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

  const confirmDelete = (id) => {
    setDeletingId(id);
  };

  const cancelDelete = () => {
    setDeletingId(null);
  };

const deleteCertificate = async (id) => {
  console.log('Attempting to delete:', id);
  try {
    const response = await axios.delete(`/api/certificates/${id}`);
    
    if (response.data.success) {
      setCerts(prev => prev.filter(cert => cert._id !== id));
      setDeletingId(null);
    } else {
      throw new Error(response.data.message);
    }
  } catch (err) {
    console.error('Delete failed:', {
      error: err,
      response: err.response?.data
    });
    setError(err.response?.data?.message || 'Delete failed. Please try again.');
  }
};

  const openFile = (url) => {
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
                className="modern-date"
              />
            </div>

            <div className="form-group">
              <label>Upload Document (Image or PDF)</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
              />
              <p className="file-hint">Supports JPG, PNG, GIF, or PDF files</p>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => setIsFormVisible(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
              <button type="submit" className="submit-btn">
                Save Certificate
              </button>
            </div>
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
              whileHover={{ scale: 1.02 }}
            >
              <button
  className="delete-x-btn"
  onClick={(e) => {
    e.stopPropagation(); // This prevents the event from reaching the card
    confirmDelete(cert._id);
  }}
  aria-label="Delete Certificate"
  title="Delete Certificate"
>
  ×
</button>


              <div className="cert-image">
                {cert.url ? (
                  <img
                    src={cert.url}
                    alt="Certificate"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/300x200?text=Certificate+Preview";
                    }}
                  />
                ) : (
                  <div className="no-image-placeholder">
                    <span>No Preview Available</span>
                  </div>
                )}
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

                {deletingId === cert._id && (
                  <div className="delete-confirm-overlay">
                    <div className="delete-confirm-box">
                      <p>Are you sure you want to delete this certificate?</p>
                      <div className="confirm-actions">
                        <button onClick={cancelDelete} className="cancel-btn">
                          Cancel
                        </button>
                        <button
                          onClick={() => deleteCertificate(cert._id)}
                          className="confirm-delete-btn"
                        >
                          Yes, Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Certificates;
