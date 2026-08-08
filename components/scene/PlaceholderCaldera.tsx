"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";

export const RING_RADII = [1.1, 1.7, 2.35, 3.0] as const;

/** Shared camera poses for landing idle → transition end / experience. */
export const HOLOGRAM_CAMERA = {
  idle: [0, 2.4, 5.2] as const,
  entered: [0, 1.15, 2.05] as const,
  fov: 42,
};

export const SCENE_COLORS = {
  sky: "#0c1824",
  rock: "#8b5a3c",
  panel: "#1a2332",
  steel: "#8a9199",
  cyan: "#4ec9e8",
  amber: "#e0a53a",
} as const;

type PlaceholderCalderaProps = {
  /** 0 = wireframe hologram, 1 = placeholder photoreal. */
  blend: number;
  /** Slow idle spin when true (landing wireframe state). */
  spin?: boolean;
  spinSpeed?: number;
};

/**
 * Concentric caldera stand-in used by the landing hologram and /experience.
 * Real zone geometry arrives later — this proves the morph, not the facility.
 */
export default function PlaceholderCaldera({
  blend,
  spin = false,
  spinSpeed = 0.12,
}: PlaceholderCalderaProps) {
  const group = useRef<Group>(null);
  const clamped = Math.min(1, Math.max(0, blend));
  const wire = 1 - clamped;
  const solid = clamped;

  useFrame((_, delta) => {
    if (!group.current || !spin) return;
    group.current.rotation.y += delta * spinSpeed;
  });

  return (
    <group ref={group} rotation={[0.35, 0.4, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <circleGeometry args={[3.05, 48]} />
        <meshBasicMaterial
          color={SCENE_COLORS.cyan}
          wireframe
          transparent
          opacity={0.35 * wire}
          depthWrite={false}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, 0]}>
        <circleGeometry args={[3.05, 48]} />
        <meshStandardMaterial
          color={SCENE_COLORS.rock}
          roughness={0.92}
          metalness={0.05}
          transparent
          opacity={solid}
        />
      </mesh>

      {RING_RADII.map((radius, index) => (
        <group key={radius} position={[0, index * 0.04, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[radius, 0.012, 6, 72]} />
            <meshBasicMaterial
              color={SCENE_COLORS.cyan}
              transparent
              opacity={0.85 * wire}
              depthWrite={false}
            />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[radius, 0.045, 8, 72]} />
            <meshStandardMaterial
              color={SCENE_COLORS.panel}
              roughness={0.35}
              metalness={0.65}
              transparent
              opacity={solid}
            />
          </mesh>
        </group>
      ))}

      <mesh position={[0, 0.95, 0]}>
        <cylinderGeometry args={[0.04, 0.14, 1.9, 5]} />
        <meshBasicMaterial
          color={SCENE_COLORS.amber}
          wireframe
          transparent
          opacity={wire}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, 0.95, 0]}>
        <cylinderGeometry args={[0.04, 0.14, 1.9, 8]} />
        <meshStandardMaterial
          color={SCENE_COLORS.steel}
          roughness={0.4}
          metalness={0.8}
          transparent
          opacity={solid}
        />
      </mesh>
      <mesh position={[0, 1.95, 0]}>
        <coneGeometry args={[0.12, 0.28, 5]} />
        <meshBasicMaterial
          color={SCENE_COLORS.amber}
          wireframe
          transparent
          opacity={wire}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, 1.95, 0]}>
        <coneGeometry args={[0.12, 0.28, 8]} />
        <meshStandardMaterial
          color={SCENE_COLORS.steel}
          roughness={0.35}
          metalness={0.85}
          transparent
          opacity={solid}
        />
      </mesh>
    </group>
  );
}
