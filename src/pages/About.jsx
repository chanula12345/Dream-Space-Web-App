import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/About.css";

const About = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: "2D Room Planning",
      text: "Create room layouts based on size, shape, and furniture positioning with an easy-to-use design workspace.",
    },
    {
      title: "3D Visualization",
      text: "Preview room concepts in 3D so designers and customers can better understand scale, appearance, and placement.",
    },
    {
      title: "Furniture Customization",
      text: "Adjust colours, sizes, and styles of furniture to match the room theme and customer preferences.",
    },
    {
      title: "Design Management",
      text: "Save, edit, manage, and revisit furniture designs from a personal dashboard built for designers.",
    },
  ];

  const steps = [
    "Designers log in securely to access their workspace.",
    "Room size, shape, and colour scheme are configured.",
    "Furniture is arranged in 2D for layout planning.",
    "The room is previewed in 3D for final visualization.",
    "Designs can be saved, edited, and presented to customers.",
  ];

  return (
    <div className="about-page">
      <nav className="about-navbar">
        <div className="about-navbar-inner">
          <h5 className="about-brand">Dream Space</h5>

          <div className="about-nav-links">
            <Link to="/">Home</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/explore">Explore</Link>
            <Link to="/about" className="active">
              About
            </Link>
          </div>
        </div>
      </nav>

      <section className="about-hero">
        <div className="about-hero-inner">
          <span className="about-tag">About the Project</span>
          <h1>Furniture Design and Room Visualization Platform</h1>
          <p>
            Dream Space is a smart design system built to help furniture
            designers create room-based furniture layouts for customers. It
            supports room customization, furniture arrangement, and visual
            previews in both 2D and 3D.
          </p>

          <div className="about-hero-actions">
            <button onClick={() => navigate("/create-design")}>
              Start Designing
            </button>
            <button
              className="secondary"
              onClick={() => navigate("/dashboard")}
            >
              Open Dashboard
            </button>
          </div>
        </div>
      </section>

      <section className="about-section">
        <div className="about-section-header">
          <span className="about-tag">Overview</span>
          <h2>What This System Does</h2>
          <p>
            This platform is designed for furniture store designers who need to
            show customers how selected furniture will look inside their rooms
            before final production or purchase decisions are made.
          </p>
        </div>

        <div className="about-overview-grid">
          <div className="about-overview-card">
            <h3>Project Vision</h3>
            <p>
              The system helps designers create room-specific furniture concepts
              by combining room dimensions, room style, and furniture placement
              into a visual design process.
            </p>
          </div>

          <div className="about-overview-card">
            <h3>Target Users</h3>
            <p>
              The main users are furniture designers in stores who work directly
              with customers and need a fast way to present room design ideas.
            </p>
          </div>

          <div className="about-overview-card">
            <h3>Core Value</h3>
            <p>
              It reduces uncertainty by allowing customers to preview furniture
              layouts, colours, and room combinations before making decisions.
            </p>
          </div>
        </div>
      </section>

      <section className="about-section about-light">
        <div className="about-section-header center">
          <span className="about-tag">Key Features</span>
          <h2>Main Functionalities</h2>
        </div>

        <div className="about-feature-grid">
          {features.map((feature, index) => (
            <div className="about-feature-card" key={index}>
              <div className="about-feature-number">
                {String(index + 1).padStart(2, "0")}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="about-section">
        <div className="about-two-column">
          <div className="about-text-block">
            <span className="about-tag">Workflow</span>
            <h2>How the Design Process Works</h2>
            <p>
              The application guides designers through a simple but effective
              workflow, starting from room setup and continuing through furniture
              arrangement, 3D preview, and saved design management.
            </p>

            <ul className="about-steps">
              {steps.map((step, index) => (
                <li key={index}>
                  <span>{index + 1}</span>
                  <p>{step}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="about-side-card">
            <span className="about-tag">Why It Matters</span>
            <h3>Better Customer Experience</h3>
            <p>
              Instead of only describing furniture ideas verbally, designers can
              visually demonstrate how designs fit within a customer’s room.
            </p>

            <h3>Improved Design Accuracy</h3>
            <p>
              Designers can use room size and shape information to scale
              furniture more accurately and reduce design mismatches.
            </p>

            <h3>Professional Presentation</h3>
            <p>
              The final room design can be shown in a structured, modern, and
              visually convincing way.
            </p>
          </div>
        </div>
      </section>

      <section className="about-cta">
        <div className="about-cta-box">
          <div>
            <span className="about-tag">Get Started</span>
            <h2>Ready to Build Better Furniture Presentations?</h2>
            <p>
              Start creating room-focused furniture concepts and help customers
              visualize the final outcome with confidence.
            </p>
          </div>

          <div className="about-cta-actions">
            <button onClick={() => navigate("/create-design")}>
              Create Design
            </button>
            <button
              className="secondary"
              onClick={() => navigate("/explore")}
            >
              Explore Furniture
            </button>
          </div>
        </div>
      </section>

      <footer className="about-footer">
        <div className="about-footer-inner">
          <p>&copy; {new Date().getFullYear()} Dream Space. All rights reserved.</p>
          <div className="about-footer-links">
            <Link to="/">Home</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/explore">Explore</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;