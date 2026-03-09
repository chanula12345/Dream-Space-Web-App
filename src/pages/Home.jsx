import React, { useEffect, useState } from "react";
import "../styles/Home.css";
import heroimg from "../assets/heroimg.svg";
import can1 from "../assets/can1.svg";
import can2 from "../assets/can2.svg";
import can3 from "../assets/can3.svg";
import img3 from "../assets/img3.svg";
import { useNavigate, Link } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsub();
  }, []);

  const handleAuth = async () => {
    if (user) {
      try {
        await signOut(auth);
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
      } catch (error) {
        console.error("Logout failed:", error);
      }
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="home-page">
      <nav className="home-navbar">
        <div className="home-navbar-inner">
          <h5 className="brand-name">Dream Space</h5>

          <div className="home-nav-links">
            <Link to="/" className="home-nav-link">
              Home
            </Link>
            <Link to="/dashboard" className="home-nav-link">
              Dashboard
            </Link>
            <Link to="/explore" className="home-nav-link">
              Explore
            </Link>
            <Link to="/about" className="home-nav-link">
              About
            </Link>

            <button className="home-auth-btn" onClick={handleAuth}>
              {user ? "Log Out" : "Log In"}
            </button>
          </div>
        </div>
      </nav>

      <header
        className="hero-section"
        style={{ backgroundImage: `url(${heroimg})` }}
      >
        <div className="hero-overlay">
          <div className="hero-content">
            <span className="hero-badge">Smart Furniture Design Studio</span>
            <h1>
              Design Your
              <br />
              Dream Space
            </h1>
            <p>
              Build room layouts, customize furniture, preview in 3D, and save
              your concepts in one modern design workspace.
            </p>

            <div className="hero-actions">
              <button
                className="hero-btn primary"
                onClick={() => navigate("/create-design")}
              >
                Start 2D Design
              </button>
              <button
                className="hero-btn secondary"
                onClick={() => navigate("/design3d")}
              >
                Open 3D View
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className="home-section">
        <div className="section-header center">
          <span className="section-tag">Features</span>
          <h2>What You Can Do</h2>
          <p>
            Everything needed for designers to build and present room furniture
            concepts professionally.
          </p>
        </div>

        <div className="feature-grid">
          <div className="feature-card">
            <img src={can1} alt="Design Freely" />
            <h5>Design Freely</h5>
            <p>
              Create and customize room layouts with interactive furniture
              placement and editing tools.
            </p>
          </div>

          <div className="feature-card">
            <img src={can2} alt="Preview in 3D" />
            <h5>Preview in 3D</h5>
            <p>
              Visualize the final room in a 3D view to better understand scale,
              position, and appearance.
            </p>
          </div>

          <div className="feature-card">
            <img src={can3} alt="Share or Export" />
            <h5>Share or Export</h5>
            <p>
              Save your work, manage design versions, and export layouts for
              presentation or discussion.
            </p>
          </div>
        </div>
      </section>

      <section className="home-section light-section">
        <div className="section-header center">
          <span className="section-tag">Process</span>
          <h2>How It Works</h2>
        </div>

        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">01</div>
            <h4>Login</h4>
            <p>Create your designer account and access your workspace.</p>
          </div>

          <div className="step-card">
            <div className="step-number">02</div>
            <h4>Choose Design Mode</h4>
            <p>Start with a 2D room layout and prepare your design structure.</p>
          </div>

          <div className="step-card">
            <div className="step-number">03</div>
            <h4>Add Furniture</h4>
            <p>Select furniture items and arrange them based on the room plan.</p>
          </div>

          <div className="step-card">
            <div className="step-number">04</div>
            <h4>Preview and Save</h4>
            <p>Check the design in 3D, refine details, then save the result.</p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-box">
          <div className="cta-text">
            <span className="section-tag">Start Now</span>
            <h2>Ready to Start Designing?</h2>
            <p>
              Jump into the editor and build room concepts that fit perfectly
              with size, shape, and furniture style.
            </p>
            <button
              className="hero-btn primary"
              onClick={() => navigate("/dashboard")}
            >
              Go to Dashboard
            </button>
          </div>

          <div className="cta-image">
            <img src={img3} alt="Furniture Design Preview" />
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <div className="home-footer-inner">
          <div>
            <h4>Dream Space</h4>
            <p>Room planning and furniture visualization platform.</p>
          </div>

          <div className="footer-links">
            <Link to="/about">About</Link>
            <Link to="/explore">Explore</Link>
            <Link to="/login">Login</Link>
          </div>
        </div>

        <p className="footer-copy">
          &copy; {new Date().getFullYear()} Dream Space. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Home;