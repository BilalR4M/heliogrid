"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import type { Group } from "three";

const RING_RADII = [1.1, 1.7, 2.35, 3.0] as const;

function CalderaWireframe() {
  const group = useRef<Group>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(media.matches);
    const onChange = () => setReduceMotion(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useFrame((_, delta) => {
    if (!group.current || reduceMotion) return;
    group.current.rotation.y += delta * 0.12;
  });

  return (
    <group ref={group} rotation={[0.35, 0.4, 0]}>
      {/* Caldera floor disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <circleGeometry args={[3.05, 48]} />
        <meshBasicMaterial color="#4ec9e8" wireframe transparent opacity={0.35} />
      </mesh>

      {/* Concentric field rings */}
      {RING_RADII.map((radius, index) => (
        <mesh
          key={radius}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, index * 0.04, 0]}
        >
          <torusGeometry args={[radius, 0.012, 6, 72]} />
          <meshBasicMaterial color="#4ec9e8" transparent opacity={0.85} />
        </mesh>
      ))}

      {/* Central Optics Tower — 250m lore stand-in */}
      <mesh position={[0, 0.95, 0]}>
        <cylinderGeometry args={[0.04, 0.14, 1.9, 5]} />
        <meshBasicMaterial color="#e0a53a" wireframe />
      </mesh>
      <mesh position={[0, 1.95, 0]}>
        <coneGeometry args={[0.12, 0.28, 5]} />
        <meshBasicMaterial color="#e0a53a" wireframe />
      </mesh>
    </group>
  );
}

export default function CalderaHologram() {
  return (
    <div className="relative h-full min-h-[280px] w-full">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(78,201,232,0.12)_0%,transparent_65%)]"
      />
      <Canvas
        camera={{ position: [0, 2.4, 5.2], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <CalderaWireframe />
      </Canvas>
    </div>
  );
}
