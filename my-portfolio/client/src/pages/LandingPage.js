import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";
import API_BASE_URL from "../utils/api";

const LandingPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [navVisible, setNavVisible] = useState(true);
  const observerRef = useRef(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastScrollY.current && currentY > 60) {
        setNavVisible(false);
      } else {
        setNavVisible(true);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("lp-visible");
            observerRef.current.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -50px 0px" }
    );
    document
      .querySelectorAll(".lp-reveal, .lp-reveal-up, .lp-stagger")
      .forEach((el) => observerRef.current.observe(el));
    return () => observerRef.current && observerRef.current.disconnect();
  }, []);

  const handleFindPortfolio = async () => {
    if (!username.trim()) return;
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/users/username/${username.trim()}`
      );
      if (!res.ok) throw new Error("User not found");
      const data = await res.json();
      navigate(`/portfolio/${data.user.username}?viewOnly=true`);
    } catch {
      alert("User not found!");
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") handleFindPortfolio();
  };

  return (
    <div className="lp-root">

      {/* ── NAV ── */}
      <nav className={`lp-nav${navVisible ? "" : " lp-nav-hidden"}`}>
        <div className="lp-nav-inner">
          <span className="lp-logo">
            <span className="lp-logo-icon">
              <img src={process.env.PUBLIC_URL + "/logo192.png"} alt="DevDesk" />
            </span>
            DevDesk
          </span>
          <div className="lp-nav-actions">
            <button className="lp-nav-login" onClick={() => navigate("/login")}>
              Log in
            </button>
            <button className="lp-nav-cta" onClick={() => navigate("/register")}>
              Get started free
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="lp-hero">
        <div className="lp-hero-content">


          <h1 className="lp-hero-h1">
            Your portfolio.<br />
            Your <span className="lp-italic">first impression.</span>
          </h1>

          <p className="lp-hero-sub">
            No need to build from scratch — your portfolio is already ready.
            Fill in your details, pick a theme, and share your link.
          </p>

          <div className="lp-hero-actions">
            <button className="lp-btn-primary" onClick={() => navigate("/register")}>
              Build yours for free
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
            <button className="lp-btn-ghost" onClick={() => navigate("/login")}>
              Have an account? Log in
            </button>
          </div>

          <div className="lp-hero-social-proof">
            <div className="lp-avatar-stack">
            </div>
          </div>
        </div>

        {/* ── PORTFOLIO PREVIEW CARD ── */}
        <div className="lp-hero-visual lp-reveal">
          <div className="lp-preview-browser">
            <div className="lp-browser-bar">
              <div className="lp-browser-dots">
                <span style={{ background: "#FF5F57" }} />
                <span style={{ background: "#FEBC2E" }} />
                <span style={{ background: "#28C840" }} />
              </div>
              <div className="lp-browser-url">devdesk.app/u/yourname</div>
            </div>
            <div className="lp-browser-body">
              {/* Portfolio preview content */}
              <div className="lp-prev-header">
                <div className="lp-prev-avatar">AK</div>
                <div>
                  <div className="lp-prev-name">Arjun Kumar</div>
                  <div className="lp-prev-role">Full-Stack Developer · Hyderabad</div>
                  <div className="lp-prev-tags">
                    <span>React</span><span>Node.js</span><span>MongoDB</span>
                  </div>
                </div>
              </div>
              <div className="lp-prev-divider" />
              <div className="lp-prev-skills-label">Skills</div>
              <div className="lp-prev-skills">
                {[
                  { name: "React", pct: 92, color: "#2563EB" },
                  { name: "TypeScript", pct: 78, color: "#0891B2" },
                  { name: "Node.js", pct: 85, color: "#059669" },
                ].map(({ name, pct, color }) => (
                  <div className="lp-prev-skill-row" key={name}>
                    <div className="lp-prev-skill-info">
                      <span>{name}</span>
                      <span style={{ color }}>{pct}%</span>
                    </div>
                    <div className="lp-prev-track">
                      <div className="lp-prev-fill" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="lp-prev-projects-label">Featured Projects</div>
              <div className="lp-prev-projects">
                {[
                  { name: "GKM Inventory", tag: "React · MongoDB", color: "#EFF6FF", tc: "#2563EB" },
                  { name: "DevDesk Portfolio", tag: "Full-Stack", color: "#F0FDF4", tc: "#059669" },
                ].map(({ name, tag, color, tc }) => (
                  <div className="lp-prev-proj" key={name} style={{ background: color }}>
                    <div className="lp-prev-proj-name">{name}</div>
                    <div className="lp-prev-proj-tag" style={{ color: tc }}>{tag}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Floating badges */}
          <div className="lp-float-badge lp-float-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#059669" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>
            Profile live!
          </div>
          <div className="lp-float-badge lp-float-2">
            🎯 Recruiter viewed your profile
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="lp-features" id="features">
        <div className="lp-section-inner">
          <div className="lp-section-header lp-reveal">
            <div className="lp-eyebrow">Everything you need</div>
            <h2>
              A portfolio that works<br />
              <span className="lp-h2-accent">as hard as you do</span>
            </h2>
            <p className="lp-section-sub">
              Every tool a student needs to build a credible online presence — completely free.
            </p>
          </div>

          <div className="lp-feat-grid lp-stagger">
            {/* Card 1 — wide */}
            <div className="lp-fc lp-fc-wide lp-fc-blue">
              <div className="lp-fc-num">01</div>
              <div className="lp-fc-content">
                <div className="lp-fc-icon">🎨</div>
                <h3>Fully Customizable Themes</h3>
                <p>Choose colors, layout, and typography. Your portfolio looks like you — not a template everyone else is using.</p>
              </div>
              <div className="lp-theme-palette">
                {["#2563EB", "#0891B2", "#7C3AED", "#059669", "#DC2626", "#D97706"].map((c) => (
                  <div key={c} className="lp-pal-dot" style={{ background: c }} />
                ))}
              </div>
            </div>

            {/* Card 2 */}
            <div className="lp-fc lp-fc-sky">
              <div className="lp-fc-num">02</div>
              <div className="lp-fc-icon">⚡</div>
              <h3>Visual Skill Bars</h3>
              <p>Show expertise levels clearly — far more convincing than listing "familiar with React."</p>
              <div className="lp-mini-bars">
                {[
                  { n: "React", v: 90, c: "#2563EB" },
                  { n: "Node.js", v: 75, c: "#0891B2" },
                  { n: "Python", v: 60, c: "#7C3AED" },
                ].map(({ n, v, c }) => (
                  <div className="lp-mbar-row" key={n}>
                    <span>{n}</span>
                    <div className="lp-mbar-track">
                      <div className="lp-mbar-fill" style={{ width: `${v}%`, background: c }} />
                    </div>
                    <span style={{ color: c, fontWeight: 700 }}>{v}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 3 */}
            <div className="lp-fc lp-fc-green">
              <div className="lp-fc-num">03</div>
              <div className="lp-fc-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
              </div>
              <h3>Certificate Gallery</h3>
              <p>Upload and showcase all your certifications. Real credentials that add instant credibility.</p>
              <div className="lp-cert-list">
                {["AWS Certified", "Meta Front-End", "Google Analytics"].map((c) => (
                  <div className="lp-cert-chip" key={c}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="#059669" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>
                    {c}
                  </div>
                ))}
              </div>
            </div>

            {/* Card 4 — wide */}
            <div className="lp-fc lp-fc-wide lp-fc-orange">
              <div className="lp-fc-num">04</div>
              <div className="lp-fc-content">
                <div className="lp-fc-icon">🔗</div>
                <h3 style={{ color: "var(--blue)" }}>One Shareable Link</h3>
                <p>Drop it on resumes, LinkedIn, or cold emails. Always live, always up to date.</p>
              </div>
              <div className="lp-link-pill">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                  <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                </svg>
                devdesk.app/u/<strong>yourname</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="lp-how">
        <div className="lp-section-inner">
          <div className="lp-section-header lp-reveal">
            <div className="lp-eyebrow">How it works</div>
            <h2>
              Ready in under<br />
              <span className="lp-h2-accent">five minutes</span>
            </h2>
          </div>

          <div className="lp-steps lp-stagger">
            {[
              { n: "1", title: "Pick a theme", desc: "Choose from curated color schemes and layouts that match your personality — no design skills needed.", color: "#2563EB" },
              { n: "2", title: "Fill your details", desc: "Add projects, skills, certifications, and your story through a simple guided dashboard.", color: "#0891B2" },
              { n: "3", title: "Share your link", desc: "Drop devdesk.app/u/you on resumes, LinkedIn, or cold emails. Always live, always current.", color: "#7C3AED" },
              { n: "4", title: "Make an impression", desc: "Recruiters see a polished portfolio that proves what you can do — before the interview even starts.", color: "#059669" },
            ].map(({ n, title, desc, color }) => (
              <div className="lp-step" key={n}>
                <div className="lp-step-num" style={{ color, borderColor: color }}>{n}</div>
                <div className="lp-step-connector" />
                <div className="lp-step-body">
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FIND PORTFOLIO ── */}
      <section className="lp-find">
        <div className="lp-section-inner">
          <div className="lp-find-card lp-reveal">
            <div className="lp-find-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <h2>See a live portfolio</h2>
            <p>Enter any DevDesk username to explore how students present their projects, skills, and experience.</p>
            <div className="lp-search-row">
              <div className="lp-search-input-wrap">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Enter a username…"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  aria-label="Search portfolio by username"
                />
              </div>
              <button className="lp-btn-primary" onClick={handleFindPortfolio}>
                Find Portfolio
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;