"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import AerialOverlook from "@/components/scene/zones/AerialOverlook";
import Lighting from "@/components/scene/Lighting";
import Sky from "@/components/scene/Sky";
import Terrain from "@/components/scene/Terrain";
import { SCENE_COLORS } from "@/components/scene/PlaceholderCaldera";

const AERIAL_CAMERA = {
  position: [42, 28, 48] as const,
  fov: 48,
  target: [0, 4, 0] as const,
};

/**
 * Experience canvas — currently Aerial Overlook only.
 * Later zones mount via ZoneTransitionManager.
 */
export default function ExperienceCanvas() {
  return (
    <div className="h-dvh w-full bg-scene-sky">
      <Canvas
        camera={{
          position: [...AERIAL_CAMERA.position],
          fov: AERIAL_CAMERA.fov,
          near: 0.5,
          far: 400,
        }}
        dpr={[1, 1.75]}
        gl={{ antialias: true }}
        shadows
      >
        <Sky />
        <Lighting />
        <Terrain />
        <AerialOverlook />
        <OrbitControls
          makeDefault
          enablePan={false}
          minPolarAngle={0.25}
          maxPolarAngle={Math.PI / 2.15}
          minDistance={22}
          maxDistance={110}
          target={[...AERIAL_CAMERA.target]}
          enableDamping
          dampingFactor={0.06}
          autoRotate
          autoRotateSpeed={0.35}
        />
        {/* Keep clear color in sync if Sky unmounts */}
        <color attach="background" args={[SCENE_COLORS.sky]} />
      </Canvas>
    </div>
  );
}
