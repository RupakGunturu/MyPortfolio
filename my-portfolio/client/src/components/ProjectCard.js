import React, { useState, useEffect, useRef, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaExternalLinkAlt } from 'react-icons/fa';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import './ProjectCard.css';
import API_BASE_URL from '../utils/api';

const ProjectCard = ({ viewOnly = false, userId }) => {
  const authContext = useContext(AuthContext);
  const { user } = authContext || {};
  const effectiveUserId = userId || (user && user._id);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
    image: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Refs for intersection observer
  const projectsSectionRef = useRef(null);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    if (projectsSectionRef.current) {
      observer.observe(projectsSectionRef.current);
    }

    return () => {
      if (projectsSectionRef.current) {
        observer.unobserve(projectsSectionRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (effectiveUserId) {
      fetchProjects();
    }
  }, [effectiveUserId]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}?userId=${effectiveUserId}`);
      setProjects(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = () => {
    setFormData({ title: '', description: '', link: '', image: '' });
    setSelectedImage(null);
    setImagePreview('');
    setShowAddModal(true);
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title || '',
      description: project.description || '',
      link: project.link || '',
      image: project.image || ''
    });
    setSelectedImage(null);
    setImagePreview(project.image || '');
    setShowEditModal(true);
  };

  const handleDeleteProject = async () => {
    if (!editingProject) return;

    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await axios.delete(`${API_BASE_URL}/${editingProject._id}?userId=${effectiveUserId}`);
        setProjects(projects.filter(project => project._id !== editingProject._id));
        closeModal();
      } catch (err) {
        console.error('Error deleting project:', err);
        alert('Failed to delete project. Please try again.');
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        alert('Image file is too large. Please select an image smaller than 50MB.');
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (showEditModal && editingProject) {
        // Update existing project
        const response = await axios.put(`${API_BASE_URL}/${editingProject._id}`, {
          ...formData,
          userId: effectiveUserId
        });

        setProjects(projects.map(project => 
          project._id === editingProject._id ? response.data : project
        ));
        setShowEditModal(false);
        setEditingProject(null);
      } else {
        // Add new project
        const response = await axios.post(`${API_BASE_URL}/api/projects`, {
          ...formData,
          userId: effectiveUserId
        });

        setProjects([response.data, ...projects]);
        setShowAddModal(false);
      }
      
      setFormData({ title: '', description: '', link: '', image: '' });
      setSelectedImage(null);
      setImagePreview('');
    } catch (err) {
      console.error('Error saving project:', err);
      alert(err.response?.data?.message || 'Failed to save project. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const closeModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingProject(null);
    setFormData({ title: '', description: '', link: '', image: '' });
    setSelectedImage(null);
    setImagePreview('');
  };

  const handleViewClick = (link) => {
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <section className="projects-section" ref={projectsSectionRef}>
        <div className="projects-container">
          <div className="projects-header">
            <h2>My Projects</h2>
          </div>
          <div className="loading-container">
            <p>Loading projects...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="projects-section" ref={projectsSectionRef}>
        <div className="projects-container">
          <div className="projects-header">
            <h2>My Projects</h2>
          </div>
          <div className="error-container">
            <p>Error: {error}</p>
            <button onClick={fetchProjects} className="retry-btn">
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`projects-section ${isVisible ? 'animate-in' : ''}`} ref={projectsSectionRef}>
      <div className="projects-container">
        <div className="projects-header">
          <h2 className={`project-title ${isVisible ? 'animate-in' : ''}`}>My Projects</h2>
          {!viewOnly && (
            <button 
              className={`add-project-btn ${isVisible ? 'animate-in' : ''}`}
              onClick={handleAddProject}
            >
              + Add Project
            </button>
          )}
        </div>
        
        <div className="projects-grid">
          {projects.length === 0 ? (
            <div className={`no-projects ${isVisible ? 'animate-in' : ''}`}>
              <p>No projects yet. Add your first project!</p>
            </div>
          ) : (
            projects.map((project, index) => (
              <div 
                key={project._id} 
                className={`project-card ${isVisible ? 'animate-in' : ''}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
    <div className="project-image">
                  {project.image ? (
        <img
                      src={project.image}
                      alt={project.title}
          onError={e => {
            e.target.onerror = null;
            e.target.src = "https://via.placeholder.com/300x200?text=Project+Preview";
          }}
        />
      ) : (
        <div className="no-image-placeholder">
          <span>No Preview Available</span>
        </div>
      )}
    </div>
    <div className="project-details">
                  <h3>{project.title}</h3>
                  {project.description && (
                    <div className="project-bio">
                      <p>{project.description}</p>
                    </div>
                  )}
                  <div className="project-actions">
                    <button 
                      className="view-btn"
                      onClick={() => handleViewClick(project.link)}
      >
        View Project
                    </button>
                    {!viewOnly && (
                      <button 
                        className="edit-btn"
                        onClick={() => handleEditProject(project)}
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Project Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Project</h3>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Project Title:</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter project title"
                />
              </div>
              <div className="form-group">
                <label>Description:</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter a short description of your project"
                />
              </div>
              <div className="form-group">
                <label>Vercel URL:</label>
                <input
                  type="url"
                  name="link"
                  value={formData.link}
                  onChange={handleInputChange}
                  required
                  placeholder="https://your-project.vercel.app"
                />
              </div>
              <div className="form-group">
                <label>Preview Image:</label>
                <div className="image-upload-container">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="file-input"
                    id="add-image-upload"
                  />
                  <label htmlFor="add-image-upload" className="file-input-label">
                    {selectedImage ? selectedImage.name : 'Choose Image File'}
                  </label>
                  {imagePreview && (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Preview" />
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={closeModal} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Add Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Project</h3>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Project Title:</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter project title"
                />
              </div>
              <div className="form-group">
                <label>Description:</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter a short description of your project"
                />
              </div>
              <div className="form-group">
                <label>Vercel URL:</label>
                <input
                  type="url"
                  name="link"
                  value={formData.link}
                  onChange={handleInputChange}
                  required
                  placeholder="https://your-project.vercel.app"
                />
              </div>
              <div className="form-group">
                <label>Preview Image:</label>
                <div className="image-upload-container">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="file-input"
                    id="edit-image-upload"
                  />
                  <label htmlFor="edit-image-upload" className="file-input-label">
                    {selectedImage ? selectedImage.name : 'Choose Image File'}
                  </label>
                  {imagePreview && (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Preview" />
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={handleDeleteProject} className="delete-btn">
                  Delete Project
                </button>
                <button type="button" onClick={closeModal} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Update Project
                </button>
              </div>
            </form>
    </div>
  </div>
      )}
    </section>
);
};

export default ProjectCard; 