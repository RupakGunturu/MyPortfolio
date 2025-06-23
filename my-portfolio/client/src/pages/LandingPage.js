import React from 'react';
import { Sparkles } from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => (
  <div className="landing-root">
    <h1 className="landing-title text-gradient">Digital Identity</h1>
    <h2 className="landing-subtitle">Canvas</h2>
    <div className="landing-badge">
      <Sparkles className="badge-icon" />
      <span>Professional Portfolio Builder</span>
    </div>
    <p className="landing-desc">
      Create a stunning portfolio that showcases your professional identity with elegant design, smooth animations, and powerful customization features.
    </p>
    <div className="landing-actions">
      <button className="btn-gradient">Get Started Free</button>
      <button className="btn-outline">View Demo</button>
    </div>
  </div>
);

export default LandingPage;