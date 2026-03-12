import React, { useState, useRef, useEffect, Suspense } from "react";
import { Canvas, useLoader, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, TransformControls } from "@react-three/drei";
import { OBJLoader } from "three-stdlib";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import * as THREE from "three";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "../firebase";
import "../styles/Design3D.css";

const ObjModel = ({ path }) => {
  const obj = useLoader(OBJLoader, path);
  return <primitive object={obj} />;
};

const GlbModel = ({ path }) => {
  const gltf = useLoader(GLTFLoader, path);
  return <primitive object={gltf.scene} />;
};

const ModelMesh = ({ model, selected, onSelect, onUpdate }) => {
  const ref = useRef();

  useEffect(() => {
    if (ref.current) {
      ref.current.position.set(...(model.position || [0, 0, 0]));
      ref.current.rotation.set(...(model.rotation || [0, 0, 0]));
      ref.current.scale.set(...(model.scale || [1, 1, 1]));
    }
  }, [model]);

  return (
    <>
      <group
        ref={ref}
        position={model.position || [0, 0, 0]}
        rotation={model.rotation || [0, 0, 0]}
        scale={model.scale || [1, 1, 1]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(model.id);
        }}
      >
        {model.fileType === "obj" ? (
          <ObjModel path={model.path} />
        ) : (
          <GlbModel path={model.path} />
        )}
      </group>

      {selected && ref.current && (
        <TransformControls
          object={ref.current}
          mode="translate"
          onObjectChange={() => {
            if (!ref.current) return;

            onUpdate(model.id, "position", ref.current.position.toArray());
            onUpdate(model.id, "rotation", [
              ref.current.rotation.x,
              ref.current.rotation.y,
              ref.current.rotation.z,
            ]);
            onUpdate(model.id, "scale", ref.current.scale.toArray());
          }}
        />
      )}
    </>
  );
};

const WallsAndFloor = ({
  roomWidth,
  roomLength,
  roomHeight,
  wallColor,
  floorColor,
}) => {
  const { camera } = useThree();
  const [hideWall, setHideWall] = useState("");

  useFrame(() => {
    const camDir = new THREE.Vector3();
    camera.getWorldDirection(camDir);

    if (Math.abs(camDir.x) > Math.abs(camDir.z)) {
      setHideWall(camDir.x > 0 ? "left" : "right");
    } else {
      setHideWall(camDir.z > 0 ? "back" : "front");
    }
  });

  return (
    <group>
      {hideWall !== "back" && (
        <mesh position={[0, roomHeight / 2, -roomLength / 2]}>
          <planeGeometry args={[roomWidth, roomHeight]} />
          <meshStandardMaterial color={wallColor} side={THREE.DoubleSide} />
        </mesh>
      )}

      {hideWall !== "front" && (
        <mesh
          position={[0, roomHeight / 2, roomLength / 2]}
          rotation={[0, Math.PI, 0]}
        >
          <planeGeometry args={[roomWidth, roomHeight]} />
          <meshStandardMaterial color={wallColor} side={THREE.DoubleSide} />
        </mesh>
      )}

      {hideWall !== "left" && (
        <mesh
          position={[-roomWidth / 2, roomHeight / 2, 0]}
          rotation={[0, Math.PI / 2, 0]}
        >
          <planeGeometry args={[roomLength, roomHeight]} />
          <meshStandardMaterial color={wallColor} side={THREE.DoubleSide} />
        </mesh>
      )}

      {hideWall !== "right" && (
        <mesh
          position={[roomWidth / 2, roomHeight / 2, 0]}
          rotation={[0, -Math.PI / 2, 0]}
        >
          <planeGeometry args={[roomLength, roomHeight]} />
          <meshStandardMaterial color={wallColor} side={THREE.DoubleSide} />
        </mesh>
      )}

      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[roomWidth, roomLength]} />
        <meshStandardMaterial color={floorColor} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

const Edit3D = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [designName, setDesignName] = useState("Edited 3D Design");
  const [models, setModels] = useState([]);
  const [selectedModelId, setSelectedModelId] = useState(null);

  const [roomWidth, setRoomWidth] = useState(8);
  const [roomLength, setRoomLength] = useState(8);
  const [roomHeight, setRoomHeight] = useState(3);
  const [wallColor, setWallColor] = useState("#f5f5f5");
  const [floorColor, setFloorColor] = useState("#e0cda9");
  const [isPublic, setIsPublic] = useState(false);

  const [modelType, setModelType] = useState("Chair1");

  const modelPaths = {
    Bookrack: "/models/Bookrack.glb",
    Chair1: "/models/Chair1.glb",
    Chair2: "/models/Chair2.glb",
    Coffeetable: "/models/coffeetable.glb",
    GamingChair: "/models/gamingchair.glb",
    Rack2: "/models/rack2.glb",
    Couch: "/models/couch02.glb",
    Sofa: "/models/sofa1.glb",
    Sofa2: "/models/soffaaaa.glb",
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate("/login");
        return;
      }
      setUser(currentUser);
      setCheckingAuth(false);
    });

    return () => unsub();
  }, [navigate]);

  useEffect(() => {
    if (!checkingAuth && user) {
      fetchDesign();
    }
  }, [checkingAuth, user, id]);

  const fetchDesign = async () => {
    try {
      setLoading(true);

      const docRef = doc(db, "designs", id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        await Swal.fire("Error", "Design not found", "error");
        navigate("/dashboard");
        return;
      }

      const data = docSnap.data();

      if (data.userId !== auth.currentUser?.uid) {
        await Swal.fire(
          "Access denied",
          "You can only edit your own designs.",
          "warning"
        );
        navigate("/dashboard");
        return;
      }

      setDesignName(data.name || "Edited 3D Design");
      setModels(data.designData?.objects || []);
      setRoomWidth(data.roomWidth || 8);
      setRoomLength(data.roomLength || 8);
      setRoomHeight(data.roomHeight || 3);
      setWallColor(data.wallColor || "#f5f5f5");
      setFloorColor(data.floorColor || "#e0cda9");
      setIsPublic(!!data.isPublic);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to load design", "error");
    } finally {
      setLoading(false);
    }
  };

  const addModel = () => {
    const path = modelPaths[modelType];
    const fileType = path.endsWith(".obj") ? "obj" : "glb";

    const newModel = {
      id: Date.now(),
      name: modelType,
      path,
      fileType,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [0.5, 0.5, 0.5],
    };

    setModels((prev) => [...prev, newModel]);
    setSelectedModelId(newModel.id);
  };

  const updateModel = (targetId, field, value) => {
    setModels((prev) =>
      prev.map((m) => (m.id === targetId ? { ...m, [field]: value } : m))
    );
  };

  const deleteModel = (targetId) => {
    setModels((prev) => prev.filter((m) => m.id !== targetId));
    if (selectedModelId === targetId) setSelectedModelId(null);
  };

  const handleScaleUp = (targetId) => {
    setModels((prev) =>
      prev.map((m) =>
        m.id === targetId
          ? { ...m, scale: m.scale.map((s) => s + 0.1) }
          : m
      )
    );
  };

  const handleScaleDown = (targetId) => {
    setModels((prev) =>
      prev.map((m) =>
        m.id === targetId
          ? { ...m, scale: m.scale.map((s) => Math.max(0.1, s - 0.1)) }
          : m
      )
    );
  };

  const handleRotateLeft = (targetId) => {
    setModels((prev) =>
      prev.map((m) =>
        m.id === targetId
          ? {
              ...m,
              rotation: [m.rotation[0], m.rotation[1] + 0.1, m.rotation[2]],
            }
          : m
      )
    );
  };

  const handleRotateRight = (targetId) => {
    setModels((prev) =>
      prev.map((m) =>
        m.id === targetId
          ? {
              ...m,
              rotation: [m.rotation[0], m.rotation[1] - 0.1, m.rotation[2]],
            }
          : m
      )
    );
  };

  const buildPayload = (overrideName = null) => ({
    name: (overrideName || designName).trim(),
    type: "3D",
    isPublic,
    userId: user.uid,
    userEmail: user.email || "",
    roomWidth,
    roomLength,
    roomHeight,
    wallColor,
    floorColor,
    updatedAt: serverTimestamp(),
    designData: {
      objects: models,
    },
  });

  const handleUpdate = async () => {
    if (!user) {
      Swal.fire("Please login first.");
      navigate("/login");
      return;
    }

    if (!designName.trim()) {
      Swal.fire("Validation", "Please enter a design name.", "warning");
      return;
    }

    if (models.length === 0) {
      Swal.fire("Validation", "Add at least one model.", "warning");
      return;
    }

    try {
      setSaving(true);

      const payload = buildPayload();

      await updateDoc(doc(db, "designs", id), payload);

      await Swal.fire("Success", "3D design updated successfully.", "success");
      navigate(`/design-details/${id}`);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Could not update design", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAsNew = async () => {
    if (!user) {
      Swal.fire("Please login first.");
      navigate("/login");
      return;
    }

    if (!designName.trim()) {
      Swal.fire("Validation", "Please enter a design name.", "warning");
      return;
    }

    if (models.length === 0) {
      Swal.fire("Validation", "Add at least one model.", "warning");
      return;
    }

    try {
      setSaving(true);

      const payload = buildPayload(`${designName} (Edited)`);

      await addDoc(collection(db, "designs"), {
        ...payload,
        createdAt: serverTimestamp(),
      });

      await Swal.fire("Success", "Design saved as new successfully.", "success");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Could not save design", "error");
    } finally {
      setSaving(false);
    }
  };

  if (checkingAuth || loading) {
    return <div className="design3d-loading">Loading 3D editor...</div>;
  }

  return (
    <div className="design3d-page">
      <div className="design3d-layout">
        <aside className="design3d-sidebar">
          <button
            onClick={() => navigate(`/design-details/${id}`)}
            className="design3d-back-btn"
          >
            ←
          </button>

          <h2>Edit 3D Design</h2>
          <p className="design3d-subtitle">
            Update the room setup and modify 3D furniture placements.
          </p>

          <div className="design3d-form-group">
            <label>Design Name</label>
            <input
              type="text"
              className="design3d-input"
              value={designName}
              onChange={(e) => setDesignName(e.target.value)}
              placeholder="Enter design name"
            />
          </div>

          <div className="design3d-form-group">
            <label>Room Width</label>
            <input
              type="range"
              min="3"
              max="20"
              value={roomWidth}
              onChange={(e) => setRoomWidth(parseFloat(e.target.value))}
            />
            <div className="range-value">{roomWidth} meters</div>
          </div>

          <div className="design3d-form-group">
            <label>Room Length</label>
            <input
              type="range"
              min="3"
              max="20"
              value={roomLength}
              onChange={(e) => setRoomLength(parseFloat(e.target.value))}
            />
            <div className="range-value">{roomLength} meters</div>
          </div>

          <div className="design3d-form-group">
            <label>Room Height</label>
            <input
              type="range"
              min="2"
              max="6"
              value={roomHeight}
              onChange={(e) => setRoomHeight(parseFloat(e.target.value))}
            />
            <div className="range-value">{roomHeight} meters</div>
          </div>

          <div className="design3d-form-group">
            <label>Wall Color</label>
            <input
              type="color"
              value={wallColor}
              onChange={(e) => setWallColor(e.target.value)}
              className="design3d-color"
            />
          </div>

          <div className="design3d-form-group">
            <label>Floor Color</label>
            <input
              type="color"
              value={floorColor}
              onChange={(e) => setFloorColor(e.target.value)}
              className="design3d-color"
            />
          </div>

          <div className="design3d-form-group">
            <label>Select Model</label>
            <select
              className="design3d-select"
              value={modelType}
              onChange={(e) => setModelType(e.target.value)}
            >
              {Object.keys(modelPaths).map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </div>

          <button className="design3d-primary-btn" onClick={addModel}>
            Add Model
          </button>

          <label className="design3d-checkbox-row">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            <span>Make this design public</span>
          </label>

          <button
            className="design3d-save-btn"
            onClick={handleUpdate}
            disabled={saving}
            style={{ marginBottom: "10px" }}
          >
            {saving ? "Saving..." : "Update Design"}
          </button>

          <button
            className="design3d-primary-btn"
            onClick={handleSaveAsNew}
            disabled={saving}
          >
            Save as New Design
          </button>

          {models.length > 0 && (
            <div className="design3d-models">
              <h4>Manage Objects</h4>

              {models.map((obj) => (
                <div key={obj.id} className="design3d-model-card">
                  <div className="design3d-model-top">
                    <strong>{obj.name}</strong>
                    <button
                      className="delete-icon-btn"
                      onClick={() => deleteModel(obj.id)}
                    >
                      <FaTrash />
                    </button>
                  </div>

                  <div className="design3d-model-actions">
                    <button onClick={() => handleScaleUp(obj.id)}>Scale +</button>
                    <button onClick={() => handleScaleDown(obj.id)}>Scale -</button>
                  </div>

                  <div className="design3d-model-actions">
                    <button onClick={() => handleRotateLeft(obj.id)}>Rotate ➡</button>
                    <button onClick={() => handleRotateRight(obj.id)}>Rotate ⬅</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>

        <main className="design3d-main">
          <div className="design3d-main-header">
            <h1>Edit 3D Workspace</h1>
            <p>Drag, rotate, and scale your models inside the room.</p>
          </div>

          <div className="design3d-canvas-card">
            <Canvas
              camera={{ position: [10, 6, 10], fov: 50 }}
              onPointerMissed={() => setSelectedModelId(null)}
            >
              <ambientLight intensity={0.7} />
              <directionalLight position={[5, 10, 5]} intensity={1} />
              <OrbitControls enablePan={false} />

              <Suspense fallback={null}>
                <WallsAndFloor
                  roomWidth={roomWidth}
                  roomLength={roomLength}
                  roomHeight={roomHeight}
                  wallColor={wallColor}
                  floorColor={floorColor}
                />

                {models.map((model) => (
                  <ModelMesh
                    key={model.id}
                    model={model}
                    selected={selectedModelId === model.id}
                    onSelect={setSelectedModelId}
                    onUpdate={updateModel}
                  />
                ))}
              </Suspense>
            </Canvas>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Edit3D;