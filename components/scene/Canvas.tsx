"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect } from "react";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import AerialOverlook from "@/components/scene/zones/AerialOverlook";
import ArrayRingAlpha from "@/components/scene/zones/ArrayRingAlpha";
import Lighting from "@/components/scene/Lighting";
import Sky from "@/components/scene/Sky";
import Terrain from "@/components/scene/Terrain";
import { SCENE_COLORS } from "@/components/scene/PlaceholderCaldera";
import { useSceneStore } from "@/lib/scene-state";

const AERIAL_CAMERA = {
  position: [42, 28, 48] as const,
  target: [0, 4, 0] as const,
  minDistance: 22,
  maxDistance: 110,
  minPolar: 0.25,
  maxPolar: Math.PI / 2.15,
  autoRotate: true,
};

const ARRAY_CAMERA = {
  position: [58, 2.4, 38] as const,
  target: [50, 1.2, 48] as const,
  minDistance: 4,
  maxDistance: 28,
  minPolar: 0.15,
  maxPolar: Math.PI / 2.05,
  autoRotate: false,
};

function ZoneView() {
  const currentZone = useSceneStore((s) => s.currentZone);
  const { camera, controls } = useThree();

  useEffect(() => {
    const orbit = controls as OrbitControlsImpl | null;
    const config =
      currentZone === "array-ring-alpha" ? ARRAY_CAMERA : AERIAL_CAMERA;

    camera.position.set(
      config.position[0],
      config.position[1],
      config.position[2],
    );
    camera.near = currentZone === "array-ring-alpha" ? 0.1 : 0.5;
    camera.far = currentZone === "array-ring-alpha" ? 200 : 400;
    camera.updateProjectionMatrix();

    if (orbit) {
      orbit.target.set(config.target[0], config.target[1], config.target[2]);
      orbit.minDistance = config.minDistance;
      orbit.maxDistance = config.maxDistance;
      orbit.minPolarAngle = config.minPolar;
      orbit.maxPolarAngle = config.maxPolar;
      orbit.autoRotate = config.autoRotate;
      orbit.update();
    } else {
      camera.lookAt(config.target[0], config.target[1], config.target[2]);
    }
  }, [camera, controls, currentZone]);

  return (
    <>
      <Terrain />
      {currentZone === "aerial-overlook" && <AerialOverlook />}
      {currentZone === "array-ring-alpha" && <ArrayRingAlpha />}
    </>
  );
}

/**
 * Experience canvas — zone-aware (Aerial Overlook + Array Ring Alpha).
 */
export default function ExperienceCanvas() {
  const currentZone = useSceneStore((s) => s.currentZone);
  const isArray = currentZone === "array-ring-alpha";

  return (
    <div className="h-dvh w-full bg-scene-sky">
      <Canvas
        camera={{
          position: [...AERIAL_CAMERA.position],
          fov: 48,
          near: 0.5,
          far: 400,
        }}
        dpr={[1, 1.75]}
        gl={{ antialias: true }}
        shadows
      >
        <Sky />
        <Lighting />
        <ZoneView />
        <OrbitControls
          makeDefault
          enablePan={false}
          enableDamping
          dampingFactor={0.06}
          autoRotateSpeed={0.35}
        />
        <color attach="background" args={[SCENE_COLORS.sky]} />
      </Canvas>
      <span className="sr-only">
        {isArray
          ? "Array Ring Alpha — click a panel for Digital Twin data"
          : "Aerial Overlook — drag to orbit"}
      </span>
    </div>
  );
}
