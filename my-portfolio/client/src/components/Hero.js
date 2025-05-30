import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import axios from "axios";
import { Typewriter } from 'react-simple-typewriter';
import "./Hero.css";

// Animation variants
const containerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 1.5 },
  }
};

const letterVariants = {
  hidden: { opacity: 0, y: 20, rotate: 5 },
  visible: {
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: { type: "spring", damping: 12, stiffness: 100 },
  }
};

const textVariants = {
  hidden: { opacity: 0, y: -30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  }
};

const imageVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  }
};

const focusVariants = {
  hidden: { opacity: 0, filter: "blur(8px)", scale: 1.1 },
  visible: { 
    opacity: 1, 
    filter: "blur(0px)", 
    scale: 1,
    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] }
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
    <div className="tech-pill">
      <div className="pill-dot" />
      {editMode ? (
        <div className="tech-pill-edit">
          <input
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
            className="tech-pill-input"
            placeholder="Enter your tech stack"
          />
          <button onClick={handleSave} className="tech-pill-save">Save</button>
          <button onClick={() => setEditMode(false)} className="tech-pill-cancel">Cancel</button>
        </div>
      ) : (
        <div className="tech-pill-content">
          <span>
            <Typewriter
              words={[message || "Currently working with React & Next.js"]}
              loop={false}
              cursor
              typeSpeed={50}
              delaySpeed={1500}
            />
          </span>
          <button 
            onClick={() => setEditMode(true)} 
            className="tech-pill-edit-button"
            aria-label="Edit tech stack"
          >
            ✏️
          </button>
        </div>
      )}
    </div>
  );
};

const Hero = () => {
  const animatedName = "Welcome";
  const [profile, setProfile] = useState({ 
    name: "", 
    bio: "", 
    imageUrl: "",
    techStackMessage: ""
  });
  const [loading, setLoading] = useState(true);
  const [nameFinished, setNameFinished] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ 
    name: "", 
    bio: "", 
    imageUrl: "",
    techStackMessage: ""
  });

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("/api/user");
        setProfile({ 
          name: res.data.name || "",
          bio: res.data.bio || "",
          imageUrl: res.data.imageUrl || "",
          techStackMessage: res.data.techStackMessage || ""
        });
        setForm({
          name: res.data.name || "",
          bio: res.data.bio || "",
          imageUrl: res.data.imageUrl || "",
          techStackMessage: res.data.techStackMessage || ""
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // End name animation
  useEffect(() => {
    const t = setTimeout(() => setNameFinished(true), animatedName.length * 120 + 1200);
    return () => clearTimeout(t);
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

    // Set the file directly (won't show preview in form)
    setForm(prev => ({ ...prev, imageUrl: file }));
    
    // Create preview URL for hexagon display only
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
      <div className="hero-section loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <section className="hero-section" id="home">
      <div className="hero-container">
        {/* Left column: text + form */}
        <div className="text-container">
          <AnimatePresence>
            {!nameFinished ? (
              <motion.div
                className="animated-name-container"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {animatedName.split("").map((c,i) => (
                  <motion.span
                    key={i}
                    variants={letterVariants}
                    className={`animated-letter ${i===animatedName.length-1 ? 'last-letter-glow' : ''}`}
                    onMouseEnter={()=>setIsHovering(true)}
                    onMouseLeave={()=>setIsHovering(false)}
                  >
                    {c}
                  </motion.span>
                ))}
              </motion.div>
            ) : (
              <motion.h1
                className="name"
                variants={focusVariants}
                initial="hidden"
                animate="visible"
                onMouseEnter={()=>setIsHovering(true)}
                onMouseLeave={()=>setIsHovering(false)}
              >
                {profile.name.split(" ")[0]}{" "}
                <span className="highlight">
                  {profile.name.split(" ").slice(1).join(" ")}
                </span>
                {isHovering && (
                  <motion.span 
                    className="cursor"
                    initial={{opacity:0}}
                    animate={{opacity:1}}
                    transition={{repeat:Infinity,duration:0.8}}
                  >|</motion.span>
                )}
              </motion.h1>
            )}
          </AnimatePresence>

          <motion.p
            className="description"
            variants={textVariants}
            initial="hidden"
            animate="visible"
          >
            {profile.bio}
          </motion.p>

          <div className="hero-actions">
            <button
              className="secondary-button"
              onClick={()=>setEditing(!editing)}
            >
              {editing ? "Cancel" : "Edit Profile"}
            </button>

            <div className="social-links">
              <a
                href="https://github.com/RupakGunturu"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                <FaGithub />
              </a>
              <a
                href="https://linkedin.com/in/RupakGunturu"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <FaLinkedin />
              </a>
            </div>
          </div>

          <AnimatePresence>
            {editing && (
              <motion.form
                className="edit-form"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleSubmit}
              >
                <div className="form-group">
                  <label className="nav-label">Name</label>
                  <input
                    className="form-input"
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                    placeholder="Your name"
                  />
                </div>

                <div className="form-group">
                  <label className="nav-label">Bio</label>
                  <textarea
                    className="form-input"
                    value={form.bio}
                    onChange={(e) => setForm({...form, bio: e.target.value})}
                    placeholder="Your bio"
                    rows="4"
                  />
                </div>

                <div className="form-group">
                  <label className="nav-label">Profile Image</label>
                  <div className="file-upload-wrapper">
                    <label className="file-upload-button">
                      Choose New Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="file-input"
                      />
                    </label>
                    <span className="file-upload-hint">Current image will be replaced</span>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="primary-button">
                    Save Changes
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Right column: hexagon + profile image */}
        <motion.div
          className="image-container"
          variants={imageVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="hex-wrapper"
            animate={{ rotate:360 }}
            transition={{ duration:30, repeat:Infinity, ease:"linear" }}
          >
            <div className="hex-inner">
              <img
                src={profile.imageUrl || "/images/profile.jpg"}
                alt={profile.name || "Profile"}
                className="profile-image"
                onError={(e) => {
                  e.target.src = "/images/profile.jpg";
                }}
              />
            </div>
          </motion.div>

          <TechPill 
            techStackMessage={profile.techStackMessage} 
            onUpdate={handleTechStackUpdate}
          />
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;