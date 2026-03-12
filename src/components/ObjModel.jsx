import React from "react";
import { useLoader } from "@react-three/fiber";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";

const ObjModel = ({ url, position = [0, 0, 0], scale = 0.5 }) => {
  const obj = useLoader(OBJLoader, url);

  return (
    <primitive
      object={obj}
      position={position}
      scale={[scale, scale, scale]}
      rotation={[0, Math.PI, 0]}
    />
  );
};

export default ObjModel;