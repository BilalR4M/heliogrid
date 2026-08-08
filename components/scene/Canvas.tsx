"use client";

import { Canvas } from "@react-three/fiber";
import PlaceholderCaldera, {
  HOLOGRAM_CAMERA,
  SCENE_COLORS,
} from "@/components/scene/PlaceholderCaldera";

/**
 * Placeholder photoreal end-state of the hologram transition.
 * Zone geometry (Aerial Overlook+) replaces this in later milestones.
 */
export default function ExperienceCanvas() {
  return (
    <div className="h-dvh w-full bg-scene-sky">
      <Canvas
        camera={{
          position: [...HOLOGRAM_CAMERA.entered],
          fov: HOLOGRAM_CAMERA.fov,
        }}
        dpr={[1, 1.5]}
        gl={{ antialias: true }}
        onCreated={({ camera }) => {
          camera.lookAt(0, 0.6, 0);
        }}
      >
        <color attach="background" args={[SCENE_COLORS.sky]} />
        <fog attach="fog" args={[SCENE_COLORS.sky, 10, 28]} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[8, 12, 4]} intensity={1.8} color="#fff1d6" />
        <PlaceholderCaldera blend={1} spin={false} />
      </Canvas>
    </div>
  );
}
