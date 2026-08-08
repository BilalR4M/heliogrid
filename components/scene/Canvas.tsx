"use client";

import { Canvas } from "@react-three/fiber";

function PlaceholderMesh() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#4ade80" wireframe />
    </mesh>
  );
}

export default function ExperienceCanvas() {
  return (
    <div className="h-dvh w-full bg-[#0a0a0a]">
      <Canvas camera={{ position: [2, 2, 2], fov: 50 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <PlaceholderMesh />
      </Canvas>
    </div>
  );
}
