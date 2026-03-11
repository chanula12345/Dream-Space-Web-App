import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import { db } from "../firebase";
import Sidebar from "../components/Sidebar";

import "../styles/Explore.css";

const Explore = () => {

  const navigate = useNavigate();

  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("All");

  const fetchPublicDesigns = async () => {
    try {

      const q = query(
        collection(db, "designs"),
        where("isPublic", "==", true)
      );

      const snapshot = await getDocs(q);

      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setDesigns(list);

    } catch (err) {
      console.error(err);

      Swal.fire({
        icon: "error",
        title: "Failed to load public designs",
        text: "Unable to fetch designs from database.",
      });

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicDesigns();
  }, []);

  const filteredDesigns = designs.filter((design) =>
    filterType === "All" ? true : design.type === filterType
  );

  return (
    <div className="app-layout explore-page">

      <Sidebar />

      <div className="explore-content">

        <div className="explore-header">

          <h2>Explore Public Designs</h2>

          <select
            className="explore-filter"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="2D">2D</option>
            <option value="3D">3D</option>
          </select>

        </div>

        {loading ? (
          <div className="explore-loading">Loading designs...</div>
        ) : filteredDesigns.length === 0 ? (
          <div className="explore-empty">
            No public designs available.
          </div>
        ) : (
          <div className="explore-grid">

            {filteredDesigns.map((design) => (

              <div key={design.id} className="explore-card">

                <h4>{design.name || "Untitled Design"}</h4>

                <p className="design-type">
                  Type: {design.type || "Unknown"}
                </p>

                <div className="design-objects">

                  {design.designData?.objects?.map((obj, index) => (
                    <span key={index} className="design-tag">
                      {obj.type || obj.name}
                    </span>
                  ))}

                </div>

                <p className="design-date">
                  Created:{" "}
                  {design.createdAt?.seconds
                    ? new Date(
                        design.createdAt.seconds * 1000
                      ).toLocaleString()
                    : "N/A"}
                </p>

                <button
                  className="view-btn"
                  onClick={() => navigate(`/design-details/${design.id}`)}
                >
                  View Design
                </button>

              </div>

            ))}

          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;