"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import {
  lightVectorsFragment,
  lightVectorsVertex,
} from "@/components/scene/shaders/lightVectors.glsl";
import { SCENE_COLORS } from "@/components/scene/PlaceholderCaldera";
import { useSceneStore } from "@/lib/scene-state";

const RECEIVER = new THREE.Vector3(0, 25.6, 0);
const BEAM_SOURCES: [number, number, number][] = (() => {
  const points: [number, number, number][] = [];
  const rings = [28, 38, 48, 58, 68];
  for (const radius of rings) {
    const count = radius <= 38 ? 8 : 12;
    for (let i = 0; i < count; i += 1) {
      const angle = (i / count) * Math.PI * 2 + radius * 0.01;
      points.push([
        Math.cos(angle) * radius,
        0.8,
        Math.sin(angle) * radius,
      ]);
    }
  }
  return points;
})();

const BEAM_COUNT = BEAM_SOURCES.length;

function LightVectorBeams() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const lightVectors = useSceneStore((s) => s.lightVectors);
  const timeOfDay = useSceneStore((s) => s.timeOfDay);

  const { geometry, material } = useMemo(() => {
    const geo = new THREE.CylinderGeometry(0.04, 0.018, 1, 5, 1, true);
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uIntensity: { value: 1 },
        uColor: { value: new THREE.Color("#ffe2a0") },
      },
      vertexShader: lightVectorsVertex,
      fragmentShader: lightVectorsFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return { geometry: geo, material: mat };
  }, []);

  useLayoutEffect(() => {
    materialRef.current = material;
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const dummy = new THREE.Object3D();
    const up = new THREE.Vector3(0, 1, 0);
    const dir = new THREE.Vector3();

    for (let i = 0; i < BEAM_COUNT; i += 1) {
      const src = BEAM_SOURCES[i];
      const start = new THREE.Vector3(src[0], src[1], src[2]);
      dir.subVectors(RECEIVER, start);
      const length = dir.length();
      dummy.position.copy(start).addScaledVector(dir, 0.5);
      dummy.scale.set(1, length, 1);
      dummy.quaternion.setFromUnitVectors(up, dir.clone().normalize());
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, []);

  useFrame((_, delta) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uTime.value += delta;
    // Daylight strengthens beam visibility; night dims but does not hide when toggled on.
    const day = Math.max(0.25, Math.sin(((timeOfDay - 6) / 12) * Math.PI));
    materialRef.current.uniforms.uIntensity.value = lightVectors ? day : 0;
  });

  if (!lightVectors) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, BEAM_COUNT]}
      frustumCulled
    />
  );
}

/**
 * Zone 03 — HelioSpire Observation Deck.
 * Mounted with the aerial LOD field for a 360° view; adds deck + converging beams.
 */
export default function HelioSpireTower() {
  return (
    <group>
      {/* Observation deck ring (~250m lore stand-in at aerial scale) */}
      <mesh position={[0, 23.4, 0]} receiveShadow>
        <cylinderGeometry args={[3.2, 3.2, 0.25, 24]} />
        <meshStandardMaterial
          color={SCENE_COLORS.steel}
          roughness={0.45}
          metalness={0.75}
        />
      </mesh>
      <mesh position={[0, 24.1, 0]}>
        <torusGeometry args={[3.15, 0.06, 6, 40]} />
        <meshStandardMaterial
          color={SCENE_COLORS.steel}
          roughness={0.4}
          metalness={0.85}
        />
      </mesh>

      {/* Receiver core */}
      <mesh position={[0, 25.6, 0]}>
        <sphereGeometry args={[0.55, 16, 16]} />
        <meshStandardMaterial
          color="#fff1d6"
          emissive="#e0a53a"
          emissiveIntensity={1.4}
          roughness={0.25}
          metalness={0.4}
        />
      </mesh>
      <pointLight
        position={[0, 25.6, 0]}
        intensity={2.2}
        distance={40}
        color="#ffe2a0"
      />

      <LightVectorBeams />
    </group>
  );
}
