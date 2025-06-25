import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaGithub, FaLinkedin, FaArrowRight } from "react-icons/fa";
import axios from "axios";
import { removeBackground } from "@imgly/background-removal";
import "./Hero.css";
import AuthContext from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

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

const Hero = ({ viewOnly = false }) => {
  const [profile, setProfile] = useState({ 
    name: "", 
    bio: "", 
    imageUrl: "",
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showMainContent, setShowMainContent] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [form, setForm] = useState({ 
    name: "", 
    bio: "", 
    imageUrl: "",
  });

  const authContext = React.useContext(AuthContext);
  const { user } = authContext || {};

  const navigate = useNavigate();

  // Split the name for left/right layout
  const [lastName, ...restNameArr] = (profile.name || "").trim().split(' ').reverse();
  const firstName = restNameArr.reverse().join(' ');

  const animationDelay = (profile.name || "").length * 0.08 + 0.5;

  const shadowTransition = {
    opacity: { duration: 0.5, ease: "easeIn", delay: animationDelay },
    y: {
      duration: 3,
      repeat: Infinity,
      repeatType: "mirror",
      ease: "easeInOut",
      delay: animationDelay,
    },
  };

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user || !user._id) return;
      try {
        const res = await axios.get(`/api/user?userId=${user._id}`);
        const data = res.data || {};
        setProfile({ 
          name: data.fullname || data.name || "Your Name",
          bio: data.bio || "",
          imageUrl: data.imageUrl || "/images/profile-placeholder.png",
        });
        setForm({
          name: data.fullname || data.name || "Your Name",
          bio: data.bio || "",
          imageUrl: data.imageUrl || "/images/profile-placeholder.png",
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        setProfile({ name: "Your Name", imageUrl: "/images/profile-placeholder.png" });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

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
      formData.append('fullname', form.name);
      formData.append('bio', form.bio);
      if (user && user._id) {
        formData.append('userId', user._id);
      }
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
        background: '#fff', // White background
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
              fontFamily: "'Montserrat', sans-serif",
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
              {/* Background Name using new stacked effect */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 1,
                }}
              >
                <div className="stacked-text-wrapper">
                  
                  <motion.div 
                    className="text-layer text-layer-shadow shadow-top-far" 
                    initial={{ opacity: 0, y: "-1.2em" }}
                    animate={{ opacity: 0.6, y: ["-1.2em", "-1.3em", "-1.2em"] }}
                    transition={shadowTransition}
                  >
                    {(profile.name || "Your Name").toUpperCase()}
                  </motion.div>
                  
                  <motion.div 
                    className="text-layer text-layer-shadow shadow-top" 
                    initial={{ opacity: 0, y: "-0.6em" }}
                    animate={{ opacity: 1, y: ["-0.6em", "-0.7em", "-0.6em"] }}
                    transition={shadowTransition}
                  >
                    {(profile.name || "Your Name").toUpperCase()}
                  </motion.div>
                  
                  <motion.div 
                    className="text-layer text-layer-shadow shadow-bottom" 
                    initial={{ opacity: 0, y: "0.6em" }}
                    animate={{ opacity: 1, y: ["0.6em", "0.5em", "0.6em"] }}
                    transition={shadowTransition}
                  >
                    {(profile.name || "Your Name").toUpperCase()}
                  </motion.div>
                  
                  <motion.div 
                    className="text-layer text-layer-shadow shadow-bottom-far"
                    initial={{ opacity: 0, y: "1.2em" }}
                    animate={{ opacity: 0.6, y: ["1.2em", "1.1em", "1.2em"] }}
                    transition={shadowTransition}
                  >
                    {(profile.name || "Your Name").toUpperCase()}
                  </motion.div>

                  {/* Main Text Layer */}
                  <motion.div className="text-layer text-layer-main" variants={textContainerVariants} initial="hidden" animate="visible" >
                    {(profile.name || "Your Name").toUpperCase().split('').map((char, index) => (
                      <motion.span key={`main-${index}`} variants={letterVariants}>{char === ' ' ? '\u00A0' : char}</motion.span>
                    ))}
                  </motion.div>

                </div>
              </div>

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
                {!viewOnly && (
                  <button
                    onClick={() => setEditing(true)}
                    className="edit-profile-button"
                  >
                    Edit Profile
                  </button>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <motion.a 
                    href="https://github.com/RupakGunturu" 
                    target="_blank" rel="noopener noreferrer" 
                    aria-label="GitHub"
                    style={{ color: '#1e293b' }}
                    whileHover={{ scale: 1.2, rotate: -5, color: '#3b82f6' }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <FaGithub style={{ fontSize: '1.5rem' }} />
                  </motion.a>
                  <motion.a 
                    href="https://linkedin.com/in/RupakGunturu" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    aria-label="LinkedIn"
                    style={{ color: '#1e293b' }}
                    whileHover={{ scale: 1.2, rotate: 5, color: '#3b82f6' }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <FaLinkedin style={{ fontSize: '1.5rem' }} />
                  </motion.a>
                </div>
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
                  <div className="file-upload-wrapper">
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
                    ("Kindly upload the image as a  Removed background image to fully appreciate its visual appeal and enhance the overall aesthetic.")
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
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="primary-button"
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