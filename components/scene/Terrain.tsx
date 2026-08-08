"use client";

import { useLayoutEffect, useMemo } from "react";
import { Vector2 } from "three";
import {
  createRockMaterial,
  createRockNormalMap,
} from "@/components/scene/materials/facilityPbr";

/** Shared caldera bowl — rock floor + rim for outdoor zones. */
export default function Terrain() {
  const normalMap = useMemo(() => createRockNormalMap(128), []);
  const floor = useMemo(
    () =>
      createRockMaterial("calderaRock", {
        normalMap,
        normalScale: new Vector2(0.55, 0.55),
      }),
    [normalMap],
  );
  const ring = useMemo(
    () =>
      createRockMaterial("calderaRing", {
        normalMap,
        normalScale: new Vector2(0.7, 0.7),
      }),
    [normalMap],
  );
  const rim = useMemo(
    () =>
      createRockMaterial("calderaRim", {
        normalMap,
        normalScale: new Vector2(0.85, 0.85),
      }),
    [normalMap],
  );

  useLayoutEffect(() => {
    return () => {
      floor.dispose();
      ring.dispose();
      rim.dispose();
      normalMap.dispose();
    };
  }, [floor, ring, rim, normalMap]);

  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.05, 0]}
        receiveShadow
        material={floor}
      >
        <circleGeometry args={[18, 64]} />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.4, 0]}
        receiveShadow
        material={ring}
      >
        <ringGeometry args={[18, 78, 72]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 1.2, 0]} material={rim}>
        <torusGeometry args={[78, 2.4, 8, 72]} />
      </mesh>
    </group>
  );
}
