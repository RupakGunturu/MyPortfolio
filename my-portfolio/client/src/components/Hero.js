import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaGithub, FaLinkedin, FaArrowRight } from "react-icons/fa";
import axios from "axios";
import { removeBackground } from "@imgly/background-removal";
import "./Hero.css";

const textContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { 
      ease: 'easeInOut', 
      duration: 0.5,
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

const letterVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 12,
      stiffness: 100,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.1
    }
  }
};

const TechPill = ({ techStackMessage, onUpdate }) => {
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState(techStackMessage || '');

  const handleSave = () => {
    onUpdate(message);
    setEditMode(false);
  };

  return (
    <motion.div 
      className="tech-pill" 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, type: 'spring', stiffness: 100 }}
      style={{ 
        background: 'rgba(17, 24, 39, 0.95)',
        backdropFilter: 'blur(10px)', 
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '8px 16px',
        borderRadius: '999px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        maxWidth: 'clamp(300px, 80vw, 500px)',
      }}
    >
      <div 
        className="pill-dot" 
        style={{
          width: '8px', 
          height: '8px',
          borderRadius: '50%',
          background: '#4ade80',
          flexShrink: 0,
        }}
      />
      <AnimatePresence mode="wait">
        {editMode ? (
          <motion.div
            key="edit"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="tech-pill-edit" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <input
              type="text"
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="tech-pill-input"
              placeholder="Enter your tech stack"
            />
            <button onClick={handleSave} className="tech-pill-save" style={{background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer'}}>Save</button>
            <button onClick={() => setEditMode(false)} className="tech-pill-cancel" style={{background: 'transparent', color: 'white', border: 'none', cursor: 'pointer'}}>Cancel</button>
          </motion.div>
        ) : (
          <motion.div
            key="view"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="tech-pill-content" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <span style={{ color: 'white', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
              {message || "Currently working with React & Next.js"}
            </span>
            <button 
              onClick={() => setEditMode(true)} 
              className="tech-pill-edit-button"
              aria-label="Edit tech stack"
              style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              ✏️
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Hero = () => {
  const [profile, setProfile] = useState({ 
    name: "", 
    bio: "", 
    imageUrl: "",
    techStackMessage: ""
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showMainContent, setShowMainContent] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [form, setForm] = useState({ 
    name: "", 
    bio: "", 
    imageUrl: "",
    techStackMessage: ""
  });

  // Split the name for left/right layout
  const [firstName, ...restNameArr] = (profile.name || "").trim().split(' ');
  const lastName = restNameArr.join(' ');

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("/api/user");
        const data = res.data || {};
        setProfile({ 
          name: data.name || "Your Name",
          bio: data.bio || "",
          imageUrl: data.imageUrl || "/images/profile-placeholder.png",
          techStackMessage: data.techStackMessage || ""
        });
        setForm({
          name: data.name || "Your Name",
          bio: data.bio || "",
          imageUrl: data.imageUrl || "/images/profile-placeholder.png",
          techStackMessage: data.techStackMessage || ""
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        // Set default profile on error
        setProfile({ name: "Your Name", imageUrl: "/images/profile-placeholder.png", techStackMessage: "Tech Stack" });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMainContent(true);
    }, 2000); // Time "Welcome" is shown
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const formData = new FormData();
      if (form.imageUrl instanceof File) {
        formData.append('image', form.imageUrl);
      }
      formData.append('name', form.name);
      formData.append('bio', form.bio);
      formData.append('techStackMessage', form.techStackMessage);

      const res = await axios.put("/api/user", formData, {
        headers: {
          'Content-Type': form.imageUrl instanceof File ? 'multipart/form-data' : 'application/json'
        }
      });
      
      setProfile(res.data);
      setEditing(false);
    } catch (err) {
      console.error("Update failed:", err);
      alert("Update failed. Please check console for details.");
    }
  };

  const hasTransparentBackground = (file) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
            const image = new Image();
            image.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = image.width;
                canvas.height = image.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(false);
                    return;
                }
                ctx.drawImage(image, 0, 0);

                // Check a few corner pixels for transparency
                const corners = [
                    ctx.getImageData(0, 0, 1, 1).data,
                    ctx.getImageData(canvas.width - 1, 0, 1, 1).data,
                    ctx.getImageData(0, canvas.height - 1, 1, 1).data,
                    ctx.getImageData(canvas.width - 1, canvas.height - 1, 1, 1).data,
                ];

                const isTransparent = corners.some(corner => corner[3] === 0);
                resolve(isTransparent);
            };
            image.onerror = () => resolve(false);
            if (typeof reader.result === 'string') {
                image.src = reader.result;
            } else {
                resolve(false);
            }
        };
        reader.onerror = () => resolve(false);
        reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
    }

    const isAlreadyTransparent = await hasTransparentBackground(file);

    if (isAlreadyTransparent) {
        console.log("Image has transparency, skipping background removal.");
        setForm(prev => ({ ...prev, imageUrl: file }));
        const previewUrl = URL.createObjectURL(file);
        setProfile(prev => ({ ...prev, imageUrl: previewUrl }));
        return;
    }

    setIsProcessing(true);

    try {
        const blob = await removeBackground(file);
        const processedFile = new File([blob], file.name.replace(/\\.[^/.]+$/, "") + ".png", { type: 'image/png' });

        setForm(prev => ({ ...prev, imageUrl: processedFile }));

        const previewUrl = URL.createObjectURL(processedFile);
        setProfile(prev => ({ ...prev, imageUrl: previewUrl }));

    } catch (error) {
        console.error("Failed to remove background:", error);
        alert("Could not remove background. Please try another image.");
        // Fallback to original image
        setForm(prev => ({ ...prev, imageUrl: file }));
        const previewUrl = URL.createObjectURL(file);
        setProfile(prev => ({ ...prev, imageUrl: previewUrl }));
    } finally {
        setIsProcessing(false);
    }
  };

  const handleTechStackUpdate = async (newMessage) => {
    try {
      const res = await axios.put("/api/user", { techStackMessage: newMessage });
      setProfile(res.data);
      setForm(prev => ({ ...prev, techStackMessage: newMessage }));
    } catch (err) {
      console.error("Failed to update tech stack:", err);
    }
  };

  if (loading) {
    return (
      <div className="hero-section loading" style={{ background: '#fff' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <section
      className="hero-section"
      id="home"
      style={{
        background: '#fff',
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: '32px',
      }}
    >
      <AnimatePresence mode="wait">
        {!showMainContent ? (
          <motion.div
            key="welcome"
            variants={textContainerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{
              display: 'flex',
              color: '#3b82f6', // Welcome is blue
              fontSize: 'clamp(3rem, 12vw, 9rem)',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '-0.05em',
            }}
          >
            {'Welcome'.split('').map((char, index) => (
              <motion.span key={`w-${index}`} variants={letterVariants} style={{ display: 'inline-block' }}>
                {char}
              </motion.span>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="main-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.8 } }}
            exit={{ opacity: 0 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
              width: '100%',
              flexGrow: 1
            }}
          >
            {/* Visual container for image and background text */}
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1, width: '100%' }}>
              {/* Background Name */}
              <motion.div
                className="hero-background-name"
                variants={textContainerVariants}
                initial="hidden"
                animate="visible"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  whiteSpace: 'nowrap',
                  fontSize: 'clamp(3rem, 12vw, 9rem)',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '-0.05em',
                  userSelect: 'none',
                  width: '100%',
                }}
              >
                <motion.span style={{ color: '#111827', display: 'flex' }}>
                  {firstName.split('').map((char, index) => (
                    <motion.span key={`fn-${index}`} variants={letterVariants} style={{ display: 'inline-block' }}>
                      {char === ' ' ? '\u00A0' : char}
                    </motion.span>
                  ))}
                </motion.span>
                
                <div style={{ position: 'relative' }}>
                  <motion.span style={{ color: '#3b82f6', marginLeft: '0.25em', display: 'flex' }}>
                    {lastName.split('').map((char, index) => (
                      <motion.span key={`ln-${index}`} variants={letterVariants} style={{ display: 'inline-block' }}>
                        {char === ' ' ? '\u00A0' : char}
                      </motion.span>
                    ))}
                  </motion.span>
                </div>

              </motion.div>

              {/* Foreground Image */}
              <motion.img
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                src={profile.imageUrl}
                alt={profile.name}
                className="hero-profile-image"
                style={{
                  zIndex: 2,
                  position: 'relative',
                  width: 'auto',
                  height: 'clamp(700px, 75vh, 1050px)',
                  objectFit: 'contain',
                }}
                onError={(e) => { e.target.src = "/images/profile-placeholder.png"; }}
              />
            </div>

            {/* Controls below image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{
                zIndex: 3,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '24px',
                marginTop: '24px',
                paddingBottom: '32px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <button
                  onClick={() => setEditing(true)}
                  style={{
                    background: '#fff',
                    color: '#1e293b',
                    border: '1px solid #e2e8f0',
                    borderRadius: '999px',
                    padding: '10px 22px',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                    cursor: 'pointer'
                  }}
                >
                  Edit Profile
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <a href="https://github.com/RupakGunturu" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                    <FaGithub style={{ fontSize: '1.5rem', color: '#1e293b' }} />
                  </a>
                  <a href="https://linkedin.com/in/RupakGunturu" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                    <FaLinkedin style={{ fontSize: '1.5rem', color: '#1e293b' }} />
                  </a>
                </div>
              </div>
              <div style={{ transform: 'translate(11rem, 1.75rem)' }}>
                <TechPill techStackMessage={profile.techStackMessage} onUpdate={handleTechStackUpdate} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Form Modal */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditing(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.6)',
              zIndex: 49,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
              overflowY: 'auto'
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: -30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'relative',
                zIndex: 50,
              }}
            >
              <form
                onSubmit={handleSubmit}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  minWidth: 'clamp(280px, 80vw, 400px)',
                  maxWidth: '400px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  position: 'relative', // Needed for loading overlay
                }}
              >
                {isProcessing && (
                  <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(255, 255, 255, 0.9)',
                      zIndex: 10,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '16px',
                      gap: '10px'
                  }}>
                      <div className="loading-spinner"></div>
                      <p style={{ color: '#374151', fontWeight: 500 }}>
                          Removing background...
                      </p>
                  </div>
                )}
                <h2 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '600', 
                  color: '#1e293b',
                  margin: '0 0 8px 0',
                  textAlign: 'center'
                }}>
                  Edit Profile
                </h2>
                <div className="form-group">
                  <label className="nav-label" style={{ 
                    fontSize: '0.9rem', 
                    fontWeight: '500', 
                    color: '#374151',
                    marginBottom: '6px',
                    display: 'block'
                  }}>
                    Name
                  </label>
                  <input 
                    className="form-input" 
                    value={form.name} 
                    onChange={(e) => setForm({...form, name: e.target.value})} 
                    placeholder="Your name"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div className="form-group">
                  <label className="nav-label" style={{ 
                    fontSize: '0.9rem', 
                    fontWeight: '500', 
                    color: '#374151',
                    marginBottom: '6px',
                    display: 'block'
                  }}>
                    Profile Image
                  </label>
                  <div className="file-upload-wrapper" style={{
                    background: '#f9fafb',
                    borderRadius: '8px',
                    padding: '20px',
                    border: '2px dashed #d1d5db',
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}>
                    <label className="file-upload-button" style={{
                      color: '#374151',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}>
                      Choose New Image
                      <input 
                        type="file" 
                        accept="image/png" 
                        onChange={handleImageUpload} 
                        className="file-input" 
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                  <p style={{ 
                    fontSize: '0.7rem', 
                    color: '#6b7280', 
                    marginTop: '8px',
                    fontStyle: 'italic',
                    lineHeight: '1.3',
                    textAlign: 'center',
                    background: 'rgba(59, 130, 246, 0.05)',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    border: '1px solid rgba(59, 130, 246, 0.1)'
                  }}>
                    ("Kindly upload the image as a background image to fully appreciate its visual appeal and enhance the overall aesthetic.")
                  </p>
                </div>
                <div className="form-actions" style={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end', 
                  gap: '10px',
                  marginTop: '8px'
                }}>
                  <button 
                    type="button" 
                    onClick={() => setEditing(false)} 
                    className="secondary-button"
                    style={{
                      padding: '8px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      background: '#ffffff',
                      color: '#374151',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontSize: '0.85rem'
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="primary-button"
                    style={{
                      padding: '8px 16px',
                      border: 'none',
                      borderRadius: '6px',
                      background: '#3b82f6',
                      color: '#ffffff',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontSize: '0.85rem'
                    }}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Hero;