import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaGithub, FaLinkedin, FaArrowRight } from "react-icons/fa";
import axios from "axios";
import { Typewriter } from 'react-simple-typewriter';
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
    <div 
      className="tech-pill" 
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
      {editMode ? (
        <div className="tech-pill-edit" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
            className="tech-pill-input"
            placeholder="Enter your tech stack"
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'white', 
              outline: 'none',
              fontSize: '0.8rem',
              width: '200px'
            }}
          />
          <button onClick={handleSave} className="tech-pill-save" style={{background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer'}}>Save</button>
          <button onClick={() => setEditMode(false)} className="tech-pill-cancel" style={{background: 'transparent', color: 'white', border: 'none', cursor: 'pointer'}}>Cancel</button>
        </div>
      ) : (
        <div className="tech-pill-content" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'white', fontSize: '0.8rem', whiteSpace: 'normal', textAlign: 'center' }}>
            <Typewriter
              words={[message || "Currently working with React & Next.js"]}
              loop={false}
              cursor
              cursorStyle='_'
              typeSpeed={50}
              delaySpeed={1500}
            />
          </span>
          <button 
            onClick={() => setEditMode(true)} 
            className="tech-pill-edit-button"
            aria-label="Edit tech stack"
            style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '0.8rem' }}
          >
            ✏️
          </button>
        </div>
      )}
      
    </div>
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

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setForm(prev => ({ ...prev, imageUrl: file }));
    
    const previewUrl = URL.createObjectURL(file);
    setProfile(prev => ({ ...prev, imageUrl: previewUrl }));
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
                <motion.span style={{ color: '#3b82f6', marginLeft: '0.25em', display: 'flex' }}>
                  {lastName.split('').map((char, index) => (
                    <motion.span key={`ln-${index}`} variants={letterVariants} style={{ display: 'inline-block' }}>
                      {char === ' ' ? '\u00A0' : char}
                    </motion.span>
                  ))}
                </motion.span>
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
                  height: 'clamp(450px, 80vh, 900px)',
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
              {/* <div style={{ marginTop: '16px' }}>
                <TechPill techStackMessage={profile.techStackMessage} onUpdate={handleTechStackUpdate} />
              </div> */}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TechPill on the bottom left */}
      <div style={{ position: 'absolute', bottom: 32, left: 32, zIndex: 3 }}>
        <TechPill techStackMessage={profile.techStackMessage} onUpdate={handleTechStackUpdate} />
      </div>

      {/* Edit Form Modal */}
      <AnimatePresence>
        {editing && (
          <>
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
              }}
            />
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
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
                  minWidth: 'clamp(300px, 90vw, 480px)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                <h2>Edit Profile</h2>
                <div className="form-group">
                  <label className="nav-label">Name</label>
                  <input className="form-input" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="Your name" />
                </div>
                <div className="form-group">
                  <label className="nav-label">Profile Image</label>
                  <div className="file-upload-wrapper">
                    <label className="file-upload-button">Choose New Image
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="file-input" />
                    </label>
                  </div>
                </div>
                <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                  <button type="button" onClick={() => setEditing(false)} className="secondary-button">Cancel</button>
                  <button type="submit" className="primary-button">Save Changes</button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Hero;