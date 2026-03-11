import React, { useEffect, useMemo, useRef, useState, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Sidebar from "../components/Sidebar";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { OBJLoader } from "three-stdlib";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import "../styles/DesignDetails.css";

const ObjModel = ({ path }) => {
  const obj = useLoader(OBJLoader, path);
  return <primitive object={obj} />;
};

const GlbModel = ({ path }) => {
  const gltf = useLoader(GLTFLoader, path);
  return <primitive object={gltf.scene} />;
};

const RenderModel = ({ model }) => {
  const modelFileType = model.fileType || model.type || "glb";

  return (
    <group
      position={model.position || [0, 0, 0]}
      rotation={model.rotation || [0, 0, 0]}
      scale={model.scale || [1, 1, 1]}
    >
      {modelFileType === "obj" ? (
        <ObjModel path={model.path} />
      ) : (
        <GlbModel path={model.path} />
      )}
    </group>
  );
};

const DesignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const previewRef = useRef(null);

  const [design, setDesign] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
        return;
      }
      setCurrentUser(user);
      setCheckingAuth(false);
    });

    return () => unsub();
  }, [navigate]);

  useEffect(() => {
    if (!checkingAuth && currentUser) {
      fetchDesign();
    }
  }, [checkingAuth, currentUser, id]);

  const fetchDesign = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, "designs", id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        await Swal.fire("Error", "Design not found", "error");
        navigate("/dashboard");
        return;
      }

      setDesign({
        id: docSnap.id,
        ...docSnap.data(),
      });
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to load design", "error");
    } finally {
      setLoading(false);
    }
  };

  const isOwner = useMemo(() => {
    if (!design || !currentUser) return false;
    return design.userId === currentUser.uid;
  }, [design, currentUser]);

  const togglePublic = async () => {
    if (!design || !isOwner) {
      Swal.fire("Access denied", "Only the design owner can change visibility.", "warning");
      return;
    }

    try {
      setActionLoading(true);

      await updateDoc(doc(db, "designs", id), {
        isPublic: !design.isPublic,
      });

      setDesign((prev) => ({
        ...prev,
        isPublic: !prev.isPublic,
      }));

      Swal.fire("Updated", "Visibility updated successfully", "success");
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to update visibility", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const deleteDesignHandler = async () => {
    if (!design || !isOwner) {
      Swal.fire("Access denied", "Only the design owner can delete this design.", "warning");
      return;
    }

    const confirm = await Swal.fire({
      icon: "warning",
      title: "Are you sure?",
      text: "This will permanently delete the design.",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#dc2626",
    });

    if (!confirm.isConfirmed) return;

    try {
      setActionLoading(true);
      await deleteDoc(doc(db, "designs", id));
      await Swal.fire("Deleted", "Design removed successfully", "success");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to delete design", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const exportToPDF = async () => {
    if (!previewRef.current || !design) return;

    try {
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("landscape", "pt", "a4");

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(
        (pageWidth - 60) / imgWidth,
        (pageHeight - 90) / imgHeight
      );

      const finalWidth = imgWidth * ratio;
      const finalHeight = imgHeight * ratio;
      const x = (pageWidth - finalWidth) / 2;
      const y = 50;

      pdf.setFontSize(16);
      pdf.text(design.name || "Design Preview", 40, 28);
      pdf.addImage(imgData, "PNG", x, y, finalWidth, finalHeight);
      pdf.save(`${design.name || "design"}_preview.pdf`);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to export PDF", "error");
    }
  };

  const handleEdit = () => {
    if (!design || !isOwner) {
      Swal.fire("Access denied", "Only the design owner can edit this design.", "warning");
      return;
    }

    if (design.type === "2D") {
      navigate(`/edit-2d/${id}`);
    } else if (design.type === "3D") {
      navigate(`/edit-3d/${id}`);
    }
  };

  const designObjects = design?.designData?.objects || [];
  const bgImage = design?.designData?.background || null;

  if (checkingAuth || loading) {
    return (
      <div className="app-layout design-details-page">
        <Sidebar />
        <div className="design-details-content">
          <div className="design-loading-card">Loading design details...</div>
        </div>
      </div>
    );
  }

  if (!design) return null;

  return (
    <div className="app-layout design-details-page">
      <Sidebar />

      <div className="design-details-content">
        <div className="design-topbar">
          <button
            className="details-back-btn"
            onClick={() => navigate("/dashboard")}
          >
            ← Back
          </button>
        </div>

        <div className="design-details-header">
          <div>
            <div className="design-header-top">
              <h1>{design.name || "Untitled Design"}</h1>
              <span
                className={`design-type-badge ${
                  design.type === "3D" ? "badge-3d" : "badge-2d"
                }`}
              >
                {design.type || "Unknown"}
              </span>
            </div>

            <p>
              Visibility:{" "}
              <span className={design.isPublic ? "status-public" : "status-private"}>
                {design.isPublic ? "Public" : "Private"}
              </span>
            </p>

            <p>
              Owner:{" "}
              <strong>
                {isOwner ? "You" : design.userEmail || "Another user"}
              </strong>
            </p>

            <p>
              Created At:{" "}
              {design.createdAt?.seconds
                ? new Date(design.createdAt.seconds * 1000).toLocaleString()
                : "N/A"}
            </p>
          </div>
        </div>

        <div className="design-info-card">
          <div className="card-title-row">
            <h3>Objects</h3>
            <span className="object-count">{designObjects.length} items</span>
          </div>

          <div className="design-tags">
            {designObjects.length > 0 ? (
              designObjects.map((obj, i) => (
                <span key={i} className="design-tag">
                  {obj.label || obj.name || obj.type || obj.fileType || "Object"}
                </span>
              ))
            ) : (
              <p className="empty-text">No objects added.</p>
            )}
          </div>
        </div>

        <div className="design-preview-card">
          <div className="card-title-row">
            <h3>Preview</h3>
          </div>

          {design.type === "2D" && (
            <div
              ref={previewRef}
              className="preview-box preview-2d"
              style={{
                backgroundImage: bgImage ? `url(${bgImage})` : "none",
              }}
            >
              {designObjects.map((obj, i) => (
                <img
                  key={i}
                  src={obj.image}
                  alt={obj.type || "object"}
                  style={{
                    position: "absolute",
                    left: obj.x || 0,
                    top: obj.y || 0,
                    width: obj.width || 80,
                    height: obj.height || 80,
                    transform: `rotateX(${obj.rotateX || 0}deg) rotateY(${obj.rotateY || 0}deg) rotate(${obj.rotation || 0}deg)`,
                    transformStyle: "preserve-3d",
                  }}
                  draggable={false}
                />
              ))}
            </div>
          )}

          {design.type === "3D" && (
            <div ref={previewRef} className="preview-box preview-3d">
              <Canvas camera={{ position: [0, 1.5, 4], fov: 50 }}>
                <ambientLight intensity={0.8} />
                <directionalLight position={[2, 3, 4]} intensity={1} />
                <OrbitControls />
                <Suspense fallback={null}>
                  {designObjects.map((model, i) => (
                    <RenderModel key={i} model={model} />
                  ))}
                </Suspense>
              </Canvas>
            </div>
          )}

          <div className="design-action-row">
            <button
              className="details-btn primary"
              onClick={exportToPDF}
              disabled={actionLoading}
            >
              Export to PDF
            </button>

            <button
              className="details-btn secondary"
              onClick={togglePublic}
              disabled={!isOwner || actionLoading}
            >
              Make {design.isPublic ? "Private" : "Public"}
            </button>

            <button
              className="details-btn success"
              onClick={handleEdit}
              disabled={!isOwner || actionLoading}
            >
              Edit Design
            </button>

            <button
              className="details-btn danger"
              onClick={deleteDesignHandler}
              disabled={!isOwner || actionLoading}
            >
              Delete Design
            </button>
          </div>

          {!isOwner && (
            <p className="owner-note">
              You can view this design, but only the owner can edit, delete, or
              change visibility.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DesignDetails;