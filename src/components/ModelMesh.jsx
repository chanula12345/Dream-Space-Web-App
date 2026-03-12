import React, { useRef, useEffect } from "react";
import { TransformControls } from "@react-three/drei";
import ObjModel from "./loaders/ObjModel";
import GlbModel from "./loaders/GlbModel";

const ModelMesh = ({ model, selected, onSelect, onUpdate }) => {
  const ref = useRef();

  useEffect(() => {
    if (selected && ref.current) {
      onUpdate(model.id, "position", ref.current.position.toArray());
      onUpdate(model.id, "rotation", [
        ref.current.rotation.x,
        ref.current.rotation.y,
        ref.current.rotation.z,
      ]);
      onUpdate(model.id, "scale", ref.current.scale.toArray());
    }
  }, [selected]);

  return (
    <group>
      <mesh
        ref={ref}
        position={model.position}
        rotation={model.rotation}
        scale={model.scale}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(model.id);
        }}
      >
        {model.type === "obj" ? (
          <ObjModel path={model.path} />
        ) : (
          <GlbModel path={model.path} />
        )}
      </mesh>

      {selected && (
        <TransformControls
          object={ref.current}
          mode="translate"
          onObjectChange={() => {
            if (!ref.current) return;
            const pos = ref.current.position.toArray();
            const rot = [
              ref.current.rotation.x,
              ref.current.rotation.y,
              ref.current.rotation.z,
            ];
            const scl = ref.current.scale.toArray();
            onUpdate(model.id, "position", pos);
            onUpdate(model.id, "rotation", rot);
            onUpdate(model.id, "scale", scl);
          }}
        />
      )}
    </group>
  );
};

export default ModelMesh;