import React, { useState, useEffect } from 'react';

const Skill = () => {
  const [skills, setSkills] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newSkill, setNewSkill] = useState({ title: '', level: 'intermediate' });
  const [toastMessage, setToastMessage] = useState('');
  const [isDeleting, setIsDeleting] = useState(null);

  // Fetch skills from backend
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await fetch('http://localhost:9000/api/skill');
        const data = await response.json();
        setSkills(data);
      } catch (err) {
        console.error('Failed to fetch skills:', err);
        showToast('Failed to load skills 🚨');
      }
    };
    fetchSkills();
  }, []);

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
      showToast('Skill name is required! 🚨');
      return;
    }

    try {
      const response = await fetch('http://localhost:9000/api/skill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSkill)
      });

      if (!response.ok) throw new Error('Failed to save skill');
      
      const savedSkill = await response.json();
      setSkills(prev => [savedSkill, ...prev]);
      setNewSkill({ title: '', level: 'intermediate' });
      setIsFormOpen(false);
      showToast('Skill added! 🎉');
    } catch (err) {
      console.error('Save error:', err);
      showToast('Error saving skill! 🚨');
    }
  };

  const handleDelete = async (skillId) => {
    setIsDeleting(skillId);
    try {
      const response = await fetch(`http://localhost:9000/api/skill/${skillId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete skill');
      
      setSkills(prev => prev.filter(skill => skill._id !== skillId));
      showToast('Skill deleted! 🗑️');
    } catch (err) {
      console.error('Delete error:', err);
      showToast('Error deleting skill! 🚨');
    } finally {
      setIsDeleting(null);
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

  return (
    <section style={styles.section}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.heading}>Technical Skills</h2>
          <p style={styles.subHeading}>Manage your skill proficiency levels</p>
        </div>
        <button 
          style={styles.addButton}
          onClick={() => setIsFormOpen(true)}
        >
          <svg style={styles.plusIcon} viewBox="0 0 24 24">
            <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
          </svg>
          Add Skill
        </button>
      </div>

      {isFormOpen && (
        <form style={styles.form} onSubmit={handleSubmit}>
          <input
            name="title"
            placeholder="Enter skill name..."
            value={newSkill.title}
            onChange={handleChange}
            style={styles.input}
            autoFocus
          />
          <select
            name="level"
            value={newSkill.level}
            onChange={handleChange}
            style={styles.levelSelect}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
          </select>
          <div style={styles.formActions}>
            <button type="submit" style={styles.submitButton}>
              Save Skill
            </button>
            <button
              type="button"
              onClick={() => {
                setIsFormOpen(false);
                setNewSkill({ title: '', level: 'intermediate' });
              }}
              style={styles.cancelButton}
            >
              Discard
            </button>
          </div>
        </form>
      )}

      <div style={styles.grid}>
        {skills.map(skill => (
          <div key={skill._id} style={styles.card}>
            <div style={styles.cardContent}>
              <div style={styles.skillHeader}>
                <h3 style={styles.title}>{skill.title}</h3>
                <div style={styles.actions}>
                  <span style={{
                    ...styles.levelTag,
                    backgroundColor: getProgressColor(skill.level)
                  }}>
                    {skill.level}
                  </span>
                  <button 
                    onClick={() => handleDelete(skill._id)}
                    style={styles.deleteButton}
                    disabled={isDeleting === skill._id}
                    aria-label={`Delete ${skill.title}`}
                  >
                    {isDeleting === skill._id ? (
                      <span style={styles.spinner}></span>
                    ) : (
                      <svg style={styles.trashIcon} viewBox="0 0 24 24">
                        <path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div style={styles.skillLevel}>
                <div 
                  style={{
                    width: `${getProgressWidth(skill.level)}%`,
                    backgroundColor: getProgressColor(skill.level),
                    height: '100%',
                    borderRadius: '4px',
                    transition: 'all 0.3s ease'
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {toastMessage && (
        <div style={toastStyles}>
          {toastMessage}
        </div>
      )}
    </section>
  );
};

// Updated styles with delete button
const styles = {
  section: {
    padding: '2rem 1.5rem',
    backgroundColor: '#f9fafb',
    minHeight: '100vh',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2.5rem',
    paddingBottom: '1.5rem',
    borderBottom: '1px solid #e5e7eb',
  },
  heading: {
    fontSize: '1.875rem',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  subHeading: {
    fontSize: '0.875rem',
    color: '#6b7280',
    margin: '0.25rem 0 0',
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'transform 0.2s ease',
    boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.2)',
    ':hover': {
      transform: 'translateY(-1px)',
    },
  },
  plusIcon: {
    width: '1.25rem',
    height: '1.25rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '1rem',
    padding: '1.5rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    border: '1px solid #f3f4f6',
    position: 'relative',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    },
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  title: {
    color: '#111827',
    fontSize: '1.125rem',
    fontWeight: '500',
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
    color: '#fff',
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
    transition: 'all 0.2s ease',
    ':hover': {
      background: 'rgba(239, 68, 68, 0.1)',
    },
    ':disabled': {
      opacity: 0.7,
      cursor: 'not-allowed',
    },
  },
  trashIcon: {
    width: '1.25rem',
    height: '1.25rem',
    color: '#ef4444',
  },
  spinner: {
    width: '1rem',
    height: '1rem',
    border: '2px solid rgba(239, 68, 68, 0.3)',
    borderTopColor: '#ef4444',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  skillLevel: {
    height: '8px',
    backgroundColor: '#f3f4f6',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    marginBottom: '2rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  input: {
    width: '100%',
    padding: '0.875rem 1rem',
    border: '1px solid #e5e7eb',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    transition: 'border-color 0.2s ease',
    ':focus': {
      outline: 'none',
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
    },
  },
  levelSelect: {
    padding: '0.75rem',
    border: '1px solid #e5e7eb',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    width: '100%',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
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
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'opacity 0.2s ease',
    ':hover': {
      opacity: 0.9,
    },
  },
  cancelButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#fff',
    color: '#6b7280',
    border: '1px solid #e5e7eb',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'background-color 0.2s ease',
    ':hover': {
      backgroundColor: '#f9fafb',
    },
  },
  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  },
};

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

export default Skill;