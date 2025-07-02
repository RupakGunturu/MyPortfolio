import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBriefcase, FaCode, FaGraduationCap, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import './Experiences.css';

const Experience = ({ viewOnly = false, userId }) => {
  const authContext = useContext(AuthContext);
  const { user } = authContext || {};
  const effectiveUserId = userId || (user && user._id);
  const [experiences, setExperiences] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newExperience, setNewExperience] = useState({
    iconType: 'briefcase',
    date: '',
    title: '',
    company: '',
    description: ''
  });

  // Helper function to get icon component
  const getIconComponent = (iconType) => {
    switch (iconType) {
      case 'briefcase':
        return <FaBriefcase />;
      case 'code':
        return <FaCode />;
      case 'graduation':
        return <FaGraduationCap />;
      default:
        return <FaBriefcase />;
    }
  };

  // Load experiences from backend
  useEffect(() => {
    console.log('Experiences component - user object:', user);
    console.log('Experiences component - userId:', effectiveUserId);
    if (effectiveUserId) {
      fetchExperiences();
    }
  }, [effectiveUserId]);

  const fetchExperiences = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`/api/experiences?userId=${effectiveUserId}`);
      setExperiences(response.data);
    } catch (error) {
      console.error('Error fetching experiences:', error);
      setError('Failed to load experiences. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = async () => {
    if (isEditing) {
      // Save changes when exiting edit mode
      try {
        setError(null);
        await axios.put('/api/experiences', { 
          experiences: editData,
          userId: effectiveUserId
        });
        setExperiences(editData);
        setIsEditing(false);
      } catch (error) {
        console.error('Error saving experiences:', error);
        setError('Failed to save changes. Please try again.');
      }
    } else {
      // Enter edit mode - copy current data
      setEditData([...experiences]);
      setIsEditing(true);
    }
  };

  const handleInputChange = (index, field, value) => {
    const updated = [...editData];
    updated[index][field] = value;
    setEditData(updated);
  };

  const handleIconChange = (index, iconType) => {
    const updated = [...editData];
    updated[index].iconType = iconType;
    setEditData(updated);
  };

  const handleAddExperience = async () => {
    try {
      setError(null);
      
      // Validate required fields
      if (!newExperience.date || !newExperience.title || !newExperience.company || !newExperience.description) {
        setError('All fields are required');
        return;
      }

      const response = await axios.post('/api/experiences', {
        ...newExperience,
        userId: effectiveUserId
      });
      const updated = [...editData, response.data];
      setEditData(updated);
      setNewExperience({
        iconType: 'briefcase',
        date: '',
        title: '',
        company: '',
        description: ''
      });
      setIsAdding(false);
    } catch (error) {
      console.error('Error adding experience:', error);
      setError(error.response?.data?.message || 'Failed to add experience. Please try again.');
    }
  };

  const handleRemoveExperience = async (index) => {
    const experienceToRemove = editData[index];
    if (experienceToRemove._id) {
      try {
        setError(null);
        await axios.delete(`/api/experiences/${experienceToRemove._id}?userId=${effectiveUserId}`);
      } catch (error) {
        console.error('Error deleting experience:', error);
        setError('Failed to delete experience. Please try again.');
        return;
      }
    }
    const updated = [...editData];
    updated.splice(index, 1);
    setEditData(updated);
  };

  if (loading) {
    return (
      <section className="experience-section" id="experience">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div className="loading-spinner"></div>
          <p>Loading experiences...</p>
        
        </div>
      </section>
    );
  }

  return (
    <section className="experience-section" id="experience">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="experience-header">
          <h2 className="experience-heading">My Journey</h2>
        </div>

        {!viewOnly && (
          <motion.button
            className="edit-button"
            onClick={handleEditToggle}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isEditing ? <FaSave /> : <FaEdit />}
            {isEditing ? ' Save' : ' Edit'}
          </motion.button>
        )}

        {error && (
          <div style={{ 
            background: '#fee', 
            color: '#c33', 
            padding: '10px', 
            borderRadius: '4px', 
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <div className="experience-timeline">
          <AnimatePresence>
            {!isEditing ? (
              // View Mode
              experiences.map((exp, index) => (
                <motion.div
                  key={exp._id || index}
                  className="timeline-item"
                  custom={index}
                  initial={{ opacity: 0, y: 50, x: index % 2 === 0 ? -50 : 50 }}
                  animate={{ opacity: 1, y: 0, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  whileHover={{ scale: 1.03 }}
                >
                  <div className="timeline-icon">{getIconComponent(exp.iconType)}</div>
                  <div className="timeline-content">
                    <span className="timeline-date">{exp.date}</span>
                    <h3 className="timeline-title">{exp.title}</h3>
                    <p className="timeline-company">{exp.company}</p>
                    <p className="timeline-description">{exp.description}</p>
                  </div>
                </motion.div>
              ))
            ) : (
              // Edit Mode
              <>
                {editData.map((exp, index) => (
                  <motion.div
                    key={exp._id || index}
                    className="timeline-item edit-mode"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="timeline-icon-edit">
                      <select
                        value={exp.iconType}
                        onChange={(e) => handleIconChange(index, e.target.value)}
                      >
                        <option value="briefcase">Work</option>
                        <option value="code">Project</option>
                        <option value="graduation">Education</option>
                      </select>
                    </div>
                    <div className="timeline-content-edit">
                      <input
                        type="text"
                        value={exp.date}
                        onChange={(e) => handleInputChange(index, 'date', e.target.value)}
                        placeholder="Date/Time Period"
                      />
                      <input
                        type="text"
                        value={exp.title}
                        onChange={(e) => handleInputChange(index, 'title', e.target.value)}
                        placeholder="Title/Role"
                      />
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => handleInputChange(index, 'company', e.target.value)}
                        placeholder="Company/Institution"
                      />
                      <textarea
                        value={exp.description}
                        onChange={(e) => handleInputChange(index, 'description', e.target.value)}
                        placeholder="Description"
                      />
                    </div>
                    <button 
                      className="remove-button"
                      onClick={() => handleRemoveExperience(index)}
                    >
                      <FaTimes />
                    </button>
                  </motion.div>
                ))}

                {isAdding ? (
                  <motion.div
                    className="timeline-item edit-mode new-item"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="timeline-icon-edit">
                      <select
                        value={newExperience.iconType}
                        onChange={(e) => setNewExperience({
                          ...newExperience,
                          iconType: e.target.value
                        })}
                      >
                        <option value="briefcase">Work</option>
                        <option value="code">Project</option>
                        <option value="graduation">Education</option>
                      </select>
                    </div>
                    <div className="timeline-content-edit">
                      <input
                        type="text"
                        value={newExperience.date}
                        onChange={(e) => setNewExperience({...newExperience, date: e.target.value})}
                        placeholder="Date/Time Period"
                      />
                      <input
                        type="text"
                        value={newExperience.title}
                        onChange={(e) => setNewExperience({...newExperience, title: e.target.value})}
                        placeholder="Title/Role"
                      />
                      <input
                        type="text"
                        value={newExperience.company}
                        onChange={(e) => setNewExperience({...newExperience, company: e.target.value})}
                        placeholder="Company/Institution"
                      />
                      <textarea
                        value={newExperience.description}
                        onChange={(e) => setNewExperience({...newExperience, description: e.target.value})}
                        placeholder="Description"
                      />
                    </div>
                    <div className="new-item-buttons">
                      <button 
                        className="save-button"
                        onClick={handleAddExperience}
                      >
                        <FaSave /> Save
                      </button>
                      <button 
                        className="cancel-button"
                        onClick={() => setIsAdding(false)}
                      >
                        <FaTimes /> Cancel
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.button
                    className="add-button"
                    onClick={() => setIsAdding(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    + Add New Experience
                  </motion.button>
                )}
              </>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
};

export default Experience;