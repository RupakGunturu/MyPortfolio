import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { FiEdit, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const fieldOptions = [
  'Name',
  'Interests',
  'Skills',
  'Achievements',
  'Hobbies',
  'Social Links',
];

const multiValueFields = ['Interests', 'Skills', 'Achievements', 'Hobbies', 'Social Links'];

const About = ({ viewOnly = false, userId }) => {
  const authContext = useContext(AuthContext);
  const { user } = authContext || {};
  const effectiveUserId = userId || (user && user._id);
  const [selectedFields, setSelectedFields] = useState([]);
  const [userData, setUserData] = useState({
    name: '',
    title: '',
    location: '',
    email: '',
    phone: '',
    about: '',
    education: [],
    languages: [],
    interests: []
  });
  const [showEditDropdown, setShowEditDropdown] = useState(false);
  const [showAdditionalFields, setShowAdditionalFields] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [, setError] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [editingValue, setEditingValue] = useState('');

  const fetchAbout = async () => {
    if (!effectiveUserId) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/api/about?userId=${effectiveUserId}`);
      setUserData(response.data.data || {});
      setIsLoading(false);
    } catch (err) {
      setError('Failed to load about info. Please try again.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAbout();
  }, [effectiveUserId]);

  useEffect(() => {
    if (Object.keys(userData).length === 0) return;

    const allFieldsWithData = fieldOptions.filter(field => {
      const value = userData[field];
      return Array.isArray(value) ? value.length > 0 : !!value;
    });

    if (viewOnly) {
      const backendSelectedFields = userData.selectedFields && Array.isArray(userData.selectedFields)
        ? userData.selectedFields.filter(field => allFieldsWithData.includes(field))
        : null;
      const defaultFields = ['Name', 'Interests', 'Achievements'];
      const additionalFields = ['Hobbies', 'Skills', 'Social Links'];
      let fieldsToShow = defaultFields.filter(field => allFieldsWithData.includes(field));
      if (showAdditionalFields) {
        if (backendSelectedFields && backendSelectedFields.length > 0) {
          fieldsToShow = backendSelectedFields;
        } else {
          const additional = additionalFields.filter(field => allFieldsWithData.includes(field));
          fieldsToShow = [...new Set([...fieldsToShow, ...additional])];
        }
      }
      setSelectedFields(fieldsToShow);
    } else {
      const defaultFields = ['Name', 'Interests', 'Achievements'];
      const fieldsToShow = defaultFields.filter(field => allFieldsWithData.includes(field));
      setSelectedFields(fieldsToShow);
    }
  }, [userData, viewOnly, showAdditionalFields]);

  const toggleField = (field) => {
    const defaultFields = ['Name', 'Interests', 'Skills'];
    if (defaultFields.includes(field) && selectedFields.includes(field)) {
      return;
    }
    setSelectedFields(fields =>
      fields.includes(field)
        ? fields.filter(f => f !== field)
        : [...fields, field]
    );
  };

  const handleEditField = (field) => {
    const isMulti = multiValueFields.includes(field);
    const currentValue = userData[field];
    setEditingField(field);
    setEditingValue(isMulti && Array.isArray(currentValue) ? currentValue.join(', ') : currentValue || '');
  };

  const handleSaveEdit = async () => {
    if (!editingField) return;
    const isMulti = multiValueFields.includes(editingField);
    const finalValue = isMulti
      ? editingValue.split(',').map(s => s.trim()).filter(Boolean)
      : editingValue;
    const updatedData = { ...userData, [editingField]: finalValue };
    setUserData(updatedData);
    setEditingField(null);
    setEditingValue('');
    try {
      await axios.put(`${API_BASE_URL}/api/about`, {
        data: updatedData,
        userId: effectiveUserId
      });
      fetchAbout();
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  return (
    <div className="about-root">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{ maxWidth: '800px', margin: '0 auto' }}
      >
        <LayoutGroup>
          {/* ── Header Section ── */}
          <motion.div
            layout
            className="about-header"
          >
            {/* Edit bio button (top right) */}
            {!viewOnly && (
              <button
                onClick={() => handleEditField('Bio')}
                className="about-bio-edit-btn"
                title="Edit bio"
              >
                <FiEdit size={20} color="#fff" />
              </button>
            )}

            <motion.h2
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, delay: 0.4 }}
              className="about-title"
            >
              About Me
            </motion.h2>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, type: 'spring' }}
              className="about-bio-text"
            >
              {userData.Bio || (
                <span style={{ opacity: 0.7 }}>
                  Passionate about technology and continuous learning, I strive to solve real-world problems through innovation.
                </span>
              )}
            </motion.p>
          </motion.div>

          {/* ── Buttons Container ── */}
          <div className="about-buttons-container">
            {/* SHOW MORE — viewOnly mode */}
            {viewOnly && (
              <motion.button
                onClick={() => setShowAdditionalFields(!showAdditionalFields)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="about-show-more-btn"
              >
                {showAdditionalFields ? <FiChevronUp /> : <FiChevronDown />}
                {showAdditionalFields ? 'Show Less' : 'Show More'}
              </motion.button>
            )}

            {/* EDIT BUTTON — non-viewOnly mode */}
            {!viewOnly && (
              <>
                <motion.button
                  onClick={() => setShowEditDropdown(!showEditDropdown)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="about-edit-content-btn"
                >
                  <FiEdit />
                  Edit Content
                  <motion.span
                    animate={{
                      rotate: showEditDropdown ? 180 : 0,
                      scale: showEditDropdown ? 1.2 : 1
                    }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <FiChevronDown />
                  </motion.span>
                </motion.button>

                {showEditDropdown && (
                  <div
                    className="about-edit-dropdown-overlay"
                    onClick={() => setShowEditDropdown(false)}
                  />
                )}
                <AnimatePresence>
                  {showEditDropdown && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                        className="about-edit-dropdown"
                      >
                      {fieldOptions.map(field => (
                        <motion.div
                          key={field}
                          onClick={() => { handleEditField(field); setShowEditDropdown(false); }}
                          whileHover={{ background: 'rgba(74,144,226,0.1)', paddingLeft: '28px' }}
                          className="about-edit-dropdown-item"
                        >
                          <FiEdit style={{
                            color: '#4A90E2',
                            flexShrink: 0,
                            filter: 'drop-shadow(0 2px 4px rgba(74,144,226,0.2))'
                          }} />
                          <span style={{ fontWeight: '500', color: '#4A90E2' }}>{field}</span>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>

          {/* ── Toggle Buttons for Additional Fields — Edit Mode Only ── */}
          {!viewOnly && (
            <div className="about-toggle-row">
              {['Hobbies', 'Skills', 'Social Links', 'Achievements'].map(field => {
                const hasData = userData[field] && (Array.isArray(userData[field]) ? userData[field].length > 0 : !!userData[field]);
                const isVisible = selectedFields.includes(field);

                return (
                  <motion.button
                    key={field}
                    onClick={() => toggleField(field)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={!hasData}
                    className="about-toggle-btn"
                    style={{
                      background: isVisible ? 'rgba(74,144,226,0.1)' : 'rgba(255,255,255,0.8)',
                      color: isVisible ? '#4A90E2' : '#666',
                      cursor: hasData ? 'pointer' : 'not-allowed',
                      opacity: hasData ? 1 : 0.5,
                    }}
                  >
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: isVisible ? '#4A90E2' : '#ccc',
                      flexShrink: 0,
                    }} />
                    {field}
                  </motion.button>
                );
              })}
            </div>
          )}

          {/* ── Content Cards Grid ── */}
          <div className="about-cards-grid">
            <AnimatePresence>
              {selectedFields.map((field, index) => {
                let accentGradient = 'linear-gradient(90deg, rgba(74, 144, 226, 0.8), rgba(108, 92, 231, 0.8))';
                if (field === 'Name') accentGradient = 'linear-gradient(90deg, rgba(74, 144, 226, 0.8), rgba(108, 92, 231, 0.8))';
                else if (field === 'Interests') accentGradient = 'linear-gradient(90deg, rgba(161, 140, 209, 0.8), rgba(251, 194, 235, 0.8))';
                else if (field === 'Achievements') accentGradient = 'linear-gradient(90deg, rgba(247, 151, 30, 0.8), rgba(255, 210, 0, 0.8))';
                else if (field === 'Bio') accentGradient = 'linear-gradient(90deg, rgba(252, 182, 159, 0.8), rgba(255, 236, 210, 0.8))';
                else if (field === 'Social Links') accentGradient = 'linear-gradient(90deg, rgba(67, 233, 123, 0.8), rgba(56, 249, 215, 0.8))';
                else if (field === 'Hobbies') accentGradient = 'linear-gradient(90deg, rgba(255, 106, 0, 0.8), rgba(238, 9, 121, 0.8))';
                else if (field === 'Skills') accentGradient = 'linear-gradient(90deg, rgba(67, 206, 162, 0.8), rgba(24, 90, 157, 0.8))';

                return (
                  <motion.div
                    key={field}
                    layout
                    initial={{ opacity: 0, y: 20, rotateX: -30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, rotateX: 30, scale: 0.95 }}
                    transition={{ duration: 0.4, delay: index * 0.05, type: 'spring' }}
                    whileHover={{ scale: 1.02, boxShadow: '0 12px 32px rgba(0,0,0,0.1)' }}
                    className="about-card"
                  >
                    {/* Gradient top bar */}
                    <motion.div
                      style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0,
                        height: '4px',
                        background: accentGradient,
                        transformOrigin: 'left center'
                      }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />

                    {/* Rotating badge */}
                    <motion.div
                      style={{
                        position: 'absolute',
                        top: '-20px', right: '-20px',
                        width: '80px', height: '80px',
                        background: accentGradient,
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: '24px',
                        boxShadow: '0 8px 24px rgba(74,144,226,0.3)'
                      }}
                      animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
                      transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                    >
                      {field[0]}
                    </motion.div>

                    {/* Card heading */}
                    <h3 className="about-card-title">
                      <span style={{
                        width: '44px', height: '44px',
                        background: accentGradient,
                        borderRadius: '12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(74,144,226,0.3)',
                        fontWeight: '600', fontSize: '1.1rem',
                        flexShrink: 0,
                      }}>
                        {field[0]}
                      </span>
                      {field}
                    </h3>

                    {/* Card body */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="about-card-body"
                    >
                      {isLoading ? (
                        <span style={{
                          background: 'linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%)',
                          color: 'transparent',
                          borderRadius: '8px',
                          animation: 'shimmer 2s infinite linear',
                          backgroundSize: '200% 100%',
                        }}>
                          Loading content...
                        </span>
                      ) : (
                        (() => {
                          const isMulti = multiValueFields.includes(field);
                          const value = userData[field];
                          if (isMulti && Array.isArray(value)) {
                            return (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {value.length > 0 ? (
                                  value.map((item, i) => (
                                    <motion.span
                                      key={i}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: i * 0.1 }}
                                      style={{
                                        background: 'rgba(74,144,226,0.1)',
                                        color: '#4A90E2',
                                        padding: '6px 14px',
                                        borderRadius: '12px',
                                        fontSize: '0.9rem',
                                        fontWeight: '500',
                                      }}
                                    >
                                      {item}
                                    </motion.span>
                                  ))
                                ) : (
                                  <span style={{ opacity: 0.5 }}>Not specified</span>
                                )}
                              </div>
                            );
                          }
                          return value || <span style={{ opacity: 0.5 }}>Not specified</span>;
                        })()
                      )}
                    </motion.div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </LayoutGroup>
      </motion.div>

      {/* ── Edit Modal ── */}
      {editingField && (
        <div className="about-modal-overlay">
          <div className="about-modal">
            <h3 className="about-modal-title">Edit {editingField}</h3>

            {multiValueFields.includes(editingField) ? (
              <>
                <textarea
                  value={editingValue}
                  onChange={e => setEditingValue(e.target.value)}
                  rows={4}
                  className="about-modal-textarea"
                  placeholder="Separate values with commas"
                />
                <div className="about-modal-hint">
                  <span role="img" aria-label="sparkles">✨</span>
                  <span style={{ color: '#64748b' }}>
                    <b>Example:</b> Reading, Coding, Music{' '}
                    <span role="img" aria-label="books">📚</span>
                    <span role="img" aria-label="laptop">💻</span>
                    <span role="img" aria-label="musical note">🎵</span>
                  </span>
                </div>
              </>
            ) : (
              <textarea
                value={editingValue}
                onChange={e => setEditingValue(e.target.value)}
                rows={5}
                className="about-modal-textarea about-modal-textarea--bio"
                placeholder="Write something about yourself..."
                autoFocus
              />
            )}

            <div className="about-modal-actions">
              <button
                onClick={() => { setEditingField(null); setEditingValue(''); }}
                className="about-modal-btn about-modal-btn--cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="about-modal-btn about-modal-btn--save"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── All responsive styles ── */}
      <style>{`
        /* ---- Base (mobile-first) ---- */
        *,
        *::before,
        *::after { box-sizing: border-box; }

        .about-root {
          padding: 20px 16px;
          background: #FFFFFF;
          min-height: 100vh;
          font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        /* ---- Header ---- */
        .about-header {
          text-align: center;
          margin-bottom: 24px;
          padding: 24px 16px 20px;
          background: linear-gradient(135deg, #3B82F6, #1D4ED8);
          border-radius: 16px;
          box-shadow: 0 8px 24px rgba(59,130,246,0.25);
          position: relative;
          overflow: hidden;
        }

        .about-bio-edit-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          background: rgba(255,255,255,0.15);
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(76, 72, 181, 0.10);
          z-index: 10;
          outline: none;
          transition: background 0.2s;
          -webkit-tap-highlight-color: transparent;
        }
        .about-bio-edit-btn:hover { background: rgba(255,255,255,0.25); }

        .about-title {
          font-size: 1.8rem;
          color: white;
          margin: 0;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          font-weight: 900;
          font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
          letter-spacing: -0.02em;
          position: relative;
          z-index: 2;
        }

        .about-bio-text {
          font-size: 0.97rem;
          color: rgba(255,255,255,0.9);
          margin: 10px 0 0;
          font-weight: 400;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
          position: relative;
          z-index: 2;
          opacity: 0.85;
          line-height: 1.6;
        }

        /* ---- Buttons container ---- */
        .about-buttons-container {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          justify-content: center;
          margin-bottom: 24px;
          position: relative;
          min-height: 46px;
        }

        .about-show-more-btn,
        .about-edit-content-btn {
          padding: 10px 20px;
          border-radius: 14px;
          border: 1px solid rgba(0,0,0,0.1);
          background: rgba(255,255,255,0.95);
          color: #2A2D43;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          font-weight: 500;
          font-size: 0.92rem;
          -webkit-tap-highlight-color: transparent;
        }
        .about-edit-content-btn { border: none; }

        /* ---- Dropdown ---- */
        .about-edit-dropdown {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(255,255,255,0.97);
          border-radius: 16px;
          margin-top: 12px;
          box-shadow: 0 16px 32px rgba(0,0,0,0.15);
          z-index: 1002;
          width: min(280px, calc(100vw - 32px));
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.2);
        }

        .about-edit-dropdown-item {
          padding: 14px 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 14px;
          border-bottom: 1px solid rgba(0,0,0,0.05);
          font-size: 0.93rem;
          font-weight: 500;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          -webkit-tap-highlight-color: transparent;
        }

        .about-edit-dropdown-overlay {
          display: none;
        }

        @media (max-width: 768px) {
          .about-edit-dropdown-overlay {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.4);
            z-index: 9999;
          }
          .about-edit-dropdown {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            top: auto;
            transform: none;
            z-index: 10000;
            width: 100%;
            max-height: 70dvh;
            overflow-y: auto;
            margin-top: 0;
            border-radius: 16px 16px 0 0;
            padding-bottom: env(safe-area-inset-bottom, 16px);
          }
        }

        /* ---- Toggle row ---- */
        .about-toggle-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
          margin-bottom: 24px;
        }

        .about-toggle-btn {
          padding: 8px 14px;
          border-radius: 12px;
          border: 1px solid rgba(74,144,226,0.3);
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          font-weight: 500;
          font-size: 0.88rem;
          transition: all 0.3s ease;
          -webkit-tap-highlight-color: transparent;
        }

        /* ---- Cards grid ---- */
        .about-cards-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          position: relative;
          z-index: 1;
        }

        .about-card {
          background: rgba(255,255,255,0.95);
          padding: 24px 20px 20px;
          border-radius: 20px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.3);
        }

        .about-card-title {
          margin: 0 0 14px;
          color: #2A2D43;
          font-size: 1.2rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 14px;
          position: relative;
          z-index: 1;
        }

        .about-card-body {
          margin: 0;
          color: #636E72;
          line-height: 1.7;
          font-size: 0.97rem;
          font-weight: 400;
          position: relative;
          z-index: 1;
        }

        /* ---- Modal overlay ---- */
        .about-modal-overlay {
          position: fixed;
          top: 0; left: 0;
          width: 100vw; height: 100%;
          background: rgba(30, 41, 59, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          backdrop-filter: blur(2px);
          -webkit-backdrop-filter: blur(2px);
          padding: 16px;
        }

        .about-modal {
          background: linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%);
          padding: 24px 20px 28px;
          border-radius: 18px;
          width: 100%;
          max-width: 480px;
          max-height: 90dvh;
          overflow-y: auto;
          box-shadow: 0 -8px 32px rgba(30,41,59,0.18);
          border: 1px solid #e0e7ef;
          display: flex;
          flex-direction: column;
          position: relative;
          scrollbar-width: none;
          -ms-overflow-style: none;
          animation: modalPopIn 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        .about-modal::-webkit-scrollbar {
          display: none;
        }

        .about-modal-title {
          margin: 0 0 16px;
          color: #2A2D43;
          font-size: 1.2rem;
          font-weight: 700;
          letter-spacing: -0.01em;
          text-align: center;
          font-family: Montserrat, -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .about-modal-textarea {
          width: 100%;
          margin-bottom: 8px;
          border-radius: 10px;
          border: 1.5px solid #cbd5e1;
          padding: 12px 14px;
          font-size: 1rem;
          font-family: inherit;
          background: #f8fafc;
          color: #2A2D43;
          box-shadow: 0 2px 8px rgba(30,41,59,0.04);
          outline: none;
          transition: border 0.2s;
          resize: vertical;
          /* iOS zoom fix — font-size >= 16px prevents auto-zoom */
          font-size: 16px;
        }
        .about-modal-textarea--bio {
          min-height: 90px;
          margin-bottom: 16px;
        }
        .about-modal-textarea:focus { border-color: #4A90E2; }

        .about-modal-hint {
          font-size: 0.92rem;
          color: #f59e42;
          margin-bottom: 14px;
          font-style: italic;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .about-modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .about-modal-btn {
          border-radius: 8px;
          padding: 10px 22px;
          font-weight: 500;
          font-size: 1rem;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.18s;
          -webkit-tap-highlight-color: transparent;
          min-height: 44px; /* touch target */
        }
        .about-modal-btn--cancel {
          background: none;
          border: 1.5px solid #cbd5e1;
          color: #64748b;
          box-shadow: 0 1px 4px rgba(30,41,59,0.04);
        }
        .about-modal-btn--save {
          background: linear-gradient(90deg, #4A90E2 0%, #6C5CE7 100%);
          border: none;
          color: white;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(76,72,181,0.10);
        }

        /* ---- Animations ---- */
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }

        /* ── Tablet: 480px + ── */
        @media (min-width: 480px) {
          .about-root { padding: 28px 24px; }
          .about-header { padding: 32px 24px 28px; }
          .about-title { font-size: 2.8rem; }
          .about-cards-grid { gap: 20px; }
          .about-card { padding: 28px 24px 22px; }
          .about-modal-overlay { align-items: center; padding: 16px; }
          .about-modal {
            border-radius: 18px;
            width: auto;
            min-width: 340px;
            max-width: 480px;
            animation: modalPopIn 0.3s cubic-bezier(0.4,0,0.2,1);
          }
        }

        /* ── Desktop: 768px + ── */
        @media (min-width: 768px) {
          .about-root { padding: 40px; }
          .about-header {
            margin-bottom: 40px;
            padding: 40px 20px;
            border-radius: 24px;
          }
          .about-bio-edit-btn { top: 24px; right: 32px; width: 44px; height: 44px; }
          .about-title { font-size: 3.5rem; }
          .about-bio-text { font-size: 1.1rem; }
          .about-buttons-container { margin-bottom: 32px; }
          .about-show-more-btn,
          .about-edit-content-btn { padding: 12px 24px; font-size: 0.95rem; }
          .about-toggle-row { margin-bottom: 32px; }
          .about-toggle-btn { font-size: 0.9rem; }
          .about-cards-grid {
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 24px;
          }
          .about-card { padding: 32px; border-radius: 24px; }
          .about-card-title { font-size: 1.4rem; gap: 16px; }
        }

        @keyframes modalPopIn {
          0%  { transform: scale(0.92) translateY(30px); opacity: 0; }
          100%{ transform: scale(1)    translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default About;