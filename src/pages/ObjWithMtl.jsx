import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { MTLLoader, OBJLoader } from "three-stdlib";
import { useLoader } from "@react-three/fiber";

const Model = ({ objPath, mtlPath }) => {
  const materials = useLoader(MTLLoader, mtlPath);
  materials.preload();
  const object = useLoader(OBJLoader, objPath, (loader) => {
    loader.setMaterials(materials);
  });

  return <primitive object={object} scale={0.02} />;
};

const ObjWithMtl = () => {
  return (
    <div style={{ height: "100vh", background: "#111" }}>
      <Canvas camera={{ position: [2, 2, 5], fov: 50 }}>
        <ambientLight intensity={1.2} />
        <directionalLight position={[3, 3, 3]} />
        <Suspense fallback={null}>
          <Model
            objPath="/models/Desk.obj"
            mtlPath="/models/desk.mtl"
          />
        </Suspense>
        <OrbitControls />
      </Canvas>
    </div>
  );
};

export default ObjWithMtl;