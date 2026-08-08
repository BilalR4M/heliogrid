"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect } from "react";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import AerialOverlook from "@/components/scene/zones/AerialOverlook";
import ArrayRingAlpha from "@/components/scene/zones/ArrayRingAlpha";
import HelioSpireTower from "@/components/scene/zones/HelioSpireTower";
import Lighting from "@/components/scene/Lighting";
import Sky from "@/components/scene/Sky";
import Terrain from "@/components/scene/Terrain";
import { SCENE_COLORS } from "@/components/scene/PlaceholderCaldera";
import type { ZoneId } from "@/content/zones";
import { useSceneStore } from "@/lib/scene-state";

type CameraConfig = {
  position: readonly [number, number, number];
  target: readonly [number, number, number];
  minDistance: number;
  maxDistance: number;
  minPolar: number;
  maxPolar: number;
  autoRotate: boolean;
  near: number;
  far: number;
};

const ZONE_CAMERAS: Record<
  "aerial-overlook" | "array-ring-alpha" | "heliospire-tower",
  CameraConfig
> = {
  "aerial-overlook": {
    position: [42, 28, 48],
    target: [0, 4, 0],
    minDistance: 22,
    maxDistance: 110,
    minPolar: 0.25,
    maxPolar: Math.PI / 2.15,
    autoRotate: true,
    near: 0.5,
    far: 400,
  },
  "array-ring-alpha": {
    position: [58, 2.4, 38],
    target: [50, 1.2, 48],
    minDistance: 4,
    maxDistance: 28,
    minPolar: 0.15,
    maxPolar: Math.PI / 2.05,
    autoRotate: false,
    near: 0.1,
    far: 200,
  },
  "heliospire-tower": {
    position: [6.5, 25.2, 7.5],
    target: [0, 18, 0],
    minDistance: 3,
    maxDistance: 55,
    minPolar: 0.2,
    maxPolar: Math.PI / 1.85,
    autoRotate: true,
    near: 0.1,
    far: 400,
  },
};

function resolveCamera(zone: ZoneId): CameraConfig {
  if (zone === "array-ring-alpha") return ZONE_CAMERAS["array-ring-alpha"];
  if (zone === "heliospire-tower") return ZONE_CAMERAS["heliospire-tower"];
  return ZONE_CAMERAS["aerial-overlook"];
}

function ZoneView() {
  const currentZone = useSceneStore((s) => s.currentZone);
  const { camera, controls } = useThree();

  useEffect(() => {
    const orbit = controls as OrbitControlsImpl | null;
    const config = resolveCamera(currentZone);

    camera.position.set(
      config.position[0],
      config.position[1],
      config.position[2],
    );
    camera.near = config.near;
    camera.far = config.far;
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

  const showField =
    currentZone === "aerial-overlook" || currentZone === "heliospire-tower";

  return (
    <>
      <Terrain />
      {showField && <AerialOverlook />}
      {currentZone === "array-ring-alpha" && <ArrayRingAlpha />}
      {currentZone === "heliospire-tower" && <HelioSpireTower />}
    </>
  );
}

function zoneHint(zone: ZoneId) {
  if (zone === "array-ring-alpha") {
    return "Array Ring Alpha — click a panel for Digital Twin data";
  }
  if (zone === "heliospire-tower") {
    return "HelioSpire Tower — observation deck with converging light vectors";
  }
  return "Aerial Overlook — drag to orbit";
}

/**
 * Experience canvas — zones 01–03.
 */
export default function ExperienceCanvas() {
  const currentZone = useSceneStore((s) => s.currentZone);

  return (
    <div className="h-dvh w-full bg-scene-sky">
      <Canvas
        camera={{
          position: [...ZONE_CAMERAS["aerial-overlook"].position],
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
      <span className="sr-only">{zoneHint(currentZone)}</span>
    </div>
  );
}
