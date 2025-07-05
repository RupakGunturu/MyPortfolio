import React, { useState, useEffect, useRef, useContext } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { FaPlus, FaTrash, FaEdit, FaTimes } from 'react-icons/fa';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Skill = ({ viewOnly = false, theme = 'dark', userId }) => {
  const authContext = useContext(AuthContext);
  const { user } = authContext || {};
  const effectiveUserId = userId || (user && user._id);
  const [skills, setSkills] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newSkill, setNewSkill] = useState({ title: '', level: 'intermediate' });
  const [toastMessage, setToastMessage] = useState('');
  const [isDeleting, setIsDeleting] = useState(null);
  const [currentStyles, setCurrentStyles] = useState({});
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (effectiveUserId) {
      fetchSkills();
    }
  }, [effectiveUserId]);

  // Handle responsive styles
  useEffect(() => {
    const updateStyles = () => {
      const isMobile = window.innerWidth <= 768;
      const isSmallMobile = window.innerWidth <= 480;
      
      let mobileStyles = {};
      
      if (isSmallMobile) {
        mobileStyles = {
          section: { padding: '40px 15px' },
          header: { 
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '1rem',
            paddingBottom: '1rem'
          },
          heading: { fontSize: '2rem' },
          subHeading: { fontSize: '1rem' },
          grid: { 
            gridTemplateColumns: '1fr',
            gap: '0.8rem'
          },
          card: { 
            padding: '1.2rem'
          },
          form: { 
            padding: '1.2rem',
            marginBottom: '1.5rem'
          },
          input: { 
            padding: '0.75rem 0.875rem',
            fontSize: '16px'
          },
          levelSelect: { 
            padding: '0.75rem',
            fontSize: '16px'
          },
          submitButton: { 
            padding: '0.75rem 1.2rem',
            fontSize: '0.9rem',
            minHeight: '44px'
          },
          cancelButton: { 
            padding: '0.75rem 1.2rem',
            fontSize: '0.9rem',
            minHeight: '44px'
          },
          addButton: { 
            padding: '0.6rem 1.2rem',
            fontSize: '0.9rem',
            minHeight: '44px'
          }
        };
      } else if (isMobile) {
        mobileStyles = {
          section: { padding: '50px 20px' },
          header: { 
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '1rem',
            paddingBottom: '1rem'
          },
          heading: { fontSize: '2.5rem' },
          subHeading: { fontSize: '1.1rem' },
          grid: { 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '0.9rem'
          },
          card: { 
            padding: '1.3rem'
          },
          form: { 
            padding: '1.3rem',
            marginBottom: '1.8rem'
          },
          input: { 
            padding: '0.8rem 0.9rem',
            fontSize: '16px'
          },
          levelSelect: { 
            padding: '0.8rem',
            fontSize: '16px'
          },
          submitButton: { 
            padding: '0.8rem 1.3rem',
            fontSize: '0.95rem',
            minHeight: '44px'
          },
          cancelButton: { 
            padding: '0.8rem 1.3rem',
            fontSize: '0.95rem',
            minHeight: '44px'
          },
          addButton: { 
            padding: '0.7rem 1.3rem',
            fontSize: '0.95rem',
            minHeight: '44px'
          }
        };
      }
      
      const responsiveStyles = { ...styles };
      Object.keys(mobileStyles).forEach(key => {
        if (responsiveStyles[key]) {
          responsiveStyles[key] = { ...responsiveStyles[key], ...mobileStyles[key] };
        }
      });
      
      setCurrentStyles(responsiveStyles);
    };

    updateStyles();
    window.addEventListener('resize', updateStyles);
    return () => window.removeEventListener('resize', updateStyles);
  }, []);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/skills?userId=${effectiveUserId}`);
      setSkills(response.data);
    } catch (error) {
      console.error('Error fetching skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleChange = e => {
    setNewSkill(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!newSkill.title.trim()) {
      showToast('⚠️ Skill name is required!');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/skills`, {
        ...newSkill,
        userId: effectiveUserId
      });

      setSkills(prev => [response.data, ...prev]);
      setNewSkill({ title: '', level: 'intermediate' });
      setIsFormOpen(false);
      showToast('✅ Skill added!');
    } catch (err) {
      console.error('Save error:', err);
      showToast('❌ Error saving skill!');
    }
  };

  const handleDelete = async (skillId) => {
    setIsDeleting(skillId);
    try {
      await axios.delete(`${API_BASE_URL}/api/skills/${skillId}?userId=${effectiveUserId}`);
      
      setSkills(prev => prev.filter(skill => skill._id !== skillId));
      showToast('❌ Skill deleted!');
    } catch (err) {
      console.error('Delete error:', err);
      showToast('❌ Error deleting skill!');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleUpdate = async (skillId, updatedSkill) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/skills/${skillId}`, {
        ...updatedSkill,
        userId: effectiveUserId
      });
      
      setSkills(prev => prev.map(skill => 
        skill._id === skillId ? response.data : skill
      ));
      showToast('✅ Skill updated!');
    } catch (err) {
      console.error('Update error:', err);
      showToast('❌ Error updating skill!');
    }
  };

  // Progress calculation functions
  const getProgressWidth = (level) => {
    const levels = {
      'beginner': 30,
      'intermediate': 60,
      'advanced': 85,
      'expert': 100
    };
    return levels[level] || 60;
  };

  const getProgressColor = (level) => {
    const colors = {
      'beginner': '#ef4444',
      'intermediate': '#eab308',
      'advanced': '#22c55e',
      'expert': '#3b82f6'
    };
    return colors[level] || '#3b82f6';
  };

  // Updated styles with delete button and theme support
  const styles = {
    section: {
      padding: '60px 20px',
      background: theme === 'dark' 
        ? 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)'
        : '#FFFFFF',
      minHeight: 'auto',
      maxWidth: '100%',
      margin: '0 auto',
      width: '100%',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
      paddingBottom: '1rem',
      borderBottom: theme === 'dark' ? '1px solid #334155' : '1px solid #E2E8F0',
      flexWrap: 'wrap',
      gap: '1rem',
    },
    heading: {
      fontFamily: "'Montserrat', sans-serif",
      fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
      fontWeight: '900',
      margin: 0,
      letterSpacing: '-2px',
      background: 'linear-gradient(135deg, #34d399, #3b82f6)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    subHeading: {
      fontFamily: "'Montserrat', sans-serif",
      fontSize: '1.2rem',
      color: theme === 'dark' ? '#94A3B8' : '#64748B',
      margin: '0.25rem 0 0',
      fontWeight: '700',
    },
    addButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.75rem 1.5rem',
      background: 'linear-gradient(135deg, #00BFFF 0%, #3B82F6 100%)',
      color: theme === 'dark' ? '#0F172A' : '#FFFFFF',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontWeight: '600',
      transition: 'all 0.15s ease',
      boxShadow: '0 4px 6px -1px rgba(0, 191, 255, 0.2)',
      ':hover': {
        transform: 'translateY(-1px)',
        boxShadow: '0 6px 12px -1px rgba(0, 191, 255, 0.3)',
      },
    },
    plusIcon: {
      width: '1.25rem',
      height: '1.25rem',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1rem',
      width: '100%',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    card: {
      backgroundColor: theme === 'dark' ? '#1E293B' : '#FFFFFF',
      borderRadius: '1rem',
      padding: '1.5rem',
      boxShadow: theme === 'dark' 
        ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
        : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: theme === 'dark' ? '1px solid #334155' : '1px solid #E2E8F0',
      position: 'relative',
      cursor: 'pointer',
      transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
      transform: 'translateY(0)',
      ':hover': {
        transform: 'translateY(-8px) scale(1.02)',
        boxShadow: theme === 'dark' 
          ? '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)'
          : '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
        borderColor: theme === 'dark' ? '#00BFFF' : '#00BFFF',
      },
    },
    cardContent: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    },
    title: {
      color: theme === 'dark' ? '#F8FAFC' : '#1E293B',
      fontSize: '1.125rem',
      fontWeight: '600',
      margin: 0,
    },
    skillHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '0.5rem',
    },
    actions: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    levelTag: {
      fontSize: '0.75rem',
      fontWeight: '600',
      textTransform: 'uppercase',
      padding: '0.25rem 0.5rem',
      borderRadius: '0.375rem',
      color: theme === 'dark' ? '#0F172A' : '#FFFFFF',
      transition: 'all 0.15s ease',
      ':hover': {
        transform: 'scale(1.05)',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
      },
    },
    deleteButton: {
      background: 'transparent',
      border: 'none',
      padding: '0.25rem',
      borderRadius: '0.25rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.15s ease',
      ':hover': {
        background: theme === 'dark' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)',
      },
      ':disabled': {
        opacity: 0.7,
        cursor: 'not-allowed',
      },
    },
    trashIcon: {
      width: '1.25rem',
      height: '1.25rem',
      color: '#EF4444',
    },
    spinner: {
      width: '1rem',
      height: '1rem',
      border: '2px solid rgba(239, 68, 68, 0.3)',
      borderTopColor: '#EF4444',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    },
    skillLevel: {
      height: '8px',
      backgroundColor: theme === 'dark' ? '#334155' : '#E2E8F0',
      borderRadius: '4px',
      overflow: 'hidden',
      transition: 'all 0.15s ease',
      ':hover': {
        height: '10px',
        borderRadius: '5px',
      },
    },
    form: {
      backgroundColor: theme === 'dark' ? '#1E293B' : '#FFFFFF',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      marginBottom: '2rem',
      boxShadow: theme === 'dark' 
        ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
        : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: theme === 'dark' ? '1px solid #334155' : '1px solid #E2E8F0',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    },
    input: {
      width: '100%',
      padding: '0.875rem 1rem',
      border: theme === 'dark' ? '1px solid #334155' : '1px solid #E2E8F0',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      backgroundColor: theme === 'dark' ? '#0F172A' : '#F8FAFC',
      color: theme === 'dark' ? '#F8FAFC' : '#1E293B',
      transition: 'border-color 0.2s ease',
      ':focus': {
        outline: 'none',
        borderColor: '#00BFFF',
        boxShadow: '0 0 0 3px rgba(0, 191, 255, 0.1)',
      },
    },
    levelSelect: {
      padding: '0.75rem',
      border: theme === 'dark' ? '1px solid #334155' : '1px solid #E2E8F0',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      width: '100%',
      appearance: 'none',
      backgroundColor: theme === 'dark' ? '#0F172A' : '#F8FAFC',
      color: theme === 'dark' ? '#F8FAFC' : '#1E293B',
      backgroundImage: theme === 'dark' 
        ? `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23F8FAFC' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`
        : `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%231E293B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 0.75rem center',
      backgroundSize: '1rem',
    },
    formActions: {
      display: 'flex',
      gap: '0.75rem',
      justifyContent: 'flex-end',
    },
    submitButton: {
      padding: '0.75rem 1.5rem',
      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      color: theme === 'dark' ? '#0F172A' : '#FFFFFF',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontWeight: '600',
      transition: 'opacity 0.15s ease',
      ':hover': {
        opacity: 0.9,
      },
    },
    cancelButton: {
      padding: '0.75rem 1.5rem',
      backgroundColor: theme === 'dark' ? '#334155' : '#F1F5F9',
      color: theme === 'dark' ? '#F8FAFC' : '#475569',
      border: theme === 'dark' ? '1px solid #475569' : '1px solid #CBD5E1',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontWeight: '500',
      transition: 'background 0.2s, color 0.2s',
      ':hover': {
        backgroundColor: theme === 'dark' ? '#475569' : '#E2E8F0',
      },
    },
    '@keyframes spin': {
      '0%': { transform: 'rotate(0deg)' },
      '100%': { transform: 'rotate(360deg)' },
    },
  };

  // Mobile responsive styles
  const getMobileStyles = () => {
    const isMobile = window.innerWidth <= 768;
    const isSmallMobile = window.innerWidth <= 480;
    
    if (isSmallMobile) {
      return {
        section: { padding: '40px 15px' },
        header: { 
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '1rem',
          paddingBottom: '1rem'
        },
        heading: { fontSize: '2rem' },
        subHeading: { fontSize: '1rem' },
        grid: { 
          gridTemplateColumns: '1fr',
          gap: '0.8rem'
        },
        card: { 
          padding: '1.2rem'
        },
        form: { 
          padding: '1.2rem',
          marginBottom: '1.5rem'
        },
        input: { 
          padding: '0.75rem 0.875rem',
          fontSize: '16px' // Prevents zoom on iOS
        },
        levelSelect: { 
          padding: '0.75rem',
          fontSize: '16px'
        },
        submitButton: { 
          padding: '0.75rem 1.2rem',
          fontSize: '0.9rem',
          minHeight: '44px'
        },
        cancelButton: { 
          padding: '0.75rem 1.2rem',
          fontSize: '0.9rem',
          minHeight: '44px'
        },
        addButton: { 
          padding: '0.6rem 1.2rem',
          fontSize: '0.9rem',
          minHeight: '44px'
        }
      };
    }
    
    if (isMobile) {
      return {
        section: { padding: '50px 20px' },
        header: { 
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '1rem',
          paddingBottom: '1rem'
        },
        heading: { fontSize: '2.5rem' },
        subHeading: { fontSize: '1.1rem' },
        grid: { 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '0.9rem'
        },
        card: { 
          padding: '1.3rem'
        },
        form: { 
          padding: '1.3rem',
          marginBottom: '1.8rem'
        },
        input: { 
          padding: '0.8rem 0.9rem',
          fontSize: '16px'
        },
        levelSelect: { 
          padding: '0.8rem',
          fontSize: '16px'
        },
        submitButton: { 
          padding: '0.8rem 1.3rem',
          fontSize: '0.95rem',
          minHeight: '44px'
        },
        cancelButton: { 
          padding: '0.8rem 1.3rem',
          fontSize: '0.95rem',
          minHeight: '44px'
        },
        addButton: { 
          padding: '0.7rem 1.3rem',
          fontSize: '0.95rem',
          minHeight: '44px'
        }
      };
    }
    
    return {};
  };

  // Apply mobile styles
  const mobileStyles = getMobileStyles();
  const responsiveStyles = { ...styles };

  // Merge mobile styles with base styles
  Object.keys(mobileStyles).forEach(key => {
    if (responsiveStyles[key]) {
      responsiveStyles[key] = { ...responsiveStyles[key], ...mobileStyles[key] };
    }
  });

  const toastStyles = {
    position: 'fixed',
    bottom: '30px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#28a745',
    color: '#fff',
    padding: '12px 24px',
    borderRadius: '6px',
    boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
    fontSize: '1rem',
    zIndex: 1000,
};

  return (
    <section style={currentStyles.section || styles.section}>
      <div style={currentStyles.header || styles.header}>
        <div style={{ paddingLeft: window.innerWidth <= 768 ? '0' : '4rem' }}>
          <h2 style={currentStyles.heading || styles.heading}>Technical Skills</h2>
          <p style={currentStyles.subHeading || styles.subHeading}>Manage your skill proficiency levels</p>
        </div>
        {!viewOnly && (
        <button 
          style={currentStyles.addButton || styles.addButton}
          onClick={() => setIsFormOpen(true)}
        >
          <svg style={currentStyles.plusIcon || styles.plusIcon} viewBox="0 0 24 24">
            <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
          </svg>
          Add Skill
        </button>
        )}
      </div>

      {isFormOpen && (
        <form style={currentStyles.form || styles.form} onSubmit={handleSubmit}>
          <input
            name="title"
            placeholder="Enter skill name..."
            value={newSkill.title}
            onChange={handleChange}
            style={currentStyles.input || styles.input}
            autoFocus
          />
          <select
            name="level"
            value={newSkill.level}
            onChange={handleChange}
            style={currentStyles.levelSelect || styles.levelSelect}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
          </select>
          <div style={currentStyles.formActions || styles.formActions}>
            <button type="submit" style={currentStyles.submitButton || styles.submitButton}>
              Save Skill
            </button>
            <button
              type="button"
              onClick={() => {
                setIsFormOpen(false);
                setNewSkill({ title: '', level: 'intermediate' });
              }}
              style={currentStyles.cancelButton || styles.cancelButton}
            >
              Discard
            </button>
          </div>
        </form>
      )}

     <div ref={ref} style={currentStyles.grid || styles.grid}>
        {skills.length > 0 ? (
          skills.map((skill, index) => (
            <motion.div
              key={skill._id}
              style={currentStyles.card || styles.card}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.2, delay: index * 0.02 }}
              whileHover={{ y: -4, scale: 1.02, boxShadow: '0 10px 20px -5px rgba(0, 0, 0, 0.1)' }}
            >
              <div style={currentStyles.cardContent || styles.cardContent}>
                <div style={currentStyles.skillHeader || styles.skillHeader}>
                  <h3 style={currentStyles.title || styles.title}>{skill.title}</h3>
                  <div style={currentStyles.actions || styles.actions}>
                    <span style={{
                      ...(currentStyles.levelTag || styles.levelTag),
                      backgroundColor: getProgressColor(skill.level)
                    }}>
                      {skill.level}
                    </span>
                    {!viewOnly && (
                    <button 
                      onClick={() => handleDelete(skill._id)}
                      style={currentStyles.deleteButton || styles.deleteButton}
                      disabled={isDeleting === skill._id}
                    >
                      {isDeleting === skill._id ? (
                        <span style={currentStyles.spinner || styles.spinner}></span>
                      ) : (
                        <svg style={currentStyles.trashIcon || styles.trashIcon} viewBox="0 0 24 24">
                          <path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                        </svg>
                      )}
                    </button>
                    )}
                  </div>
                </div>
                <div style={currentStyles.skillLevel || styles.skillLevel}>
                  <div 
                    style={{
                      width: `${getProgressWidth(skill.level)}%`,
                      backgroundColor: getProgressColor(skill.level),
                      height: '100%',
                      borderRadius: '4px'
                    }}
                  />
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <p style={{ gridColumn: '1/-1', textAlign: 'center' }}>
            No skills found. Add your first skill!
          </p>
        )}
      </div>

{toastMessage && (
        <div style={toastStyles}>
          {toastMessage}
        </div>
      )}
    </section>
  );
};

export default Skill;