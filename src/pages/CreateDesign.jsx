import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

import { auth, db, storage } from "../firebase";
import "../styles/CreateDesign.css";
import objectImages from "../data/objectImages";

const gridSize = 20;

const CreateDesign = () => {
  const navigate = useNavigate();
  const previewRef = useRef(null);
  const dragRef = useRef({ id: null, offsetX: 0, offsetY: 0 });

  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [name, setName] = useState("");
  const [type] = useState("2D");
  const [isPublic, setIsPublic] = useState(false);
  const [objects, setObjects] = useState([]);
  const [selectedObjectType, setSelectedObjectType] = useState(
    objectImages[0]?.type || ""
  );
  const [roomWidthFt, setRoomWidthFt] = useState(30);
  const [roomHeightFt, setRoomHeightFt] = useState(20);
  const [bgImageFile, setBgImageFile] = useState(null);
  const [bgPreview, setBgPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate("/login");
      } else {
        setUser(currentUser);
      }
      setCheckingAuth(false);
    });

    return () => unsub();
  }, [navigate]);

  const addObject = () => {
    const config = objectImages.find((obj) => obj.type === selectedObjectType);
    if (!config) return;

    const newObj = {
      id: Date.now(),
      type: config.type,
      label: config.label,
      image: config.image,
      x: 0,
      y: 0,
      width: 80,
      height: 80,
      rotateX: 0,
      rotateY: 0,
      rotation: 0,
    };

    setObjects((prev) => [...prev, newObj]);
  };

  const handleDelete = (id) => {
    setObjects((prev) => prev.filter((obj) => obj.id !== id));
  };

  const updateObject = (id, field, value) => {
    setObjects((prev) =>
      prev.map((obj) =>
        obj.id === id ? { ...obj, [field]: parseFloat(value) || 0 } : obj
      )
    );
  };

  const startDrag = (e, id) => {
    const obj = objects.find((o) => o.id === id);
    if (!obj || !previewRef.current) return;

    const bounds = previewRef.current.getBoundingClientRect();

    dragRef.current = {
      id,
      offsetX: e.clientX - bounds.left - obj.x,
      offsetY: e.clientY - bounds.top - obj.y,
    };

    window.addEventListener("mousemove", handleDragMove);
    window.addEventListener("mouseup", stopDrag);
  };

  const handleDragMove = (e) => {
    const { id, offsetX, offsetY } = dragRef.current;
    if (!id || !previewRef.current) return;

    const bounds = previewRef.current.getBoundingClientRect();

    const x = Math.max(
      0,
      Math.round((e.clientX - bounds.left - offsetX) / gridSize) * gridSize
    );
    const y = Math.max(
      0,
      Math.round((e.clientY - bounds.top - offsetY) / gridSize) * gridSize
    );

    setObjects((prev) =>
      prev.map((obj) => (obj.id === id ? { ...obj, x, y } : obj))
    );
  };

  const stopDrag = () => {
    dragRef.current = { id: null, offsetX: 0, offsetY: 0 };
    window.removeEventListener("mousemove", handleDragMove);
    window.removeEventListener("mouseup", stopDrag);
  };

  const handleBgChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBgImageFile(file);
    setBgPreview(URL.createObjectURL(file));
  };

  const handleExportPDF = async () => {
    if (!previewRef.current) return;

    try {
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
      });

      const pdf = new jsPDF("landscape", "pt", "a4");
      const imgData = canvas.toDataURL("image/png");

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(
        (pageWidth - 60) / imgWidth,
        (pageHeight - 80) / imgHeight
      );

      const finalWidth = imgWidth * ratio;
      const finalHeight = imgHeight * ratio;
      const x = (pageWidth - finalWidth) / 2;
      const y = 40;

      pdf.text(name || "Design Preview", 40, 25);
      pdf.addImage(imgData, "PNG", x, y, finalWidth, finalHeight);
      pdf.save(`${name || "design"}.pdf`);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to export PDF", "error");
    }
  };

  const uploadBackgroundIfNeeded = async () => {
    if (!bgImageFile || !user) return null;

    const safeName = `${Date.now()}_${bgImageFile.name}`;
    const storageRef = ref(storage, `design-backgrounds/${user.uid}/${safeName}`);

    await uploadBytes(storageRef, bgImageFile);
    return await getDownloadURL(storageRef);
  };

  const handleSubmit = async () => {
    if (!user) {
      Swal.fire("Please login first.");
      navigate("/login");
      return;
    }

    if (!name.trim()) {
      Swal.fire("Validation", "Please enter a design name.", "warning");
      return;
    }

    if (objects.length === 0) {
      Swal.fire("Validation", "Please add at least one object.", "warning");
      return;
    }

    setSaving(true);

    try {
      const backgroundUrl = await uploadBackgroundIfNeeded();

      const cleanedObjects = objects.map((obj) => ({
        id: obj.id,
        type: obj.type,
        label: obj.label || obj.type,
        image: obj.image,
        x: obj.x,
        y: obj.y,
        width: obj.width,
        height: obj.height,
        rotateX: obj.rotateX || 0,
        rotateY: obj.rotateY || 0,
        rotation: obj.rotation || 0,
      }));

      await addDoc(collection(db, "designs"), {
        name: name.trim(),
        type,
        isPublic,
        userId: user.uid,
        userEmail: user.email || "",
        roomWidthFt: Number(roomWidthFt) || 0,
        roomHeightFt: Number(roomHeightFt) || 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        designData: {
          background: backgroundUrl || null,
          objects: cleanedObjects,
        },
      });

      await Swal.fire("Success", "Design saved successfully.", "success");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Could not save design.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (checkingAuth) {
    return <div className="create-loading">Checking authentication...</div>;
  }

  return (
  <div className="create-design-page">
    <div className="create-layout">
      <aside className="create-sidebar">
        <button
          onClick={() => navigate("/dashboard")}
          className="create-back-btn"
        >
          ←
        </button>

        <h2>Create New Design</h2>
        <p className="create-subtitle">
          Build your 2D furniture layout and save it to your design library.
        </p>

        <div className="create-form-group">
          <label>Design Name</label>
          <input
            type="text"
            className="create-input"
            placeholder="Enter design name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="create-room-grid">
          <div className="create-form-group">
            <label>Room Width (ft)</label>
            <input
              type="number"
              className="create-input"
              value={roomWidthFt}
              onChange={(e) => setRoomWidthFt(parseFloat(e.target.value) || 0)}
              min="1"
            />
          </div>

          <div className="create-form-group">
            <label>Room Height (ft)</label>
            <input
              type="number"
              className="create-input"
              value={roomHeightFt}
              onChange={(e) => setRoomHeightFt(parseFloat(e.target.value) || 0)}
              min="1"
            />
          </div>
        </div>

        <div className="create-form-group">
          <label>Background Image</label>
          <input
            type="file"
            className="create-input"
            accept="image/*"
            onChange={handleBgChange}
          />
        </div>

        <div className="create-form-group">
          <label>Select Object</label>
          <div className="create-object-row">
            <select
              className="create-select"
              value={selectedObjectType}
              onChange={(e) => setSelectedObjectType(e.target.value)}
            >
              {objectImages.map((obj) => (
                <option key={obj.type} value={obj.type}>
                  {obj.label}
                </option>
              ))}
            </select>

            <button className="create-add-btn" onClick={addObject}>
              +
            </button>
          </div>
        </div>

        {objects.length > 0 && (
          <div className="create-properties">
            <h4>Edit Object Properties</h4>

            {objects.map((obj) => (
              <div key={obj.id} className="object-card">
                <div className="object-card-top">
                  <strong>{obj.type}</strong>

                  <div className="object-card-actions">
                    <button
                      className="object-small-btn secondary"
                      onClick={() => {
                        const clone = {
                          ...obj,
                          id: Date.now(),
                          x: obj.x + 20,
                          y: obj.y + 20,
                        };
                        setObjects((prev) => [...prev, clone]);
                      }}
                    >
                      Clone
                    </button>

                    <button
                      className="object-small-btn danger"
                      onClick={() => handleDelete(obj.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="object-grid">
                  <input
                    type="number"
                    className="create-input"
                    value={(obj.width / 20).toFixed(1)}
                    onChange={(e) =>
                      updateObject(obj.id, "width", parseFloat(e.target.value) * 20)
                    }
                    placeholder="Width (ft)"
                  />

                  <input
                    type="number"
                    className="create-input"
                    value={(obj.height / 20).toFixed(1)}
                    onChange={(e) =>
                      updateObject(obj.id, "height", parseFloat(e.target.value) * 20)
                    }
                    placeholder="Height (ft)"
                  />

                  <input
                    type="number"
                    className="create-input"
                    value={obj.rotateX}
                    onChange={(e) =>
                      updateObject(obj.id, "rotateX", e.target.value)
                    }
                    placeholder="Rotate X"
                  />

                  <input
                    type="number"
                    className="create-input"
                    value={obj.rotateY}
                    onChange={(e) =>
                      updateObject(obj.id, "rotateY", e.target.value)
                    }
                    placeholder="Rotate Y"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <label className="create-checkbox-row">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
          />
          <span>Make this design public</span>
        </label>

        <button
          className="create-primary-btn"
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Design"}
        </button>

        <button className="create-secondary-btn" onClick={handleExportPDF}>
          Export to PDF
        </button>
      </aside>

      <main className="create-main">
        <div className="create-main-header">
          <h1>Create 2D Design</h1>
          <p>Drag objects around the room layout to build your design.</p>
        </div>

        <div className="create-canvas-card">
          <div
            ref={previewRef}
            className="create-canvas-board"
            style={{
              width: `${roomWidthFt * gridSize}px`,
              height: `${roomHeightFt * gridSize}px`,
              backgroundImage: bgPreview ? `url(${bgPreview})` : "none",
            }}
          >
            {objects.map((obj) => (
              <img
                key={obj.id}
                src={obj.image}
                alt={obj.type}
                onMouseDown={(e) => startDrag(e, obj.id)}
                onDoubleClick={() => handleDelete(obj.id)}
                style={{
                  position: "absolute",
                  left: obj.x,
                  top: obj.y,
                  width: `${obj.width}px`,
                  height: `${obj.height}px`,
                  transform: `rotateX(${obj.rotateX}deg) rotateY(${obj.rotateY}deg)`,
                  cursor: "grab",
                  userSelect: "none",
                }}
                draggable={false}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  </div>
);
};

export default CreateDesign;