import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import axios from "axios";

// Animated title settings
const animatedName = "Welcome";
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
    opacity: 1, filter: "blur(0px)", scale: 1,
    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] }
  },
};

const Hero = () => {
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

  if (loading) return <div style={styles.heroSection}>Loading…</div>;

  return (
    <section style={styles.heroSection} id="home">
      {/* Two-column layout */}
      <div style={styles.container}>
        {/* LEFT: text + form */}
        <div style={styles.textContainer}>
          {/* Animated name */}
          <AnimatePresence>
            {!nameFinished ? (
              <motion.div
                style={styles.animatedNameContainer}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {animatedName.split("").map((c,i) => (
                  <motion.span
                    key={i}
                    variants={letterVariants}
                    style={{
                      ...styles.animatedLetter,
                      ...(i===animatedName.length-1 ? styles.lastLetterGlow : {})
                    }}
                    onMouseEnter={()=>setIsHovering(true)}
                    onMouseLeave={()=>setIsHovering(false)}
                  >
                    {c}
                  </motion.span>
                ))}
              </motion.div>
            ) : (
              <motion.h1
                style={styles.name}
                variants={focusVariants}
                initial="hidden"
                animate="visible"
                onMouseEnter={()=>setIsHovering(true)}
                onMouseLeave={()=>setIsHovering(false)}
              >
                {profile.name.split(" ")[0]}{" "}
                <span style={styles.highlight}>
                  {profile.name.split(" ").slice(1).join(" ")}
                </span>
                {isHovering && (
                  <motion.span 
                    style={styles.cursor}
                    initial={{opacity:0}}
                    animate={{opacity:1}}
                    transition={{repeat:Infinity,duration:0.8}}
                  >|</motion.span>
                )}
              </motion.h1>
            )}
          </AnimatePresence>

          <motion.p
            style={styles.description}
            variants={textVariants}
            initial="hidden"
            animate="visible"
          >
            {profile.bio}
          </motion.p>

          <button
            style={styles.secondaryButton}
            onClick={()=>setEditing(e=>!e)}
          >
            {editing ? "Cancel" : "Edit Profile"}
          </button>

          <AnimatePresence>
  {editing && (
    <motion.form
      style={{ ...styles.textContainer, marginTop: 20 }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      onSubmit={handleSubmit}
    >
      <label style={styles.navLabel}>Name</label>
      <input
        style={{
          ...styles.input,
          padding: '12px 16px',
          width: '100%',
          boxSizing: 'border-box', // Prevent overflow
        }}
        value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
      />

      <label style={styles.navLabel}>Bio</label>
      <textarea
        style={{
          ...styles.input,
          padding: '12px 16px',
          width: '100%',
          boxSizing: 'border-box', // Prevent overflow
        }}
        value={form.bio}
        onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
      />

      <label style={styles.navLabel}>Image URL</label>
      <input
        style={{
          ...styles.input,
          padding: '12px 16px',
          width: '100%',
          boxSizing: 'border-box', // Prevent overflow
        }}
        placeholder="https://..."
        value={form.imageUrl}
        onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
      />

      <label style={styles.navLabel}>Upload Image</label>
      <input
        type="file"
        accept="image/*"
        style={{
          ...styles.input,
          padding: '12px 16px',
          width: '100%',
          boxSizing: 'border-box',
        }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            // Handle image upload logic here, e.g., preview image or upload to server
            setForm((f) => ({ ...f, imageUrl: URL.createObjectURL(file) }));
          }
        }}
      />

      <button type="submit" style={styles.primaryButton}>Save</button>
    </motion.form>
    
  )}
</AnimatePresence>
<div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-start', gap: 20 }}>
  <a
    href="https://github.com/your-username"
    target="_blank"
    rel="noopener noreferrer"
    style={{ fontSize: 24, color: "#FFFFFF" }}
  >
    <FaGithub />
  </a>
  <a
    href="https://linkedin.com/in/your-profile"
    target="_blank"
    rel="noopener noreferrer"
    style={{ fontSize: 24, color: "#FFFFFF" }}
  >
    <FaLinkedin />
  </a>
</div>

        </div>

        {/* RIGHT: hexagon + profile image */}
        <motion.div
          style={styles.imageContainer}
          variants={imageVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            style={styles.hexWrapper}
            animate={{ rotate:360 }}
            transition={{ duration:30, repeat:Infinity, ease:"linear" }}
          >
            <div style={styles.hexInner}>
              <img
                src={profile.imageUrl || "/images/profile.jpg"}
                alt="Profile"
                style={styles.profileImage}
              />
            </div>
          </motion.div>

          <motion.div
            style={styles.techPill}
            initial={{ opacity:0, y:20 }}
            animate={{ opacity:1, y:0 }}
            transition={{ delay:1.4 }}
          >
            <div style={styles.pillDot} />
            <span>Currently working with React & Next.js</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};


export default Hero;

// STYLES
const styles = {
  heroSection: {
    position: "relative",
    width: "100%",
    minHeight: "100vh",
    background: "radial-gradient(circle at 10% 20%, #0f172a 0%, #0a0e17 100%)",
    color: "#fff",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    overflow: "hidden",
    padding: "0 5%",
  },
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "32px 0",
    maxWidth: "1400px",
    margin: "0 auto",
  },
  logo: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#e2e8f0",
    letterSpacing: "-0.5px",
  },
  logoHighlight: {
    color: "#00bfff",
  },
  navLinks: {
    display: "flex",
    listStyle: "none",
    gap: "2rem",
    alignItems: "center",
  },
  navLink: {
    textDecoration: "none",
    color: "#94a3b8",
    fontSize: "0.95rem",
    fontWeight: "500",
    transition: "color 0.3s",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    ":hover": {
      color: "#00bfff",
    },
  },
  navNumber: {
    color: "#00bfff",
    fontSize: "0.8rem",
  },
  resumeButton: {
    padding: "10px 18px",
    fontSize: "0.95rem",
    fontWeight: "500",
    backgroundColor: "transparent",
    border: "1px solid #00bfff",
    borderRadius: "4px",
    color: "#00bfff",
    cursor: "pointer",
    transition: "all 0.3s",
    marginLeft: "1rem",
    ":hover": {
      backgroundColor: "rgba(0, 191, 255, 0.1)",
    },
  },
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "80px 0",
    flexWrap: "wrap",
  },
  textContainer: {
    maxWidth: "600px",
    marginTop: "20px",
  },
  greeting: {
    fontSize: "1.1rem",
    color: "#00bfff",
    marginBottom: "16px",
    fontWeight: "500",
  },
  name: {
    fontSize: "clamp(2.5rem, 8vw, 4.5rem)",
    margin: 0,
    lineHeight: "1.1",
    marginBottom: "16px",
    fontWeight: "700",
    letterSpacing: "-1px",
    position: "relative",
    display: "inline-block",
  },
  cursor: {
    color: "#00bfff",
    marginLeft: "4px",
  },
  highlight: {
    color: "#00bfff",
    position: "relative",
    display: "inline-block",
  },
  role: {
    fontSize: "clamp(1rem, 4vw, 1.5rem)",
    margin: "0",
    marginBottom: "24px",
    color: "#94a3b8",
    fontWeight: "500",
    lineHeight: "1.4",
  },
  description: {
    fontSize: "1.1rem",
    lineHeight: "1.7",
    color: "#94a3b8",
    marginBottom: "40px",
    maxWidth: "520px",
  },
  buttonGroup: {
    display: "flex",
    gap: "1.5rem",
    alignItems: "center",
  },
  primaryButton: {
    padding: "14px 28px",
    fontSize: "1rem",
    fontWeight: "500",
    backgroundColor: "#00bfff",
    border: "none",
    borderRadius: "4px",
    color: "#0f172a",
    cursor: "pointer",
    transition: "all 0.3s",
    textDecoration: "none",
    display: "inline-block",
  },
  secondaryButton: {
    padding: "14px 28px",
    fontSize: "1rem",
    fontWeight: "500",
    backgroundColor: "transparent",
    border: "1px solid #00bfff",
    borderRadius: "4px",
    color: "#00bfff",
    cursor: "pointer",
    transition: "all 0.3s",
    textDecoration: "none",
    display: "inline-block",
  },
  imageContainer: {
    position: "relative",
    width: "clamp(300px, 40vw, 500px)",
    height: "clamp(300px, 40vw, 500px)",
  },
  hexWrapper: {
    position: "relative",
    width: "100%",
    height: "100%",
    background: "linear-gradient(135deg, rgba(0, 191, 255, 0.2) 0%, rgba(0, 191, 255, 0.4) 100%)",
    clipPath: "polygon(50% 0%, 90% 25%, 90% 75%, 50% 100%, 10% 75%, 10% 25%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 0 40px rgba(0, 191, 255, 0.2)",
  },
  hexInner: {
    width: "92%",
    height: "92%",
    clipPath: "polygon(50% 0%, 90% 25%, 90% 75%, 50% 100%, 10% 75%, 10% 25%)",
    background: "#0f172a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    filter: "grayscale(20%) contrast(110%)",
  },
  techPill: {
    position: "absolute",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    backdropFilter: "blur(4px)",
    padding: "10px 16px",
    borderRadius: "24px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    border: "1px solid rgba(0, 191, 255, 0.2)",
    fontSize: "0.9rem",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  },
  pillDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#00bfff",
    animation: "pulse 1.5s infinite",
  },
  editCard: {
    background: "#1e293b", // dark background
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    marginTop: "24px",
    maxWidth: "500px",
  },
  editCard: {
    background: "#1e293b", // dark slate color
    padding: "24px",
    borderRadius: "16px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    marginTop: "30px",
    maxWidth: "500px",
    width: "100%",
    alignSelf: "center",
  },
  
  formTitle: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#e2e8f0",
    textAlign: "center",
    marginBottom: "10px",
  },
  
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  
  input: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid #334155",
    background: "#0f172a",
    color: "#e2e8f0",
    fontSize: "1rem",
    outline: "none",
  },
  
  textarea: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid #334155",
    background: "#0f172a",
    color: "#e2e8f0",
    fontSize: "1rem",
    minHeight: "100px",
    resize: "vertical",
    outline: "none",
  },
  
  navLabel: {
    fontSize: "0.9rem",
    color: "#94a3b8",
    fontWeight: "500",
  },
  
  primaryButton: {
    background: "#3b82f6", // blue
    color: "white",
    padding: "12px",
    borderRadius: "10px",
    fontWeight: "bold",
    fontSize: "1rem",
    border: "none",
    cursor: "pointer",
    transition: "background 0.3s",
  },
  
  // Animation specific
  animatedNameContainer: {
    display: "flex",
    fontSize: "clamp(2.5rem, 8vw, 4.5rem)",
    marginBottom: "16px",
    fontWeight: "700",
    letterSpacing: "-1px",
  },
  animatedLetter: {
    color: "#e2e8f0",
    position: "relative",
    display: "inline-block",
  },
  lastLetterGlow: {
    color: "#00bfff",
  },
};

