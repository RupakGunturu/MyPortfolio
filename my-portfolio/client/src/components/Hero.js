import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import axios from "axios";
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
  },
};

const letterVariants = {
  hidden: { opacity: 0, y: 20, rotate: 5 },
  visible: {
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: { type: "spring", damping: 12, stiffness: 100 },
  },
};

const textVariants = {
  hidden: { opacity: 0, y: -30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  },
};

const imageVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  },
};

const focusVariants = {
  hidden: { opacity: 0, filter: "blur(8px)", scale: 1.1 },
  visible: { 
    opacity: 1, 
    filter: "blur(0px)", 
    scale: 1,
    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] }
  },
};

const Hero = () => {
  const animatedName = "Welcome";
  const [profile, setProfile] = useState({ name: "", bio: "", imageUrl: "" });
  const [loading, setLoading] = useState(true);
  const [nameFinished, setNameFinished] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", bio: "", imageUrl: "" });

  // Fetch profile
  useEffect(() => {
    axios.get("/api/user")
      .then(res => {
        setProfile({ ...res.data, imageUrl: res.data.imageUrl || "" });
        setForm({ ...res.data, imageUrl: res.data.imageUrl || "" });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // End name animation
  useEffect(() => {
    const t = setTimeout(() => setNameFinished(true), animatedName.length * 120 + 1200);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.put("/api/user", form);
      setProfile(res.data);
      setEditing(false);
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

   const handleImageUpload = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    // Create form data
    const formData = new FormData();
    formData.append('image', file);
    formData.append('name', form.name);
    formData.append('bio', form.bio);

    // Create preview URL for immediate display
    const previewUrl = URL.createObjectURL(file);
    setForm(f => ({ ...f, imageUrl: previewUrl }));

    // Upload to server
    const response = await axios.put('/api/user', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    // Update with server response
    setProfile(response.data);
    setForm(response.data);
  } catch (error) {
    console.error('Upload failed:', error);
    alert('Image upload failed. Please try again.');
    // Revert to previous image if available
    setForm(f => ({ ...f, imageUrl: profile.imageUrl }));
  }
};


  if (loading) return <div className="hero-section">Loading…</div>;

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

          <button
            className="secondary-button"
            onClick={()=>setEditing(e=>!e)}
          >
            {editing ? "Cancel" : "Edit Profile"}
          </button>

          <AnimatePresence>
            {editing && (
              <motion.form
                className="edit-form"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                onSubmit={handleSubmit}
              >
                <label className="nav-label">Name</label>
                <input
                  className="form-input"
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                />

                <label className="nav-label">Bio</label>
                <textarea
                  className="form-input"
                  value={form.bio}
                  onChange={(e) => setForm(f => ({ ...f, bio: e.target.value }))}
                />

                <label className="nav-label">Image URL</label>
                <input
                  className="form-input"
                  placeholder="https://..."
                  value={form.imageUrl}
                  onChange={(e) => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                />

                <label className="nav-label">Upload Image</label>
               <input
  type="file"
  accept="image/*"
  style={{
    padding: '12px 16px',
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid #ccc',
    borderRadius: '8px',
    backgroundColor: '#fff',
    fontSize: '16px',
    cursor: 'pointer',
    outline: 'none',
    transition: 'border-color 0.3s ease',
  }}
  onChange={handleImageUpload}
/>


                <button type="submit" className="primary-button">Save</button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="social-links">
            <a
              href="https://github.com/your-username"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaGithub />
            </a>
            <a
              href="https://linkedin.com/in/your-profile"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaLinkedin />
            </a>
          </div>
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
                alt="Profile"
                className="profile-image"
              />
            </div>
          </motion.div>

          <motion.div
            className="tech-pill"
            initial={{ opacity:0, y:20 }}
            animate={{ opacity:1, y:0 }}
            transition={{ delay:1.4 }}
          >
            <div className="pill-dot" />
            <span>Currently working with React & Next.js</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;