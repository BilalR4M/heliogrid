"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import {
  createPanelMaterial,
  createReceiverMaterial,
  createSteelMaterial,
} from "@/components/scene/materials/facilityPbr";

const RING_DEFS = [
  { radius: 28, count: 36, scale: [3.2, 0.12, 1.6] as const },
  { radius: 38, count: 48, scale: [3.4, 0.12, 1.7] as const },
  { radius: 48, count: 56, scale: [3.6, 0.12, 1.8] as const },
  { radius: 58, count: 64, scale: [3.8, 0.12, 1.9] as const },
  { radius: 68, count: 72, scale: [4.0, 0.12, 2.0] as const },
] as const;

const TOTAL_INSTANCES = RING_DEFS.reduce((sum, ring) => sum + ring.count, 0);

/**
 * Zone 01 — whole-field LOD: a few hundred instanced panel *blocks*
 * representing the 3.2M-panel narrative field at aerial distance.
 * Never literal per-panel geometry at this range.
 */
export default function AerialOverlook() {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const geometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const material = useMemo(() => createPanelMaterial("lod"), []);
  const steel = useMemo(() => createSteelMaterial(), []);
  const receiver = useMemo(() => createReceiverMaterial(), []);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const dummy = new THREE.Object3D();
    let index = 0;

    for (const ring of RING_DEFS) {
      for (let i = 0; i < ring.count; i += 1) {
        const angle = (i / ring.count) * Math.PI * 2;
        dummy.position.set(
          Math.cos(angle) * ring.radius,
          0.55,
          Math.sin(angle) * ring.radius,
        );
        dummy.scale.set(ring.scale[0], ring.scale[1], ring.scale[2]);
        dummy.rotation.set(0, -angle + Math.PI / 2, 0);
        dummy.updateMatrix();
        mesh.setMatrixAt(index, dummy.matrix);
        index += 1;
      }
    }

    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, []);

  useLayoutEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
      steel.dispose();
      receiver.dispose();
    };
  }, [geometry, material, steel, receiver]);

  return (
    <group>
      <instancedMesh
        ref={meshRef}
        args={[geometry, material, TOTAL_INSTANCES]}
        castShadow
        receiveShadow
        frustumCulled
      />

      {/* Central Optics Tower — aerial-scale stand-in for the 250m spire */}
      <mesh position={[0, 12, 0]} castShadow material={steel}>
        <cylinderGeometry args={[0.55, 1.6, 24, 8]} />
      </mesh>
      <mesh position={[0, 25.2, 0]} castShadow material={receiver}>
        <coneGeometry args={[1.4, 3.2, 8]} />
      </mesh>
    </group>
  );
}
