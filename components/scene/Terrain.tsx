"use client";

import { SCENE_COLORS } from "@/components/scene/PlaceholderCaldera";

/** Shared caldera bowl — rock floor + rim for outdoor zones. */
export default function Terrain() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <circleGeometry args={[18, 64]} />
        <meshStandardMaterial
          color={SCENE_COLORS.rock}
          roughness={0.95}
          metalness={0.02}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.4, 0]} receiveShadow>
        <ringGeometry args={[18, 78, 72]} />
        <meshStandardMaterial
          color="#6e4530"
          roughness={0.97}
          metalness={0.02}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 1.2, 0]}>
        <torusGeometry args={[78, 2.4, 8, 72]} />
        <meshStandardMaterial color="#5a3828" roughness={1} metalness={0} />
      </mesh>
    </group>
  );
}
