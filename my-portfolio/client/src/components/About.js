import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { FiEdit, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import AuthContext from '../context/AuthContext';

const fieldOptions = [
  'Name',
  'Bio',
  'Interests',
  'Skills',
  'Achievements',
  'Hobbies',
  'Social Links',
];

const multiValueFields = ['Interests', 'Skills', 'Achievements', 'Hobbies', 'Social Links'];

const About = ({ userId: propUserId, viewOnly = false }) => {
  const authContext = useContext(AuthContext);
  const { user } = authContext || {};
  const userId = propUserId || (user && user._id);
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

  useEffect(() => {
    if (userId) {
      fetchAboutData();
    }
  }, [userId]);

  const fetchAboutData = async () => {
    try {
      const response = await fetch(`/api/about?userId=${userId}`);
      const data = await response.json();
      if (data.data) {
        setUserData(data.data);
      }
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to fetch about data:', err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (Object.keys(userData).length === 0) return;

    const allFieldsWithData = fieldOptions.filter(field => {
      const value = userData[field];
      return Array.isArray(value) ? value.length > 0 : !!value;
    });

    if (viewOnly) {
      const defaultFields = ['Name', 'Interests', 'Achievements'];
      const additionalFields = [ 'Hobbies', 'Skills', 'Social Links'];
      
      let fieldsToShow = defaultFields.filter(field => allFieldsWithData.includes(field));
      
      if (showAdditionalFields) {
        const additional = additionalFields.filter(field => allFieldsWithData.includes(field));
        fieldsToShow = [...new Set([...fieldsToShow, ...additional])];
      }
      
      setSelectedFields(fieldsToShow);
    } else {
      // In edit mode, show only default fields by default
      const defaultFields = ['Name', 'Interests', 'Achievements'];
      const fieldsToShow = defaultFields.filter(field => allFieldsWithData.includes(field));
      setSelectedFields(fieldsToShow);
    }
  }, [userData, viewOnly, showAdditionalFields]);

  const toggleField = (field) => {
    // Prevent Name, Interests, and Skills from being deselected
    const defaultFields = ['Name', 'Interests', 'Skills'];
    if (defaultFields.includes(field) && selectedFields.includes(field)) {
      return; // Don't allow deselection of default fields
    }
    
    setSelectedFields(fields =>
      fields.includes(field)
        ? fields.filter(f => f !== field)
        : [...fields, field]
    );
  };

  const handleEditField = async (field) => {
    const isMulti = multiValueFields.includes(field);
    const currentValue = userData[field];
    const promptDefault = isMulti && Array.isArray(currentValue)
      ? currentValue.join(', ')
      : currentValue || '';
      
    const newValue = prompt(`Edit ${field}:${isMulti ? ' (separate with commas)' : ''}`, promptDefault);
    
    if (newValue !== null) {
      const finalValue = isMulti ? newValue.split(',').map(s => s.trim()).filter(Boolean) : newValue;
      const updatedData = { ...userData, [field]: finalValue };
      setUserData(updatedData);

      try {
        await fetch('/api/about', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: updatedData,
            userId: userId
          }),
        });
        fetchAboutData(); // Refresh data after update
      } catch (err) {
        console.error('Save error:', err);
      }
    }
  };

  return (
    <div style={{ 
      padding: '40px', 
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      minHeight: '100vh'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{ maxWidth: '800px', margin: '0 auto' }}
      >
        <LayoutGroup>
          {/* Header Section - Improved visibility */}
          <motion.div
            layout
            style={{
              textAlign: 'center',
              marginBottom: '40px',
              padding: '40px 20px',
              background: 'linear-gradient(45deg, #4A90E2, #6C5CE7)',
              borderRadius: '24px',
              boxShadow: '0 12px 32px rgba(76, 72, 181, 0.2)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: '120px',
                height: '120px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50%'
              }}
            />
            <motion.h2
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, delay: 0.4 }}
              style={{
                fontSize: '3.5rem',
                color: 'white',
                margin: 0,
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
                fontWeight: '900',
                fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, sans-serif',
                letterSpacing: '-0.02em',
                position: 'relative',
                zIndex: 2
              }}
            >
              About Me
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, type: 'spring' }}
              style={{
                fontSize: '1.1rem',
                color: 'rgba(255,255,255,0.9)',
                margin: '10px 0 0',
                fontWeight: '400',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                position: 'relative',
                zIndex: 2,
                opacity: 0.8,
                lineHeight: 1.5
              }}
            >
              I'm a passionate developer with a love for creating beautiful and functional web applications.
            </motion.p>
          </motion.div>

          {/* --- BUTTONS CONTAINER --- */}
          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            marginBottom: '32px',
            position: 'relative',
            minHeight: '50px' // Reserve space to prevent layout shift
          }}>
            {/* SHOW MORE BUTTON - viewOnly mode */}
            {viewOnly && (
              <motion.button
                onClick={() => setShowAdditionalFields(!showAdditionalFields)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: '12px 24px',
                  borderRadius: '16px',
                  border: '1px solid rgba(0,0,0,0.1)',
                  background: 'rgba(255,255,255,0.95)',
                  color: '#2A2D43',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                  backdropFilter: 'blur(4px)',
                  WebkitBackdropFilter: 'blur(4px)',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  fontWeight: '500',
                  fontSize: '0.95rem'
                }}
              >
                {showAdditionalFields ? <FiChevronUp /> : <FiChevronDown />}
                {showAdditionalFields ? 'Show Less' : 'Show More'}
              </motion.button>
            )}

            {/* EDIT BUTTON - non-viewOnly mode */}
            {!viewOnly && (
              <>
                <motion.button
                  onClick={() => setShowEditDropdown(!showEditDropdown)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '16px',
                    border: 'none',
                    background: 'rgba(255,255,255,0.95)',
                    color: '#2A2D43',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                    backdropFilter: 'blur(4px)',
                    WebkitBackdropFilter: 'blur(4px)',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    fontWeight: '500',
                    fontSize: '0.95rem'
                  }}
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
                
                <AnimatePresence>
                  {showEditDropdown && (
                    <motion.div
                      initial={{ 
                        opacity: 0, 
                        y: -10,
                        scale: 0.95,
                        filter: 'blur(4px)'
                      }}
                      animate={{ 
                        opacity: 1, 
                        y: 0,
                        scale: 1,
                        filter: 'blur(0px)'
                      }}
                      exit={{ 
                        opacity: 0, 
                        y: -10,
                        scale: 0.95,
                        filter: 'blur(4px)'
                      }}
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'rgba(255,255,255,0.95)',
                        borderRadius: '16px',
                        marginTop: '16px',
                        boxShadow: '0 16px 32px rgba(0,0,0,0.15)',
                        overflow: 'hidden',
                        zIndex: 1002,
                        width: '280px',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255,255,255,0.2)'
                      }}
                    >
                      {fieldOptions.map(field => (
                        <motion.div
                          key={field}
                          onClick={() => handleEditField(field)}
                          whileHover={{ 
                            background: 'rgba(74,144,226,0.1)',
                            paddingLeft: '28px'
                          }}
                          style={{
                            padding: '16px 24px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            borderBottom: '1px solid rgba(0,0,0,0.05)',
                            fontSize: '0.95rem',
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                            fontWeight: '500',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                          }}
                        >
                          <FiEdit style={{ 
                            color: '#4A90E2',
                            flexShrink: 0,
                            filter: 'drop-shadow(0 2px 4px rgba(74,144,226,0.2))'
                          }} />
                          <span style={{ 
                            fontWeight: '500',
                            color: '#4A90E2'
                          }}>
                            {field}
                          </span>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>

          {/* Toggle Buttons for Additional Fields - Edit Mode Only */}
          {!viewOnly && (
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              marginBottom: '32px',
              flexWrap: 'wrap'
            }}>
              {['Hobbies', 'Skills', 'Bio', 'Social Links'].map(field => {
                const hasData = userData[field] && (Array.isArray(userData[field]) ? userData[field].length > 0 : !!userData[field]);
                const isVisible = selectedFields.includes(field);
                
                return (
                  <motion.button
                    key={field}
                    onClick={() => toggleField(field)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '12px',
                      border: '1px solid rgba(74,144,226,0.3)',
                      background: isVisible ? 'rgba(74,144,226,0.1)' : 'rgba(255,255,255,0.8)',
                      color: isVisible ? '#4A90E2' : '#666',
                      cursor: hasData ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      fontWeight: '500',
                      fontSize: '0.9rem',
                      opacity: hasData ? 1 : 0.5,
                      transition: 'all 0.3s ease'
                    }}
                    disabled={!hasData}
                  >
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: isVisible ? '#4A90E2' : '#ccc'
                    }} />
                    {field}
                  </motion.button>
                );
              })}
            </div>
          )}

          {/* Content Cards Section - Now in 2 columns */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '24px',
            position: 'relative',
            zIndex: 1
          }}>
            <AnimatePresence>
              {selectedFields.map((field, index) => (
                <motion.div
                  key={field}
                  layout
                  initial={{ 
                    opacity: 0, 
                    y: 20,
                    rotateX: -30,
                    scale: 0.95
                  }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    rotateX: 0,
                    scale: 1
                  }}
                  exit={{ 
                    opacity: 0, 
                    y: -20,
                    rotateX: 30,
                    scale: 0.95
                  }}
                  transition={{ 
                    duration: 0.4,
                    delay: index * 0.05,
                    type: 'spring'
                  }}
                  whileHover={{
                    scale: 1.02,
                    boxShadow: '0 12px 32px rgba(0,0,0,0.1)'
                  }}
                  style={{
                    background: 'rgba(255,255,255,0.95)',
                    padding: '32px',
                    borderRadius: '24px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                    position: 'relative',
                    overflow: 'hidden',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.3)'
                  }}
                >
                  {/* Gradient Border Animation */}
                  <motion.div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: 'linear-gradient(90deg, #4A90E2, #6C5CE7)',
                      transformOrigin: 'left center'
                    }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                  
                  {/* Rotating Avatar Badge */}
                  <motion.div
                    style={{
                      position: 'absolute',
                      top: '-20px',
                      right: '-20px',
                      width: '80px',
                      height: '80px',
                      background: 'linear-gradient(45deg, #4A90E2, #6C5CE7)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '24px',
                      boxShadow: '0 8px 24px rgba(74,144,226,0.3)'
                    }}
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: 'linear'
                    }}
                  >
                    {field[0]}
                  </motion.div>

                  {/* Content Display */}
                  <h3 style={{
                    margin: '0 0 16px',
                    color: '#2A2D43',
                    fontSize: '1.4rem',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    position: 'relative',
                    zIndex: 1
                  }}>
                    <span style={{
                      width: '48px',
                      height: '48px',
                      background: 'linear-gradient(45deg, #4A90E2, #6C5CE7)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      boxShadow: '0 4px 12px rgba(74,144,226,0.3)',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                      fontWeight: '600',
                      fontSize: '1.2rem'
                    }}>
                      {field[0]}
                    </span>
                    {field}
                  </h3>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      margin: 0,
                      color: '#636E72',
                      lineHeight: 1.7,
                      fontSize: '1rem',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                      fontWeight: '400',
                      position: 'relative',
                      zIndex: 1
                    }}
                  >
                    {isLoading ? (
                      <span style={{ 
                        background: 'linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%)',
                        color: 'transparent',
                        borderRadius: '8px',
                        animation: 'shimmer 2s infinite linear',
                        backgroundSize: '200% 100%',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
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
                                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                                      fontWeight: '500',
                                    }}
                                  >
                                    {item}
                                  </motion.span>
                                ))
                              ) : (
                                <span style={{ 
                                  opacity: 0.5,
                                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                                }}>Not specified</span>
                              )}
                            </div>
                          );
                        }
                        return value || <span style={{ 
                          opacity: 0.5,
                          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                        }}>Not specified</span>;
                      })()
                    )}
                  </motion.p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </LayoutGroup>
      </motion.div>
    </div>
  );
};

export default About;