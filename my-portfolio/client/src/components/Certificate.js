import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import AuthContext from '../context/AuthContext';
import API_BASE_URL from '../utils/api';

function Certificates({ viewOnly = false, theme = 'dark', userId }) {
  const authContext = useContext(AuthContext);
  const { user } = authContext || {};
  const effectiveUserId = userId || (user && user._id);
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
    if (effectiveUserId) {
      fetchCertificates();
    }
  }, [effectiveUserId]);

  const fetchCertificates = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/certificates?userId=${effectiveUserId}`);
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

      console.log('Certificate upload - User object:', user);
      console.log('Certificate upload - User ID:', effectiveUserId);

      if (!effectiveUserId) {
        throw new Error('User ID not available. Please try logging in again.');
      }

      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('issuer', form.issuer);
      formData.append('date', form.date);
      formData.append('userId', effectiveUserId);

      if (form.file) {
        // Accept both images and PDFs
        if (!form.file.type.match(/image\/(jpeg|png|gif|jpg)|application\/pdf/)) {
          throw new Error('Only images (JPEG, PNG, GIF) and PDF files are allowed');
        }
        formData.append('file', form.file);
      }

      const response = await axios.post(`${API_BASE_URL}/api/certificates`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setCerts(prev => [response.data.certificate, ...prev]);
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
    const response = await axios.delete(`${API_BASE_URL}/api/certificates/${id}?userId=${effectiveUserId}`);
    
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

  // Theme-aware styles
  const styles = {
    container: {
      maxWidth: '100%',
      margin: '0 auto',
      padding: '40px 20px',
      fontFamily: "'Inter', system-ui, sans-serif",
      background: theme === 'dark' 
        ? 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)'
        : '#FFFFFF',
      minHeight: 'auto',
      width: '100%',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '3rem',
      paddingBottom: '1rem',
      borderBottom: 'none',
      maxWidth: '1400px',
      margin: '0 auto 3rem auto',
      width: '100%',
      flexWrap: 'wrap',
      gap: '1rem',
      padding: '0 20px',
    },
    heading: {
      fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
      fontWeight: '900',
      color: theme === 'dark' ? '#F8FAFC' : '#1E293B',
      margin: 0,
      letterSpacing: '-1.5px',
      background: theme === 'dark'
        ? 'linear-gradient(135deg, #A78BFA 0%, #60A5FA 100%)'
        : 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    subHeading: {
      fontSize: '1.2rem',
      color: theme === 'dark' ? '#94A3B8' : '#64748B',
      margin: '0.25rem 0 0',
      fontWeight: '500',
      letterSpacing: '0.5px',
    },
    addButton: {
      background: 'linear-gradient(135deg, #00BFFF 0%, #3B82F6 100%)',
      color: theme === 'dark' ? '#0F172A' : '#FFFFFF',
      border: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontWeight: '600',
      transition: 'all 0.15s ease',
      boxShadow: '0 4px 6px -1px rgba(0, 191, 255, 0.2)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    cancelButton: {
      background: 'linear-gradient(45deg, #ef4444, #f87171)',
      color: theme === 'dark' ? '#0F172A' : '#FFFFFF',
      border: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontWeight: '600',
      transition: 'all 0.15s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    form: {
      backgroundColor: theme === 'dark' ? '#1E293B' : '#FFFFFF',
      borderRadius: '0.75rem',
      marginBottom: '2rem',
      padding: '1.5rem',
      border: theme === 'dark' ? '1px solid #334155' : '1px solid #E2E8F0',
      boxShadow: theme === 'dark' 
        ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
        : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      maxWidth: '1400px',
      margin: '0 auto 2rem auto',
      width: '100%',
    },
    formGroup: {
      marginBottom: '1.5rem',
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      fontWeight: '500',
      color: theme === 'dark' ? '#F8FAFC' : '#1E293B',
      fontSize: '0.95rem',
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      border: theme === 'dark' ? '1px solid #334155' : '1px solid #E2E8F0',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      transition: 'all 0.15s ease',
      backgroundColor: theme === 'dark' ? '#0F172A' : '#F8FAFC',
      color: theme === 'dark' ? '#F8FAFC' : '#1E293B',
    },
    fileHint: {
      fontSize: '0.8rem',
      color: theme === 'dark' ? '#94A3B8' : '#64748B',
      marginTop: '0.25rem',
      fontStyle: 'italic',
    },
    formActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '1rem',
    },
    submitBtn: {
      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      color: theme === 'dark' ? '#0F172A' : '#FFFFFF',
      border: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontWeight: '600',
      transition: 'opacity 0.15s ease',
    },
    formCancelBtn: {
      backgroundColor: theme === 'dark' ? '#334155' : '#F1F5F9',
      color: theme === 'dark' ? '#F8FAFC' : '#475569',
      border: theme === 'dark' ? '1px solid #475569' : '1px solid #CBD5E1',
      padding: '0.75rem 1.25rem',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontWeight: '600',
      transition: 'background-color 0.15s ease',
    },
    error: {
      marginTop: '1rem',
      color: '#ef4444',
      fontWeight: '600',
      fontSize: '0.9rem',
      textAlign: 'center',
    },
    emptyState: {
      marginTop: '4rem',
      textAlign: 'center',
      color: theme === 'dark' ? '#94A3B8' : '#64748B',
      fontWeight: '600',
      fontSize: '1.2rem',
      maxWidth: '1400px',
      margin: '4rem auto 0 auto',
      width: '100%',
    },
    emptyIcon: {
      fontSize: '4rem',
      marginBottom: '1rem',
      opacity: '0.4',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '1.5rem',
      width: '100%',
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '0 20px',
    },
    card: {
      position: 'relative',
      backgroundColor: theme === 'dark' ? '#1E293B' : '#FFFFFF',
      borderRadius: '1rem',
      boxShadow: theme === 'dark' 
        ? '0 8px 15px rgba(0,0,0,0.3)'
        : '0 8px 15px rgba(0,0,0,0.07)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      maxWidth: '350px',
      minWidth: '320px',
      width: '100%',
      margin: '0 auto',
    },
    deleteBtn: {
      background: '#ff4444',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      width: '25px',
      height: '25px',
      fontSize: '16px',
      cursor: 'pointer',
      position: 'absolute',
      top: '10px',
      right: '10px',
      zIndex: '10',
      transition: 'all 0.15s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    image: {
      width: '100%',
      height: '200px',
      objectFit: 'cover',
      backgroundColor: theme === 'dark' ? '#334155' : '#F1F5F9',
    },
    noImagePlaceholder: {
      width: '100%',
      height: '200px',
      backgroundColor: theme === 'dark' ? '#334155' : '#F1F5F9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: theme === 'dark' ? '#94A3B8' : '#64748B',
      fontSize: '0.9rem',
    },
    details: {
      padding: '1rem',
    },
    title: {
      color: theme === 'dark' ? '#F8FAFC' : '#1E293B',
      fontSize: '1.125rem',
      fontWeight: '600',
      margin: '0 0 0.5rem 0',
    },
    issuer: {
      color: theme === 'dark' ? '#94A3B8' : '#64748B',
      fontSize: '0.9rem',
      margin: '0 0 0.25rem 0',
    },
    date: {
      color: theme === 'dark' ? '#94A3B8' : '#64748B',
      fontSize: '0.8rem',
      margin: '0',
    },
    deleteConfirmOverlay: {
      position: 'absolute',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: '20',
    },
    deleteConfirmBox: {
      backgroundColor: theme === 'dark' ? '#1E293B' : '#FFFFFF',
      padding: '1.5rem',
      borderRadius: '0.75rem',
      textAlign: 'center',
      maxWidth: '300px',
      border: theme === 'dark' ? '1px solid #334155' : '1px solid #E2E8F0',
    },
    confirmText: {
      color: theme === 'dark' ? '#F8FAFC' : '#1E293B',
      marginBottom: '1rem',
      fontSize: '0.95rem',
    },
    confirmActions: {
      display: 'flex',
      gap: '0.75rem',
      justifyContent: 'center',
    },
    confirmDeleteBtn: {
      background: '#ef4444',
      color: 'white',
      border: 'none',
      padding: '0.5rem 1rem',
      borderRadius: '0.375rem',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '0.875rem',
      transition: 'background-color 0.15s ease',
    },
  };

  return (
    <section style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.heading}>My Certificates</h2>
          <p style={styles.subHeading}>Manage your professional certifications</p>
        </div>
        {!viewOnly && (
        <button
          onClick={() => setIsFormVisible(!isFormVisible)}
            style={isFormVisible ? styles.cancelButton : styles.addButton}
        >
          {isFormVisible ? '✕ Close' : '＋ Add Certificate'}
        </button>
        )}
      </div>

      <AnimatePresence>
        {isFormVisible && !viewOnly && (
          <motion.form
            onSubmit={onSubmit}
            style={styles.form}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            encType="multipart/form-data"
          >
            <div style={styles.formGroup}>
              <label style={styles.label}>Certificate Title *</label>
              <input
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Issued By *</label>
              <input
                value={form.issuer}
                onChange={e => setForm({ ...form, issuer: e.target.value })}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Date Issued *</label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Upload Document (Image or PDF)</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                style={styles.input}
              />
              <p style={styles.fileHint}>Supports JPG, PNG, GIF, or PDF files</p>
            </div>

            <div style={styles.formActions}>
              <button
                type="button"
                onClick={() => setIsFormVisible(false)}
                style={styles.formCancelBtn}
              >
                Cancel
              </button>
              <button type="submit" style={styles.submitBtn}>
                Save Certificate
              </button>
            </div>
            {error && <div style={styles.error}>{error}</div>}
          </motion.form>
        )}
      </AnimatePresence>

      {certs.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📄</div>
          <p>No certificates yet. Add your first one!</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {certs.map(cert => (
            <motion.div
              key={cert._id}
              style={styles.card}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 600, damping: 30, mass: 0.5 }}
              whileHover={{ 
                y: -8, 
                scale: 1.03,
                boxShadow: theme === 'dark'
                  ? '0 12px 24px rgba(0,0,0,0.4)'
                  : '0 12px 24px rgba(30, 41, 59, 0.15)'
              }}
            >
              {!viewOnly && (
              <button
                  style={styles.deleteBtn}
  onClick={(e) => {
                    e.stopPropagation();
    confirmDelete(cert._id);
  }}
  aria-label="Delete Certificate"
  title="Delete Certificate"
>
  ×
</button>
              )}

              <div>
                {cert.url ? (
                  <img
                    src={cert.url}
                    alt="Certificate"
                    style={styles.image}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/300x200?text=Certificate+Preview";
                    }}
                  />
                ) : (
                  <div style={styles.noImagePlaceholder}>
                    <span>No Preview Available</span>
                  </div>
                )}
              </div>

              <div style={styles.details}>
                <h3 style={styles.title}>{cert.title}</h3>
                <p style={styles.issuer}>{cert.issuer}</p>
                <p style={styles.date}>
                  {new Date(cert.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>

                {deletingId === cert._id && !viewOnly && (
                  <div style={styles.deleteConfirmOverlay}>
                    <div style={styles.deleteConfirmBox}>
                      <p style={styles.confirmText}>Are you sure you want to delete this certificate?</p>
                      <div style={styles.confirmActions}>
                        <button onClick={cancelDelete} style={styles.formCancelBtn}>
                          Cancel
                        </button>
                        <button
                          onClick={() => deleteCertificate(cert._id)}
                          style={styles.confirmDeleteBtn}
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
    </section>
  );
}

export default Certificates;
