import React, { useState, useEffect, useRef } from 'react';
import './ProjectCard.css';

const ProjectCard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    link: '',
    image: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Refs for intersection observer
  const projectsSectionRef = useRef(null);

  // API Base URL
  const API_BASE_URL = 'http://localhost:9000/api';

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

  // Fetch all projects
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/projects`);
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      const data = await response.json();
      setProjects(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  // Load projects on component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const handleAddProject = () => {
    setFormData({ name: '', link: '', image: '' });
    setSelectedImage(null);
    setImagePreview('');
    setShowAddModal(true);
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      link: project.link,
      image: project.image
    });
    setSelectedImage(null);
    setImagePreview(project.image || '');
    setShowEditModal(true);
  };

  const handleDeleteProject = async () => {
    if (!editingProject) return;

    try {
      const response = await fetch(`${API_BASE_URL}/projects/${editingProject._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      // Remove from local state
      setProjects(projects.filter(project => project._id !== editingProject._id));
      closeModal();
    } catch (err) {
      console.error('Error deleting project:', err);
      alert('Failed to delete project. Please try again.');
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
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        setFormData(prev => ({ ...prev, image: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (showEditModal && editingProject) {
        // Update existing project
        const response = await fetch(`${API_BASE_URL}/projects/${editingProject._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          if (response.status === 413) {
            throw new Error('Image file is too large. Please use a smaller image (max 50MB).');
          }
          throw new Error(errorData.message || 'Failed to update project');
        }

        const updatedProject = await response.json();
        setProjects(projects.map(project => 
          project._id === editingProject._id ? updatedProject : project
        ));
        setShowEditModal(false);
        setEditingProject(null);
      } else {
        // Add new project
        const response = await fetch(`${API_BASE_URL}/projects`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          if (response.status === 413) {
            throw new Error('Image file is too large. Please use a smaller image (max 50MB).');
          }
          throw new Error(errorData.message || 'Failed to add project');
        }

        const newProject = await response.json();
        setProjects([newProject, ...projects]);
        setShowAddModal(false);
      }
      
      setFormData({ name: '', link: '', image: '' });
      setSelectedImage(null);
      setImagePreview('');
    } catch (err) {
      console.error('Error saving project:', err);
      alert(err.message || 'Failed to save project. Please try again.');
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
    setFormData({ name: '', link: '', image: '' });
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
          <h2 className={isVisible ? 'animate-in' : ''}>My Projects</h2>
          <button 
            className={`add-project-btn ${isVisible ? 'animate-in' : ''}`}
            onClick={handleAddProject}
          >
            + Add Project
          </button>
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
                      alt={project.name}
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
                  <h3>{project.name}</h3>
                  <div className="project-actions">
                    <button 
                      className="view-btn"
                      onClick={() => handleViewClick(project.link)}
      >
        View Project
                    </button>
                    <button 
                      className="edit-btn"
                      onClick={() => handleEditProject(project)}
                    >
                      Edit
                    </button>
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
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter project title"
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
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter project title"
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