import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

import { db, auth } from "../firebase";
import Sidebar from "../components/Sidebar";

import "../styles/Dashboard.css";

const Dashboard = () => {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate("/login");
      } else {
        fetchDesigns(currentUser.uid);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchDesigns = async (uid) => {
    try {
      const q = query(collection(db, "designs"), where("userId", "==", uid));

      const snapshot = await getDocs(q);

      const designsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setDesigns(designsList);
    } catch (error) {
      console.error("Error loading designs:", error);
    }
  };

  const getRoomSizeText = (design) => {
    if (design.type === "2D") {
      const width = design.roomWidthFt || "-";
      const height = design.roomHeightFt || "-";
      return `${width}ft × ${height}ft`;
    }

    if (design.type === "3D") {
      const width = design.roomWidth || "-";
      const length = design.roomLength || "-";
      const height = design.roomHeight || "-";
      return `${width}m × ${length}m × ${height}m`;
    }

    return "Not specified";
  };

  const handleEdit = (design) => {
    if (design.type === "2D") {
      navigate(`/edit-2d/${design.id}`);
    } else if (design.type === "3D") {
      navigate(`/edit-3d/${design.id}`);
    } else {
      navigate(`/design-details/${design.id}`);
    }
  };

  const handleCreate = () => {
    navigate("/create-design");
  };

  if (loading) {
    return <div className="dashboard-loading">Checking authentication...</div>;
  }

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>My Designs</h1>

          <button className="create-btn" onClick={handleCreate}>
            + Create New Design
          </button>
        </div>

        <div className="design-grid">
          {designs.length === 0 && (
            <div className="empty-designs">
              <p>No designs yet.</p>

              <button className="create-btn" onClick={handleCreate}>
                Create Your First Design
              </button>
            </div>
          )}

          {designs.map((design) => (
            <div className="design-card" key={design.id}>
              <div className="design-card-top">
                <h3>{design.name || "Untitled Design"}</h3>
                <span
                  className={`design-badge ${
                    design.type === "3D" ? "badge-3d" : "badge-2d"
                  }`}
                >
                  {design.type || "Unknown"}
                </span>
              </div>

              <p>
                <strong>Room Size:</strong> {getRoomSizeText(design)}
              </p>

              <p>
                <strong>Visibility:</strong> {design.isPublic ? "Public" : "Private"}
              </p>

              <div className="design-actions">
                <button onClick={() => navigate(`/design-details/${design.id}`)}>
                  View
                </button>

                <button onClick={() => handleEdit(design)}>Edit</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;