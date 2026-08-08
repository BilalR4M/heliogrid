"use client";

import { SCENE_COLORS } from "@/components/scene/PlaceholderCaldera";
import { useSceneStore } from "@/lib/scene-state";
import { getSunDirection } from "@/lib/sun";

/** Caldera extent ~rim radius 78 — tighter frustum than the doc's d=500 for shadow texel density. */
const SUN_DISTANCE = 120;
const SHADOW_EXTENT = 95;
const SHADOW_MAP = 2048;

/**
 * Directional sun + hemisphere fill — single time→light path via scene-state timeOfDay.
 * Ambient removed; PMREM sky environment supplies most fill.
 */
export default function Lighting() {
  const timeOfDay = useSceneStore((s) => s.timeOfDay);
  const sun = getSunDirection(timeOfDay);

  return (
    <>
      <hemisphereLight args={["#7aa0c0", SCENE_COLORS.rock, 0.35]} />
      <directionalLight
        castShadow
        position={[
          sun.x * SUN_DISTANCE,
          sun.y * SUN_DISTANCE,
          sun.z * SUN_DISTANCE,
        ]}
        intensity={Math.max(0.08, sun.intensity * 1.55)}
        color="#fff5ea"
        shadow-mapSize-width={SHADOW_MAP}
        shadow-mapSize-height={SHADOW_MAP}
        shadow-bias={-0.0001}
        shadow-camera-near={0.5}
        shadow-camera-far={280}
        shadow-camera-left={-SHADOW_EXTENT}
        shadow-camera-right={SHADOW_EXTENT}
        shadow-camera-top={SHADOW_EXTENT}
        shadow-camera-bottom={-SHADOW_EXTENT}
      />
    </>
  );
}
