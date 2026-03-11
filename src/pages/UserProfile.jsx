import React, { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import Sidebar from "../components/Sidebar";
import { auth, db } from "../firebase";
import "../styles/UserProfile.css";
import defaultAvatar from "../assets/user-avatar.png";

const UserProfile = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [designs, setDesigns] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingDesigns, setLoadingDesigns] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate("/login");
        return;
      }

      setUser(currentUser);
      setLoadingUser(false);
      fetchUserDesigns(currentUser.uid);
    });

    return () => unsub();
  }, [navigate]);

  const fetchUserDesigns = async (uid) => {
    try {
      setLoadingDesigns(true);

      const q = query(collection(db, "designs"), where("userId", "==", uid));
      const snapshot = await getDocs(q);

      const designList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      designList.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime;
      });

      setDesigns(designList);
    } catch (err) {
      console.error("Failed to fetch designs:", err);
      Swal.fire("Error", "Failed to load your designs", "error");
    } finally {
      setLoadingDesigns(false);
    }
  };

  const privateDesigns = useMemo(
    () => designs.filter((design) => !design.isPublic),
    [designs]
  );

  const publicDesigns = useMemo(
    () => designs.filter((design) => design.isPublic),
    [designs]
  );

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

  return (
    <div className="app-layout user-profile-page">
      <Sidebar />

      <div className="profile-content">
        <div className="profile-header-card">
          <div className="profile-left">
            <h1>User Profile</h1>

            {loadingUser ? (
              <p>Loading user data...</p>
            ) : (
              <>
                <p>
                  <strong>Name:</strong>{" "}
                  <span>{user?.displayName || "Designer"}</span>
                </p>
                <p>
                  <strong>Email:</strong>{" "}
                  <span>{user?.email || "N/A"}</span>
                </p>
                <p>
                  <strong>User ID:</strong>{" "}
                  <span>{user?.uid || "N/A"}</span>
                </p>
              </>
            )}
          </div>

          <div className="profile-avatar-wrap">
            <img
              src={defaultAvatar}
              alt="Profile"
              className="profile-avatar"
            />
          </div>
        </div>

        <div className="profile-stats-grid">
          <div className="profile-stat-card">
            <h4>Total Designs</h4>
            <p>{designs.length}</p>
          </div>

          <div className="profile-stat-card">
            <h4>Private Designs</h4>
            <p>{privateDesigns.length}</p>
          </div>

          <div className="profile-stat-card">
            <h4>Public Designs</h4>
            <p>{publicDesigns.length}</p>
          </div>
        </div>

        <div className="profile-history-card">
          <div className="profile-section-head">
            <h3>My Design History</h3>
          </div>

          {loadingDesigns ? (
            <p className="profile-loading-text">Loading designs...</p>
          ) : designs.length === 0 ? (
            <p className="profile-empty-text">No designs available yet.</p>
          ) : (
            <div className="profile-design-grid">
              {designs.map((design) => (
                <div key={design.id} className="profile-design-card">
                  <div className="profile-design-top">
                    <h5>{design.name || "Untitled Design"}</h5>
                    <span
                      className={`profile-badge ${
                        design.type === "3D" ? "badge-3d" : "badge-2d"
                      }`}
                    >
                      {design.type || "Unknown"}
                    </span>
                  </div>

                  <p>
                    <strong>Visibility:</strong>{" "}
                    {design.isPublic ? "Public" : "Private"}
                  </p>

                  <p>
                    <strong>Room Size:</strong> {getRoomSizeText(design)}
                  </p>

                  <p>
                    <strong>Objects:</strong>{" "}
                    {design.designData?.objects?.length || 0}
                  </p>

                  <p className="profile-date-text">
                    Created:{" "}
                    {design.createdAt?.seconds
                      ? new Date(
                          design.createdAt.seconds * 1000
                        ).toLocaleString()
                      : "N/A"}
                  </p>

                  <div className="profile-card-actions">
                    <button
                      onClick={() => navigate(`/design-details/${design.id}`)}
                    >
                      View
                    </button>

                    <button
                      onClick={() =>
                        navigate(
                          design.type === "3D"
                            ? `/edit-3d/${design.id}`
                            : `/edit-2d/${design.id}`
                        )
                      }
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;