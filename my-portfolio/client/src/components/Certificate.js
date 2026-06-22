import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Document, Page, pdfjs } from 'react-pdf';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up PDF.js worker
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;
}

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const useWindowWidth = () => {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return width;
};

function Certificates({ viewOnly = false, theme = 'dark', userId }) {
  const authContext = useContext(AuthContext);
  const { user } = authContext || {};
  const effectiveUserId = userId || (user && user._id);
  const windowWidth = useWindowWidth();
  const [certs, setCerts] = useState([]);
  const [form, setForm] = useState({ title: '', issuer: '', date: '', file: null });
  const [error, setError] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const fileInputRef = useRef(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pdfPreview, setPdfPreview] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [selectedCert, setSelectedCert] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);

  const isMobile = windowWidth < 768;
  const isSmall = windowWidth < 480;

  // Close mobile menu on outside click
  useEffect(() => {
    if (activeMenu === null) return;
    const close = () => setActiveMenu(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [activeMenu]);

  useEffect(() => {
    if (!effectiveUserId) return;
    const controller = new AbortController();
    const fetchCertificates = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/certificates?userId=${effectiveUserId}`, {
          signal: controller.signal,
        });
        setCerts(response.data);
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error('Failed to fetch certificates:', err);
        setError('Failed to load certificates. Please try again.');
      }
    };
    fetchCertificates();
    return () => controller.abort();
  }, [effectiveUserId]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setForm((prev) => ({ ...prev, file }));
    if (file && file.type.startsWith('image/')) {
      setFilePreview(URL.createObjectURL(file));
      setPdfPreview(null);
    } else if (file && file.type === 'application/pdf') {
      setPdfPreview(URL.createObjectURL(file));
      setFilePreview(null);
      setPageNumber(1);
    } else {
      setFilePreview(null);
      setPdfPreview(null);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError('');
    try {
      if (!form.title || !form.issuer || !form.date) throw new Error('All required fields must be filled');
      if (!effectiveUserId) throw new Error('User ID not available. Please try logging in again.');

      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('issuer', form.issuer);
      formData.append('date', form.date);
      formData.append('userId', effectiveUserId);

      if (form.file) {
        if (!form.file.type.match(/image\/(jpeg|png|gif|jpg)|application\/pdf/)) {
          throw new Error('Only images (JPEG, PNG, GIF) and PDF files are allowed');
        }
        formData.append('file', form.file);
      }

      const response = await axios.post(`${API_BASE_URL}/api/certificates`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setCerts((prev) => [response.data.certificate, ...prev]);
      toast.success('Certificate added successfully!');
      resetForm();
      setIsFormVisible(false);
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.message || 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => setNumPages(numPages);

  const resetForm = () => {
    setForm({ title: '', issuer: '', date: '', file: null });
    setFilePreview(null);
    setPdfPreview(null);
    setNumPages(null);
    setPageNumber(1);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const confirmDelete = (id) => setDeletingId(id);
  const cancelDelete = () => setDeletingId(null);

  const deleteCertificate = async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/certificates/${id}?userId=${effectiveUserId}`);
      if (response.data.success) {
        setCerts((prev) => prev.filter((cert) => cert._id !== id));
        setDeletingId(null);
        toast.success('Certificate deleted successfully!');
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed. Please try again.');
    }
  };

  /** Resolve the file URL + isPdf from a cert object */
  const resolveFileUrl = (cert) => {
    let fileUrl = null;
    let isPdf = false;
    const check = (raw) => {
      const url = raw.startsWith('http') ? raw : `${API_BASE_URL}${raw}`;
      const pdf = cert.contentType === 'application/pdf' || raw.toLowerCase().includes('.pdf');
      return { url, pdf };
    };
    if (cert.url) ({ url: fileUrl, pdf: isPdf } = check(cert.url));
    else if (cert.image) ({ url: fileUrl, pdf: isPdf } = check(cert.image));
    else if (cert.file) ({ url: fileUrl, pdf: isPdf } = check(cert.file));
    else if (cert.filename) {
      fileUrl = `${API_BASE_URL}/uploads/${cert.filename}`;
      isPdf = cert.contentType === 'application/pdf' || cert.filename.toLowerCase().includes('.pdf');
    }
    return { fileUrl, isPdf };
  };

  // ─── Styles ────────────────────────────────────────────────────────────────
  const dark = theme === 'dark';

  const styles = {
    container: {
      maxWidth: '100%',
      margin: '0 auto',
      padding: isSmall ? '16px 10px' : isMobile ? '24px 14px' : '32px 20px',
      fontFamily: "'Poppins', system-ui, sans-serif",
      background: dark ? 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)' : '#FFFFFF',
      minHeight: 'auto',
      width: '100%',
    },

    header: {
      display: 'flex',
      flexDirection: isSmall ? 'column' : 'row',
      alignItems: isSmall ? 'flex-start' : 'center',
      justifyContent: 'space-between',
      marginBottom: isSmall ? '1.5rem' : '2rem',
      maxWidth: '1400px',
      margin: isSmall ? '0 auto 1.5rem auto' : '0 auto 2rem auto',
      width: '100%',
      flexWrap: 'wrap',
      gap: '1rem',
      padding: isSmall ? '0 8px' : '0 20px',
    },

    heading: {
      fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
      fontWeight: '900',
      margin: 0,
      letterSpacing: '-1.5px',
      background: dark
        ? 'linear-gradient(135deg, #A78BFA 0%, #60A5FA 100%)'
        : 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },

    subHeading: {
      fontSize: '0.9rem',
      color: dark ? '#94A3B8' : '#64748B',
      margin: '0.25rem 0 0',
      fontWeight: '500',
    },

    addButton: {
      background: 'linear-gradient(135deg, #00BFFF 0%, #3B82F6 100%)',
      color: dark ? '#0F172A' : '#FFFFFF',
      border: 'none',
      padding: '0.65rem 1.25rem',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '0.9rem',
      transition: 'all 0.15s ease',
      boxShadow: '0 4px 6px -1px rgba(0,191,255,0.2)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.4rem',
      whiteSpace: 'nowrap',
    },

    cancelButton: {
      background: 'linear-gradient(45deg, #ef4444, #f87171)',
      color: '#FFFFFF',
      border: 'none',
      padding: '0.65rem 1.25rem',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '0.9rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.4rem',
      whiteSpace: 'nowrap',
    },

    form: {
      backgroundColor: dark ? '#1E293B' : '#FFFFFF',
      borderRadius: '0.75rem',
      padding: isSmall ? '1rem' : '1.5rem',
      border: dark ? '1px solid #334155' : '1px solid #E2E8F0',
      boxShadow: dark ? '0 4px 6px -1px rgba(0,0,0,0.3)' : '0 4px 6px -1px rgba(0,0,0,0.1)',
      maxWidth: '1400px',
      margin: isSmall ? '0 auto 1rem auto' : '0 auto 1.5rem auto',
      width: '100%',
    },

    formGroup: { marginBottom: '1.25rem' },

    label: {
      display: 'block',
      marginBottom: '0.4rem',
      fontWeight: '500',
      color: dark ? '#F8FAFC' : '#1E293B',
      fontSize: '0.9rem',
    },

    input: {
      width: '100%',
      padding: '0.7rem',
      border: dark ? '1px solid #334155' : '1px solid #E2E8F0',
      borderRadius: '0.5rem',
      fontSize: '16px',
      transition: 'all 0.15s ease',
      backgroundColor: dark ? '#0F172A' : '#F8FAFC',
      color: dark ? '#F8FAFC' : '#1E293B',
      boxSizing: 'border-box',
    },

    fileHint: {
      fontSize: '0.75rem',
      color: dark ? '#94A3B8' : '#64748B',
      marginTop: '0.25rem',
      fontStyle: 'italic',
    },

    formActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '0.75rem',
      marginTop: '0.5rem',
    },

    submitBtn: {
      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      color: dark ? '#0F172A' : '#FFFFFF',
      border: 'none',
      padding: '0.65rem 1.25rem',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '0.9rem',
      transition: 'opacity 0.15s ease',
    },

    formCancelBtn: {
      backgroundColor: dark ? '#334155' : '#F1F5F9',
      color: dark ? '#F8FAFC' : '#475569',
      border: dark ? '1px solid #475569' : '1px solid #CBD5E1',
      padding: '0.65rem 1.1rem',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '0.9rem',
    },

    errorText: {
      marginTop: '0.75rem',
      color: '#ef4444',
      fontWeight: '600',
      fontSize: '0.875rem',
      textAlign: 'center',
    },

    emptyState: {
      textAlign: 'center',
      color: dark ? '#94A3B8' : '#64748B',
      fontWeight: '600',
      fontSize: '1rem',
      padding: '3rem 1rem',
    },

    // ── Card Grid ──────────────────────────────────────────────────────────
    grid: {
      display: 'grid',
      gridTemplateColumns: isSmall
        ? '1fr'
        : isMobile
        ? 'repeat(2, 1fr)'
        : 'repeat(auto-fill, minmax(250px, 1fr))',
      gap: isSmall ? '0.875rem' : '1rem',
      width: '100%',
      maxWidth: '1400px',
      margin: '0 auto',
      padding: isSmall ? '0 8px' : isMobile ? '0 12px' : '0 20px',
    },

    // ── Card ──────────────────────────────────────────────────────────────
    card: {
      position: 'relative',
      backgroundColor: dark ? '#1E293B' : '#FFFFFF',
      borderRadius: '0.75rem',
      boxShadow: dark ? '0 4px 12px rgba(0,0,0,0.35)' : '0 4px 12px rgba(0,0,0,0.08)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      cursor: 'pointer',
    },

    // ── Square thumbnail (image slot) ─────────────────────────────────────
    thumbnail: {
      width: '100%',
      aspectRatio: '1 / 1',
      overflow: 'hidden',
      backgroundColor: dark ? '#334155' : '#F1F5F9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },

    thumbnailImg: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      display: 'block',
    },

    noThumb: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.4rem',
      color: dark ? '#64748B' : '#94A3B8',
      fontSize: '0.8rem',
    },

    // ── Card details strip ────────────────────────────────────────────────
    details: {
      padding: isSmall ? '0.6rem 0.75rem 0.75rem' : '0.75rem 0.875rem 0.875rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.15rem',
    },

    certTitle: {
      color: dark ? '#F8FAFC' : '#1E293B',
      fontSize: isSmall ? '0.8rem' : '0.875rem',
      fontWeight: '700',
      margin: 0,
      lineHeight: 1.3,
      overflow: 'hidden',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
    },

    certIssuer: {
      color: dark ? '#94A3B8' : '#64748B',
      fontSize: '0.75rem',
      margin: 0,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },

    certDate: {
      color: dark ? '#64748B' : '#94A3B8',
      fontSize: '0.7rem',
      margin: 0,
    },

    // ── Delete X button — top-right corner, subtle ────────────────────────
    deleteBtn: {
      position: 'absolute',
      top: '6px',
      right: '6px',
      zIndex: 10,
      width: '22px',
      height: '22px',
      borderRadius: '50%',
      background: 'rgba(0,0,0,0.45)',
      backdropFilter: 'blur(4px)',
      WebkitBackdropFilter: 'blur(4px)',
      color: '#fff',
      border: 'none',
      fontSize: '12px',
      fontWeight: '600',
      lineHeight: 1,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: 0,
      transition: 'opacity 0.15s ease, background 0.12s ease',
    },

    // ── Delete confirm overlay (on card) ──────────────────────────────────
    deleteConfirmOverlay: {
      position: 'absolute',
      inset: 0,
      backgroundColor: dark ? 'rgba(0,0,0,0.82)' : 'rgba(0,0,0,0.72)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 20,
      borderRadius: '0.75rem',
    },

    deleteConfirmBox: {
      backgroundColor: dark ? '#1E293B' : '#FFFFFF',
      padding: '1rem',
      borderRadius: '0.625rem',
      textAlign: 'center',
      width: '85%',
      border: dark ? '1px solid #334155' : '1px solid #E2E8F0',
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    },

    confirmText: {
      color: dark ? '#F8FAFC' : '#1E293B',
      marginBottom: '0.875rem',
      fontSize: '0.8rem',
      lineHeight: 1.4,
    },

    confirmActions: {
      display: 'flex',
      gap: '0.5rem',
      justifyContent: 'center',
    },

    confirmDeleteBtn: {
      background: '#ef4444',
      color: '#fff',
      border: 'none',
      padding: '0.4rem 0.875rem',
      borderRadius: '0.375rem',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '0.8rem',
    },

    confirmCancelBtn: {
      backgroundColor: dark ? '#334155' : '#F1F5F9',
      color: dark ? '#F8FAFC' : '#475569',
      border: 'none',
      padding: '0.4rem 0.875rem',
      borderRadius: '0.375rem',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '0.8rem',
    },

    // ── PDF preview in form ───────────────────────────────────────────────
    pdfPreviewContainer: {
      margin: '0.875rem 0',
      border: `1px solid ${dark ? '#475569' : '#CBD5E1'}`,
      borderRadius: '8px',
      padding: '0.875rem',
      backgroundColor: dark ? '#334155' : '#F8FAFC',
      textAlign: 'center',
    },

    pdfControls: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '0.75rem',
      marginTop: '0.5rem',
    },

    pdfButton: {
      padding: '0.25rem 0.6rem',
      backgroundColor: dark ? '#475569' : '#E2E8F0',
      color: dark ? '#F8FAFC' : '#1E293B',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '0.8rem',
      fontWeight: '500',
    },

    pdfInfo: {
      color: dark ? '#94A3B8' : '#64748B',
      fontSize: '0.8rem',
      margin: 0,
    },
  };

  // ─── Modal styles (responsive) ─────────────────────────────────────────────
  const modalOverlay = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15,23,42,0.75)',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: isMobile ? 'flex-end' : 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: isMobile ? '0' : '1rem',
  };

  const modalBox = {
    background: dark ? '#1E293B' : '#FFFFFF',
    borderRadius: isMobile ? '1.25rem 1.25rem 0 0' : '1rem',
    padding: isMobile ? '1rem 1rem 1.5rem' : '1.5rem',
    width: isMobile ? '100%' : 'min(560px, 92vw)',
    maxHeight: isMobile ? '92vh' : '88vh',
    overflowY: 'auto',
    position: 'relative',
    boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
    border: dark ? '1px solid #334155' : '1px solid #E2E8F0',
    paddingBottom: isMobile ? 'max(1.5rem, env(safe-area-inset-bottom))' : '1.5rem',
  };

  const modalCloseBtn = {
    position: 'absolute',
    top: '12px',
    right: '12px',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: dark ? '#334155' : '#F1F5F9',
    border: 'none',
    fontSize: '18px',
    fontWeight: '700',
    color: dark ? '#94A3B8' : '#475569',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
    transition: 'background 0.15s ease, color 0.15s ease',
    flexShrink: 0,
  };

  // Drag handle (mobile sheet indicator)
  const dragHandle = isMobile ? (
    <div style={{
      width: '36px',
      height: '4px',
      borderRadius: '2px',
      background: dark ? '#475569' : '#CBD5E1',
      margin: '0 auto 1rem auto',
    }} />
  ) : null;

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <section style={styles.container}>
      {/* Header */}
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

      {/* Add form */}
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
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Issued By *</label>
              <input
                value={form.issuer}
                onChange={(e) => setForm({ ...form, issuer: e.target.value })}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Date Issued *</label>
              <DatePicker
                style={{ width: '100%', padding: '0.7rem', fontSize: '16px' }}
                format="YYYY-MM-DD"
                value={form.date ? dayjs(form.date) : null}
                onChange={(date) => setForm({ ...form, date: date ? date.format('YYYY-MM-DD') : '' })}
                placeholder="Select date"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Upload Document (Image or PDF)</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              {!form.file ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    width: '100%',
                    padding: '1.25rem',
                    border: `2px dashed ${dark ? '#475569' : '#CBD5E1'}`,
                    borderRadius: '0.75rem',
                    background: dark ? 'rgba(15,23,42,0.5)' : '#F8FAFC',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: dark ? '#94A3B8' : '#64748B',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3B82F6'; e.currentTarget.style.background = dark ? 'rgba(30,58,138,0.2)' : '#EFF6FF'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = dark ? '#475569' : '#CBD5E1'; e.currentTarget.style.background = dark ? 'rgba(15,23,42,0.5)' : '#F8FAFC'; }}
                >
                  <span style={{ fontSize: '2rem' }}>📎</span>
                  <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>Click to upload</span>
                  <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>JPG, PNG, GIF, or PDF</span>
                </button>
              ) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  border: `1px solid ${dark ? '#334155' : '#E2E8F0'}`,
                  borderRadius: '0.5rem',
                  background: dark ? '#0F172A' : '#F8FAFC',
                }}>
                  <span style={{ fontSize: '1.5rem' }}>
                    {form.file.type === 'application/pdf' ? '📄' : '🖼'}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: '600', fontSize: '0.875rem', color: dark ? '#F8FAFC' : '#1E293B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {form.file.name}
                    </p>
                    <p style={{ margin: '0.15rem 0 0', fontSize: '0.75rem', color: dark ? '#94A3B8' : '#64748B' }}>
                      {(form.file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { resetForm(); fileInputRef.current.value = ''; }}
                    style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      background: '#FEE2E2', border: 'none', color: '#EF4444',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '14px', fontWeight: '700', flexShrink: 0,
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#FECACA'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#FEE2E2'}
                  >×</button>
                </div>
              )}
            </div>

            {filePreview && (
              <div style={{ margin: '0.875rem 0' }}>
                <img
                  src={filePreview}
                  alt="Preview"
                  style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8, border: `1px solid ${dark ? '#475569' : '#CBD5E1'}` }}
                />
              </div>
            )}

            {pdfPreview && (
              <div style={styles.pdfPreviewContainer}>
                <Document
                  file={pdfPreview}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={<div style={styles.pdfInfo}>Loading PDF...</div>}
                  error={<div style={styles.pdfInfo}>Error loading PDF</div>}
                >
                  <Page
                    pageNumber={pageNumber}
                    width={Math.min(400, window.innerWidth - 100)}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                </Document>
                {numPages && numPages > 1 && (
                  <div style={styles.pdfControls}>
                    <button
                      type="button"
                      onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                      disabled={pageNumber <= 1}
                      style={styles.pdfButton}
                    >
                      Previous
                    </button>
                    <p style={styles.pdfInfo}>Page {pageNumber} of {numPages}</p>
                    <button
                      type="button"
                      onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
                      disabled={pageNumber >= numPages}
                      style={styles.pdfButton}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}

            <div style={styles.formActions}>
              <button type="button" onClick={() => setIsFormVisible(false)} style={styles.formCancelBtn}>
                Cancel
              </button>
              <button type="submit" style={styles.submitBtn} disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Certificate'}
              </button>
            </div>
            {error && <div style={styles.errorText}>{error}</div>}
          </motion.form>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {certs.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={{ fontSize: '3rem', marginBottom: '0.75rem', opacity: 0.35 }}>📄</div>
          <p style={{ margin: 0 }}>No certificates yet. Add your first one!</p>
        </div>
      ) : (
        /* ── Grid ── */
        <div style={styles.grid}>
          {certs.map((cert) => {
            const { fileUrl, isPdf } = resolveFileUrl(cert);

            return (
              <motion.div
                key={cert._id}
                style={styles.card}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 28, mass: 0.5 }}
                whileHover={{ y: -5, boxShadow: dark ? '0 12px 28px rgba(0,0,0,0.5)' : '0 12px 28px rgba(30,41,59,0.14)' }}
                onMouseEnter={() => setHoveredCard(cert._id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => { setSelectedCert(cert); setShowModal(true); }}
              >
                {/* ── Action button: ⋮ on mobile, X on desktop ── */}
                {!viewOnly && (
                  isMobile ? (
                    <div style={{ position: 'absolute', top: '6px', right: '6px', zIndex: 15 }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === cert._id ? null : cert._id); }}
                        style={{
                          background: 'none', border: 'none', color: dark ? '#94A3B8' : '#64748B',
                          fontSize: '18px', fontWeight: '700', cursor: 'pointer', padding: '2px 4px',
                          lineHeight: 1, letterSpacing: '2px',
                        }}
                        aria-label="More options"
                      >⋮</button>
                      {activeMenu === cert._id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            position: 'absolute', top: '32px', right: 0,
                            background: dark ? '#1E293B' : '#fff',
                            border: `1px solid ${dark ? '#334155' : '#E2E8F0'}`,
                            borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                            minWidth: '120px', overflow: 'hidden', zIndex: 20,
                          }}
                        >
                          <button
                            onClick={() => { confirmDelete(cert._id); setActiveMenu(null); }}
                            style={{
                              width: '100%', padding: '10px 14px', background: 'none', border: 'none',
                              color: '#ef4444', fontWeight: '600', fontSize: '0.85rem', textAlign: 'left',
                              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = dark ? '#334155' : '#FEE2E2'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                          >🗑 Delete</button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      style={{ ...styles.deleteBtn, opacity: hoveredCard === cert._id ? 1 : 0 }}
                      onClick={(e) => { e.stopPropagation(); confirmDelete(cert._id); }}
                      aria-label="Delete Certificate"
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#dc2626'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.45)'; }}
                    >×</button>
                  )
                )}

                {/* ── Square thumbnail ── */}
                <div style={styles.thumbnail}>
                  {fileUrl ? (
                    isPdf ? (
                      <Document
                        file={fileUrl}
                        options={{
                          cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
                          cMapPacked: true,
                          standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/standard_fonts/',
                        }}
                        loading={
                          <div style={styles.noThumb}>
                            <span style={{ fontSize: '1.75rem' }}>📄</span>
                            <span>Loading…</span>
                          </div>
                        }
                        error={
                          <div style={styles.noThumb}>
                            <span style={{ fontSize: '1.75rem' }}>📄</span>
                            <span>PDF</span>
                          </div>
                        }
                      >
                        <Page
                          pageNumber={1}
                          width={240}
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                          loading={<div style={styles.noThumb}><span>Loading page…</span></div>}
                          error={<div style={styles.noThumb}><span style={{ fontSize: '1.75rem' }}>📄</span></div>}
                        />
                      </Document>
                    ) : (
                      <img
                        src={fileUrl}
                        alt={`${cert.title} Certificate`}
                        style={styles.thumbnailImg}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML =
                            `<div style="display:flex;flex-direction:column;align-items:center;gap:0.3rem;color:${dark ? '#64748B' : '#94A3B8'};font-size:0.75rem"><span style="font-size:1.75rem">🖼</span><span>No preview</span></div>`;
                        }}
                      />
                    )
                  ) : (
                    <div style={styles.noThumb}>
                      <span style={{ fontSize: '1.75rem' }}>📄</span>
                      <span>No preview</span>
                    </div>
                  )}
                </div>

                {/* ── Details strip ── */}
                <div style={styles.details}>
                  <h3 style={styles.certTitle}>{cert.title}</h3>
                  <p style={styles.certIssuer}>{cert.issuer}</p>
                  <p style={styles.certDate}>
                    {new Date(cert.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                  </p>
                </div>

                {/* ── Delete confirm overlay ── */}
                {deletingId === cert._id && !viewOnly && (
                  <motion.div
                    style={styles.deleteConfirmOverlay}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div style={styles.deleteConfirmBox}>
                      <p style={styles.confirmText}>Delete this certificate?</p>
                      <div style={styles.confirmActions}>
                        <button onClick={cancelDelete} style={styles.confirmCancelBtn}>Cancel</button>
                        <button onClick={() => deleteCertificate(cert._id)} style={styles.confirmDeleteBtn}>
                          Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Modal ── */}
      <AnimatePresence>
        {showModal && selectedCert && (
          <motion.div
            style={modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              style={modalBox}
              initial={isMobile ? { y: '100%' } : { scale: 0.93, opacity: 0 }}
              animate={isMobile ? { y: 0 } : { scale: 1, opacity: 1 }}
              exit={isMobile ? { y: '100%' } : { scale: 0.93, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag handle on mobile */}
              {dragHandle}

              {/* Close button */}
              <button
                onClick={() => setShowModal(false)}
                style={modalCloseBtn}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = dark ? '#334155' : '#F1F5F9'; e.currentTarget.style.color = dark ? '#94A3B8' : '#475569'; }}
                aria-label="Close"
              >
                ×
              </button>

              {/* Certificate image / PDF */}
              {(() => {
                const { fileUrl, isPdf } = resolveFileUrl(selectedCert);
                if (!fileUrl) return (
                  <div style={{
                    background: dark ? '#334155' : '#F1F5F9',
                    borderRadius: '0.625rem',
                    padding: '2rem',
                    textAlign: 'center',
                    color: dark ? '#64748B' : '#94A3B8',
                    marginBottom: '1rem',
                  }}>
                    <span style={{ fontSize: '2.5rem' }}>📄</span>
                    <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem' }}>No preview available</p>
                  </div>
                );

                if (isPdf) {
                  return (
                    <div style={{
                      borderRadius: '0.625rem',
                      overflow: 'hidden',
                      marginBottom: '1rem',
                      background: dark ? '#334155' : '#F1F5F9',
                      display: 'flex',
                      justifyContent: 'center',
                      padding: '0.5rem',
                    }}>
                      <Document
                        file={fileUrl}
                        loading={<div style={{ padding: '2rem', color: '#64748B', textAlign: 'center' }}>Loading PDF…</div>}
                      >
                        <Page
                          pageNumber={1}
                          width={Math.min(500, windowWidth - (isMobile ? 48 : 96))}
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                        />
                      </Document>
                    </div>
                  );
                }

                return (
                  <div style={{
                    borderRadius: '0.625rem',
                    overflow: 'hidden',
                    marginBottom: '1rem',
                    background: dark ? '#0F172A' : '#F8FAFC',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    maxHeight: isMobile ? '55vw' : '400px',
                  }}>
                    <img
                      src={fileUrl}
                      alt={selectedCert.title}
                      style={{
                        maxWidth: '100%',
                        maxHeight: isMobile ? '55vw' : '400px',
                        objectFit: 'contain',
                        display: 'block',
                      }}
                    />
                  </div>
                );
              })()}

              {/* Meta info */}
              <div style={{ paddingTop: '0.25rem' }}>
                <h3 style={{
                  color: dark ? '#F8FAFC' : '#1E293B',
                  margin: '0 0 0.35rem 0',
                  fontSize: isMobile ? '1rem' : '1.15rem',
                  fontWeight: '700',
                  paddingRight: '2rem',
                }}>
                  {selectedCert.title}
                </h3>
                <p style={{ color: dark ? '#94A3B8' : '#64748B', margin: '0 0 0.2rem', fontSize: '0.875rem' }}>
                  {selectedCert.issuer}
                </p>
                <p style={{ color: dark ? '#64748B' : '#94A3B8', margin: 0, fontSize: '0.8rem' }}>
                  {new Date(selectedCert.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default Certificates;
