import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { FiEdit, FiChevronDown, FiX, FiCheck } from 'react-icons/fi';

const fieldOptions = [
  'Name',
  'Title',
  'Bio',
  'Interests',
  'Skills',
  'Achievements',
  'Hobbies',
  'Social Links',
];

const About = () => {
  const [selectedFields, setSelectedFields] = useState(['Name', 'Title', 'Bio']);
  const [userData, setUserData] = useState({});
  const [showEditDropdown, setShowEditDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/about')
      .then(res => res.json())
      .then(data => {
        setUserData(data);
        setIsLoading(false);
      })
      .catch(err => console.error('Fetch error:', err));
  }, []);

  const toggleField = (field) => {
    setSelectedFields(fields =>
      fields.includes(field)
        ? fields.filter(f => f !== field)
        : [...fields, field]
    );
  };

  const handleEditField = async (field) => {
    const newValue = prompt(`Edit ${field}:`, userData[field] || '');
    if (newValue !== null) {
      const updatedData = { ...userData, [field]: newValue };
      setUserData(updatedData);
      try {
        await fetch('/api/about', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedData),
        });
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
                fontSize: '3rem',
                color: 'white',
                margin: 0,
                textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                fontWeight: '800',
                letterSpacing: '-0.03em',
                position: 'relative',
                zIndex: 2
              }}
            >
              About Me
            </motion.h2>
          </motion.div>

          {/* Field Selector with Dropdown */}
          <motion.div
            style={{ 
              position: 'relative', 
              marginBottom: '40px',
              zIndex: 1001
            }}
            layout
          >
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              justifyContent: 'center', 
              gap: '12px',
              position: 'relative'
            }}>
              {/* Field Selection Buttons */}
              {fieldOptions.map(field => (
                <motion.button
                  key={field}
                  onClick={() => toggleField(field)}
                  whileHover={{ 
                    scale: 1.05,
                    rotate: selectedFields.includes(field) ? [-2, 2] : 0
                  }}
                  transition={{
                    rotate: {
                      type: "keyframes",
                      duration: 0.15,
                      repeat: Infinity,
                      repeatType: "mirror"
                    },
                    scale: { type: "spring", stiffness: 300 }
                  }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '16px',
                    border: 'none',
                    background: selectedFields.includes(field) 
                      ? 'linear-gradient(45deg, #4A90E2, #6C5CE7)' 
                      : 'rgba(255,255,255,0.95)',
                    color: selectedFields.includes(field) ? 'white' : '#2A2D43',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                    fontSize: '1rem',
                    backdropFilter: 'blur(4px)',
                    WebkitBackdropFilter: 'blur(4px)'
                  }}
                >
                  {selectedFields.includes(field) ? (
                    <FiCheck style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} />
                  ) : (
                    <FiX style={{ opacity: 0.8 }} />
                  )}
                  {field}
                </motion.button>
              ))}
              
              {/* Edit Content Button */}
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
                  WebkitBackdropFilter: 'blur(4px)'
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
            </div>

            {/* Edit Dropdown */}
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
                        fontSize: '1rem',
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
                        background: 'linear-gradient(45deg, #4A90E2, #6C5CE7)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}>
                        {field}
                      </span>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

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
                    fontSize: '1.5rem',
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
                      boxShadow: '0 4px 12px rgba(74,144,226,0.3)'
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
                      lineHeight: '1.7',
                      fontSize: '1.1rem',
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
                        backgroundSize: '200% 100%'
                      }}>
                        Loading...
                      </span>
                    ) : (
                      userData[field] || <span style={{ opacity: 0.5 }}>Not specified</span>
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