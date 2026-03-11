import React, { Suspense } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, Environment, Html, useProgress } from "@react-three/drei";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";

// Simple loading screen
const Loader = () => {
  const { progress } = useProgress();
  return <Html center style={{ color: "white" }}>{progress.toFixed(1)}% loaded</Html>;
};

// OBJ Model Loader Component
const ObjModel = ({ url, scale = 0.02, position = [0, -1, 0] }) => {
  const obj = useLoader(OBJLoader, url);
  return <primitive object={obj} scale={scale} position={position} />;
};

const ThreeCanvas = () => {
  return (
    <div style={{ width: "100vw", height: "100vh", backgroundColor: "#111" }}>
      <Canvas camera={{ position: [2, 2, 4], fov: 50 }}>
        <ambientLight intensity={1} />
        <directionalLight intensity={2} position={[5, 5, 5]} />
        <Environment preset="city" />
        <Suspense fallback={<Loader />}>
          <ObjModel url="/models/Desk.obj" scale={0.02} />
        </Suspense>
        <OrbitControls enableZoom enablePan />
      </Canvas>
    </div>
  );
};

export default ThreeCanvas;