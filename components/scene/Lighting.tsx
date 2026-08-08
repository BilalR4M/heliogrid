"use client";

import { useSceneStore } from "@/lib/scene-state";
import { getSunDirection } from "@/lib/sun";

/** Directional sun + fill — position driven by time-of-day / suncalc. */
export default function Lighting() {
  const timeOfDay = useSceneStore((s) => s.timeOfDay);
  const sun = getSunDirection(timeOfDay);
  const distance = 90;

  return (
    <>
      <ambientLight intensity={0.18} />
      <directionalLight
        castShadow
        position={[sun.x * distance, sun.y * distance, sun.z * distance]}
        intensity={sun.intensity}
        color="#fff1d6"
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={200}
        shadow-camera-left={-90}
        shadow-camera-right={90}
        shadow-camera-top={90}
        shadow-camera-bottom={-90}
      />
    </>
  );
}
