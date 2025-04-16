import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Animated title settings
const animatedName = "Mortal Prime";
const containerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 1.5 },
  },
};
const letterVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 12,
      stiffness: 100,
    },
  },
};

const textVariants = {
  hidden: { opacity: 0, y: -30 },
  visible: { opacity: 1, y: 0 },
};

const imageVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

// "In and Out of Focus" text effect
const focusVariants = {
  hidden: {
    opacity: 0,
    filter: "blur(10px)",
    scale: 1.2,
  },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    scale: 1,
    transition: {
      duration: 1.5,
      ease: "easeOut",
    },
  },
};

const Hero = () => {
  const [nameFinished, setNameFinished] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setNameFinished(true), animatedName.length * 150 + 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section style={styles.heroSection} id="home">
      {/* Navigation Bar */}
      <nav style={styles.navbar}>
        <div style={styles.logo}>Portfolio.</div>
        <ul style={styles.navLinks}>
          <li><a href="#home" style={styles.navLink}>Home</a></li>
          <li><a href="#about" style={styles.navLink}>About</a></li>
          <li><a href="#projects" style={styles.navLink}>Projects</a></li>
          <li><a href="#contact" style={styles.navLink}>Contact</a></li>
        </ul>
      </nav>

      {/* Main Container */}
      <div style={styles.container}>
        {/* Left Text Side */}
        <motion.div
          style={styles.textContainer}
          variants={textVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <p style={styles.greeting}>Hello, it's me</p>

          {/* Animated Name */}
          <AnimatePresence>
            {!nameFinished && (
              <motion.div
                style={styles.animatedNameContainer}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {animatedName.split("").map((char, i) => (
                  <motion.span
                    key={i}
                    variants={letterVariants}
                    style={{
                      ...styles.animatedLetter,
                      ...(i === animatedName.length - 1
                        ? styles.lastLetterGlow
                        : {}),
                    }}
                  >
                    {char}
                  </motion.span>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Static fallback after animation ends */}
          {nameFinished && (
            <motion.h1
              style={styles.name}
              variants={focusVariants}
              initial="hidden"
              animate="visible"
            >
              Mortal <span style={styles.highlight}>Prime</span>
            </motion.h1>
          )}

          <h3 style={styles.role}>
            I'm a <span style={styles.highlight}>Frontend Developer</span>
          </h3>
          <p style={styles.description}>
            I design modern, responsive websites with a passion for clean UI and smooth animations.
          </p>
          <div style={styles.buttonGroup}>
            <button style={styles.primaryButton}>Download CV</button>
            <button style={styles.secondaryButton}>Contact Me</button>
          </div>
        </motion.div>

        {/* Right Image Side */}
        <motion.div
          style={styles.imageContainer}
          variants={imageVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div style={styles.hexWrapper}>
            <img
              src="/images/profile.jpg"
              alt="Profile"
              style={styles.profileImage}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};
  
export default Hero;

// STYLES
const styles: any = {
  heroSection: {
    position: "relative",
    width: "100%",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a 0%, #131418 100%)",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    color: "#fff",
    fontFamily: "Poppins, sans-serif",
    overflow: "hidden",
  },
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 5%",
    backgroundColor: "transparent",
  },
  logo: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#00ffff",
  },
  navLinks: {
    display: "flex",
    listStyle: "none",
    gap: "1.5rem",
  },
  navLink: {
    textDecoration: "none",
    color: "#fff",
    fontSize: "1rem",
    transition: "color 0.3s",
  },
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 5%",
    marginTop: "60px",
    flexWrap: "wrap",
  },
  textContainer: {
    maxWidth: "550px",
    marginTop: "50px",
  },
  greeting: {
    fontSize: "1.2rem",
    color: "#777",
    marginBottom: "5px",
  },
  name: {
    fontSize: "3rem",
    margin: 0,
    lineHeight: "1.2",
    marginBottom: "10px",
  },
  highlight: {
    color: "#00bfff",
  },
  role: {
    fontSize: "1.5rem",
    margin: "0",
    marginBottom: "20px",
    color: "#aaa",
  },
  description: {
    fontSize: "1rem",
    lineHeight: "1.7",
    color: "#bbb",
    marginBottom: "30px",
  },
  buttonGroup: {
    display: "flex",
    gap: "1rem",
  },
  primaryButton: {
    padding: "12px 25px",
    fontSize: "1rem",
    backgroundColor: "#00bfff",
    border: "none",
    borderRadius: "30px",
    color: "#fff",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  secondaryButton: {
    padding: "12px 25px",
    fontSize: "1rem",
    backgroundColor: "transparent",
    border: "2px solid #00bfff",
    borderRadius: "30px",
    color: "#00bfff",
    cursor: "pointer",
    transition: "background-color 0.3s, color 0.3s",
  },
  imageContainer: {
    position: "relative",
    width: "400px",
    height: "400px",
    marginTop: "50px",
  },
  hexWrapper: {
    position: "absolute",
    width: "100%",
    height: "100%",
    background: "linear-gradient(135deg, #0ff 0%, #00bfff 100%)",
    clipPath:
      "polygon(50% 0%, 90% 25%, 90% 75%, 50% 100%, 10% 75%, 10% 25%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 0 20px #00bfff, 0 0 60px rgba(0,191,255,0.5)",
    transition: "transform 0.3s ease",
    animation: "rotate 20s linear infinite",
    transform: "scale(1.2)",
  },
  profileImage: {
    width: "85%",
    height: "85%",
    borderRadius: "50%",
    objectFit: "cover",
    boxShadow: "0 0 15px rgba(0,0,0,0.3)",
  },

  // Animation specific
  animatedNameContainer: {
    display: "flex",
    fontSize: "3rem",
    marginBottom: "10px",
    fontWeight: "bold",
  },
  animatedLetter: {
    color: "#fff",
    marginRight: "2px",
  },
  lastLetterGlow: {
    color: "#00bfff",
    transition: "filter 0.3s ease",
    cursor: "pointer",
    ":hover": {
      filter: "drop-shadow(0 0 10px #00bfff)",
    },
  },
};
