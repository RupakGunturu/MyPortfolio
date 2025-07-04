import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaGithub, FaLinkedin, FaArrowRight } from "react-icons/fa";
import axios from "axios";
import { removeBackground } from "@imgly/background-removal";
import "./Hero.css";
import AuthContext from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

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

// Helper to get the correct image URL
const getImageUrl = (url) => {
  if (!url) return "/images/profile-placeholder.png";
  if (url.startsWith("http") || url.startsWith("/images/")) return url;
  if (url.startsWith("/uploads/")) {
    return `${API_BASE_URL}${url}`;
  }
  return url;
};

// Helper to format social media URLs
const formatSocialUrl = (url, platform) => {
  if (!url) return "";
  
  // Remove any whitespace
  url = url.trim();
  
  // If it's already a full URL, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Format based on platform
  if (platform === 'github') {
    if (url.startsWith('github.com/')) {
      return `https://${url}`;
    }
    return `https://github.com/${url}`;
  }
  
  if (platform === 'linkedin') {
    if (url.startsWith('linkedin.com/')) {
      return `https://${url}`;
    }
    return `https://linkedin.com/in/${url}`;
  }
  
  return url;
};

// Helper to calculate dynamic font size based on name length
const getDynamicFontSize = (name) => {
  if (!name || name.trim() === "") return "clamp(4rem, 15vw, 12rem)";
  
  const nameLength = name.trim().length;
  let fontSize;
  
  // Very short names (1-3 characters) - largest font
  if (nameLength <= 3) {
    fontSize = "clamp(6rem, 20vw, 16rem)";
  }
  // Short names (4-6 characters) - very large font
  else if (nameLength <= 6) {
    fontSize = "clamp(5rem, 18vw, 14rem)";
  }
  // Medium names (7-10 characters) - large font
  else if (nameLength <= 10) {
    fontSize = "clamp(4rem, 15vw, 12rem)";
  }
  // Long names (11-15 characters) - medium font
  else if (nameLength <= 15) {
    fontSize = "clamp(3.5rem, 13vw, 10rem)";
  }
  // Very long names (16-20 characters) - smaller font
  else if (nameLength <= 20) {
    fontSize = "clamp(2.5rem, 10vw, 7rem)";
  }
  // Extra long names (21-25 characters) - small font
  else if (nameLength <= 25) {
    fontSize = "clamp(2.5rem, 9vw, 6rem)";
  }
  // Extremely long names (26+ characters) - smallest font
  else {
    fontSize = "clamp(2rem, 7vw, 5rem)";
  }
  
  console.log(`Name: "${name}" (${nameLength} chars) → Font size: ${fontSize}`);
  return fontSize;
};

const Hero = ({ userId: propUserId, viewOnly = false }) => {
  const [profile, setProfile] = useState({ 
    fullname: "", 
    imageUrl: "",
    githubUrl: "",
    linkedinUrl: "",
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showMainContent, setShowMainContent] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [form, setForm] = useState({ 
    fullname: "", 
    imageUrl: "",
    githubUrl: "",
    linkedinUrl: "",
  });

  const authContext = React.useContext(AuthContext);
  const { user } = authContext || {};

  const navigate = useNavigate();
  const userId = propUserId || (user && user._id);

  // Split the name for left/right layout
  const [lastName, ...restNameArr] = (profile.fullname || "").trim().split(' ').reverse();
  const firstName = restNameArr.reverse().join(' ');

  const animationDelay = (profile.fullname || "").length * 0.08 + 0.5;

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
  const fetchProfile = async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/api/user?userId=${userId}`);
      const data = res.data || {};
      setProfile({ 
        fullname: data.fullname || data.name || "Your Name",
        imageUrl: data.imageUrl || "/images/profile-placeholder.png",
        githubUrl: data.githubUrl || "",
        linkedinUrl: data.linkedinUrl || "",
      });
      setForm({
        fullname: data.fullname || data.name || "Your Name",
        imageUrl: data.imageUrl || "/images/profile-placeholder.png",
        githubUrl: data.githubUrl || "",
        linkedinUrl: data.linkedinUrl || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      setProfile({ 
        fullname: "Your Name", 
        imageUrl: "/images/profile-placeholder.png",
        githubUrl: "",
        linkedinUrl: "",
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchProfile();
  }, [userId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMainContent(true);
    }, 2000); // Time "Welcome" is shown
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!user || !user._id) {
      alert("You must be logged in to update your profile.");
      return;
    }
    
    // Validate form data
    if (!form.fullname.trim()) {
      alert("Please enter your name.");
      return;
    }
    
    try {
      // First, try a simple JSON request to test the database
      console.log("Testing database update with simple request...");
      const testData = {
        userId: user._id,
        fullname: form.fullname,
        githubUrl: formatSocialUrl(form.githubUrl, 'github'),
        linkedinUrl: formatSocialUrl(form.linkedinUrl, 'linkedin')
      };
      
      console.log("Test data:", testData);
      
      // Test with simple JSON endpoint first
      const testRes = await axios.post(`${API_BASE_URL}/api/test-update`, testData);
      console.log("Test update response:", testRes.data);
      
      // If test succeeds, proceed with the actual update
      const formData = new FormData();
      if (form.imageUrl instanceof File) {
        formData.append('image', form.imageUrl);
      }
      formData.append('fullname', form.fullname);
      formData.append('githubUrl', formatSocialUrl(form.githubUrl, 'github'));
      formData.append('linkedinUrl', formatSocialUrl(form.linkedinUrl, 'linkedin'));
      formData.append('userId', user._id);
      
      const res = await axios.put(`${API_BASE_URL}/api/user`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log("Profile update response:", res.data);
      
      // Update profile state with the response data
      const updatedProfile = {
        fullname: res.data.fullname || res.data.name || "Your Name",
        imageUrl: res.data.imageUrl || "/images/profile-placeholder.png",
        githubUrl: res.data.githubUrl || "",
        linkedinUrl: res.data.linkedinUrl || "",
        preview: false // Reset preview after save
      };
      
      console.log("Updated profile state:", updatedProfile);
      
      setProfile(updatedProfile);
      setForm(form => ({
        ...form,
        imageUrl: res.data.imageUrl || "/images/profile-placeholder.png",
        githubUrl: res.data.githubUrl || "",
        linkedinUrl: res.data.linkedinUrl || "",
      }));
      
      // Show success message
      alert("Profile updated successfully! Social media icons will now appear.");
      setEditing(false);

      // Update user in AuthContext
      if (authContext && authContext.setUser) {
        authContext.setUser({
          ...user,
          fullname: res.data.fullname || res.data.name || "Your Name",
          // ...other fields if needed
        });
      }
    } catch (err) {
      console.error("Update failed:", err);
      console.error("Error response:", err.response?.data);
      alert(`Update failed: ${err.response?.data?.error || err.message}`);
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
        // Only set preview for editing, not for portfolio display
        setProfile(prev => ({ ...prev, imageUrl: URL.createObjectURL(file), preview: true }));
        return;
    }

    setIsProcessing(true);

    try {
        const blob = await removeBackground(file);
        const processedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".png", { type: 'image/png' });

        setForm(prev => ({ ...prev, imageUrl: processedFile }));
        setProfile(prev => ({ ...prev, imageUrl: URL.createObjectURL(processedFile), preview: true }));

    } catch (error) {
        console.error("Failed to remove background:", error);
        alert("Could not remove background. Please try another image.");
        setForm(prev => ({ ...prev, imageUrl: file }));
        setProfile(prev => ({ ...prev, imageUrl: URL.createObjectURL(file), preview: true }));
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
                    style={{ fontSize: getDynamicFontSize(profile.fullname) }}
                  >
                    {(profile.fullname || "Your Name").toUpperCase()}
                  </motion.div>
                  
                  <motion.div 
                    className="text-layer text-layer-shadow shadow-top" 
                    initial={{ opacity: 0, y: "-0.6em" }}
                    animate={{ opacity: 1, y: ["-0.6em", "-0.7em", "-0.6em"] }}
                    transition={shadowTransition}
                    style={{ fontSize: getDynamicFontSize(profile.fullname) }}
                  >
                    {(profile.fullname || "Your Name").toUpperCase()}
                  </motion.div>
                  
                  <motion.div 
                    className="text-layer text-layer-shadow shadow-bottom" 
                    initial={{ opacity: 0, y: "0.6em" }}
                    animate={{ opacity: 1, y: ["0.6em", "0.5em", "0.6em"] }}
                    transition={shadowTransition}
                    style={{ fontSize: getDynamicFontSize(profile.fullname) }}
                  >
                    {(profile.fullname || "Your Name").toUpperCase()}
                  </motion.div>
                  
                  <motion.div 
                    className="text-layer text-layer-shadow shadow-bottom-far"
                    initial={{ opacity: 0, y: "1.2em" }}
                    animate={{ opacity: 0.6, y: ["1.2em", "1.1em", "1.2em"] }}
                    transition={shadowTransition}
                    style={{ fontSize: getDynamicFontSize(profile.fullname) }}
                  >
                    {(profile.fullname || "Your Name").toUpperCase()}
                  </motion.div>

                  {/* Main Text Layer */}
                  <motion.div 
                    className="text-layer text-layer-main" 
                    variants={textContainerVariants} 
                    initial="hidden" 
                    animate="visible"
                    style={{ fontSize: getDynamicFontSize(profile.fullname) }}
                  >
                    {(profile.fullname || "Your Name").toUpperCase().split('').map((char, index) => (
                      <motion.span key={`main-${index}`} variants={letterVariants}>{char === ' ' ? '\u00A0' : char}</motion.span>
                    ))}
                  </motion.div>

                </div>
              </div>

              {/* Foreground Image: always in front of name */}
              {/* Each user's upload is unique and fetched by userId/profile.imageUrl */}
              <motion.img
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                src={getImageUrl(profile.imageUrl)}
                alt={profile.fullname}
                className="hero-profile-image"
                style={{
                  zIndex: 10, // Ensure image is always in front
                  position: 'relative',
                  width: 'auto',
                  height: 'clamp(700px, 75vh, 1050px)',
                  objectFit: 'contain',
                  pointerEvents: 'auto',
                }}
                onError={(e) => { e.target.src = "/images/profile-placeholder.png"; }}
                onLoad={() => {
                  console.log("Image loaded:", profile.imageUrl, getImageUrl(profile.imageUrl));
                }}
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
                {(!viewOnly && user && userId && user._id === userId) && (
                  <button
                    onClick={() => setEditing(true)}
                    className="edit-profile-button"
                  >
                    Edit Profile
                  </button>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {profile.githubUrl && (
                    <motion.a 
                      href={profile.githubUrl} 
                      target="_blank" rel="noopener noreferrer" 
                      aria-label="GitHub"
                      style={{ color: '#1e293b' }}
                      whileHover={{ scale: 1.2, rotate: -5, color: '#3b82f6' }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <FaGithub style={{ fontSize: '1.5rem' }} />
                    </motion.a>
                  )}
                  {profile.linkedinUrl && (
                    <motion.a 
                      href={profile.linkedinUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      aria-label="LinkedIn"
                      style={{ color: '#1e293b' }}
                      whileHover={{ scale: 1.2, rotate: 5, color: '#3b82f6' }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <FaLinkedin style={{ fontSize: '1.5rem' }} />
                    </motion.a>
                  )}

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
                {(profile.githubUrl || profile.linkedinUrl) && (
                  <p style={{ 
                    fontSize: '0.8rem', 
                    color: '#10b981', 
                    textAlign: 'center',
                    margin: '0 0 16px 0',
                    fontWeight: '500'
                  }}>
                    ✓ Social media links are configured
                  </p>
                )}
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
                    value={form.fullname} 
                    onChange={(e) => setForm({...form, fullname: e.target.value})} 
                    placeholder="Enter your full name"
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
                  {/* Image Preview */}
                  {form.imageUrl && (
                    <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                      <img
                        src={
                          form.imageUrl instanceof File
                            ? URL.createObjectURL(form.imageUrl)
                            : getImageUrl(form.imageUrl)
                        }
                        alt="Profile Preview"
                        style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: '50%' }}
                      />
                    </div>
                  )}
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
                <div className="form-group">
                  <label className="nav-label" style={{ 
                    fontSize: '0.9rem', 
                    fontWeight: '500', 
                    color: '#374151',
                    marginBottom: '6px',
                    display: 'block'
                  }}>
                    GitHub Profile URL
                  </label>
                  <input 
                    className="form-input" 
                    value={form.githubUrl} 
                    onChange={(e) => setForm({...form, githubUrl: e.target.value})} 
                    placeholder="yourusername or https://github.com/yourusername"
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
                  <p style={{ 
                    fontSize: '0.7rem', 
                    color: '#6b7280', 
                    marginTop: '4px',
                    fontStyle: 'italic'
                  }}>
                    You can enter just your username or the full URL
                  </p>
                  {form.githubUrl && (
                    <p style={{ 
                      fontSize: '0.7rem', 
                      color: '#10b981', 
                      marginTop: '4px',
                      fontWeight: '500'
                    }}>
                      ✓ Will be saved as: {formatSocialUrl(form.githubUrl, 'github')}
                    </p>
                  )}
                </div>
                <div className="form-group">
                  <label className="nav-label" style={{ 
                    fontSize: '0.9rem', 
                    fontWeight: '500', 
                    color: '#374151',
                    marginBottom: '6px',
                    display: 'block'
                  }}>
                    LinkedIn Profile URL
                  </label>
                  <input 
                    className="form-input" 
                    value={form.linkedinUrl} 
                    onChange={(e) => setForm({...form, linkedinUrl: e.target.value})} 
                    placeholder="yourusername or https://linkedin.com/in/yourusername"
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
                  <p style={{ 
                    fontSize: '0.7rem', 
                    color: '#6b7280', 
                    marginTop: '4px',
                    fontStyle: 'italic'
                  }}>
                    You can enter just your username or the full URL
                  </p>
                  {form.linkedinUrl && (
                    <p style={{ 
                      fontSize: '0.7rem', 
                      color: '#10b981', 
                      marginTop: '4px',
                      fontWeight: '500'
                    }}>
                      ✓ Will be saved as: {formatSocialUrl(form.linkedinUrl, 'linkedin')}
                    </p>
                  )}
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