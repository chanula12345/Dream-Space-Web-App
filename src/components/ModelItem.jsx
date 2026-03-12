import React, { useRef, useEffect } from "react";
import { TransformControls } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import { OBJLoader } from "three-stdlib";
import * as THREE from "three";

export const ModelItem = ({ model, selected, onUpdate }) => {
  const meshRef = useRef();
  const gltf = model.type === "glb" ? useLoader(THREE.GLTFLoader, model.path) : null;
  const obj = model.type === "obj" ? useLoader(OBJLoader, model.path) : null;

  useEffect(() => {
    if (!selected || !meshRef.current) return;
    const mesh = meshRef.current;

    const handleChange = () => {
      onUpdate(model.id, "position", mesh.position.toArray());
      onUpdate(model.id, "rotation", mesh.rotation.toArray());
      onUpdate(model.id, "scale", mesh.scale.toArray());
    };

    mesh.addEventListener("change", handleChange);
    return () => mesh.removeEventListener("change", handleChange);
  }, [selected, model.id, onUpdate]);

  return (
    <>
      <mesh
        ref={meshRef}
        position={model.position}
        rotation={model.rotation}
        scale={model.scale}
        onClick={(e) => {
          e.stopPropagation();
          onUpdate("select", model.id);
        }}
      >
        <primitive object={model.type === "glb" ? gltf.scene : obj} />
      </mesh>
      {selected && meshRef.current && (
        <TransformControls object={meshRef.current} />
      )}
    </>
  );
};