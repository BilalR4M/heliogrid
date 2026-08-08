"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import {
  energyParticlesFragment,
  energyParticlesVertex,
} from "@/components/scene/shaders/energyParticles.glsl";
import { SCENE_COLORS } from "@/components/scene/PlaceholderCaldera";
import { getVaultFlow } from "@/lib/facility-sim";
import { useSceneStore } from "@/lib/scene-state";

const PARTICLE_COUNT = 480;
const ELEVATOR_SECONDS = 3.2;
const SURFACE_Y = 2.5;
const VAULT_Y = -18;

function easeInOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function EnergyParticleStreams() {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const timeOfDay = useSceneStore((s) => s.timeOfDay);

  const { geometry, material } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const offsets = new Float32Array(PARTICLE_COUNT);
    const lanes = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      const lane = i % 6;
      const row = Math.floor(i / 80);
      positions[i * 3] = (lane - 2.5) * 1.8 + (row % 2) * 0.4;
      positions[i * 3 + 1] = -18;
      positions[i * 3 + 2] = -4 + row * 2.2;
      offsets[i] = Math.random();
      lanes[i] = lane;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aOffset", new THREE.BufferAttribute(offsets, 1));
    geo.setAttribute("aLane", new THREE.BufferAttribute(lanes, 1));

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uDirection: { value: 1 },
        uSpeed: { value: 0.35 },
        uChargeColor: { value: new THREE.Color("#4ec9e8") },
        uDischargeColor: { value: new THREE.Color("#e0a53a") },
      },
      vertexShader: energyParticlesVertex,
      fragmentShader: energyParticlesFragment,
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

  useFrame((_, delta) => {
    if (!materialRef.current) return;
    const flow = getVaultFlow(timeOfDay);
    materialRef.current.uniforms.uTime.value += delta;
    materialRef.current.uniforms.uDirection.value =
      flow.mode === "discharge" ? -1 : flow.mode === "charge" ? 1 : 0.15;
    materialRef.current.uniforms.uSpeed.value = 0.2 + flow.density * 0.55;
    if (pointsRef.current) {
      pointsRef.current.visible = flow.mode !== "idle" || flow.density > 0.2;
    }
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}

function ElevatorRide() {
  const { camera, controls } = useThree();
  const elevatorActive = useSceneStore((s) => s.elevatorActive);
  const setElevatorProgress = useSceneStore((s) => s.setElevatorProgress);
  const setElevatorActive = useSceneStore((s) => s.setElevatorActive);
  const progress = useRef(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(media.matches);
    const onChange = () => setReduceMotion(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    progress.current = 0;
    if (reduceMotion) {
      setElevatorProgress(1);
      setElevatorActive(false);
      camera.position.set(7, VAULT_Y + 2.2, 11);
      camera.lookAt(0, VAULT_Y, 0);
      const orbit = controls as { enabled?: boolean; target: THREE.Vector3; update: () => void } | null;
      if (orbit) {
        orbit.enabled = true;
        orbit.target.set(0, VAULT_Y, 0);
        orbit.update();
      }
    }
  }, [
    camera,
    controls,
    reduceMotion,
    setElevatorActive,
    setElevatorProgress,
    elevatorActive,
  ]);

  useFrame((_, delta) => {
    if (!elevatorActive || reduceMotion) return;

    const orbit = controls as {
      enabled?: boolean;
      target: THREE.Vector3;
      update: () => void;
    } | null;
    if (orbit) orbit.enabled = false;

    progress.current = Math.min(1, progress.current + delta / ELEVATOR_SECONDS);
    const t = easeInOut(progress.current);
    setElevatorProgress(t);

    const y = THREE.MathUtils.lerp(SURFACE_Y, VAULT_Y + 2.2, t);
    camera.position.set(5.5, y, 9);
    camera.lookAt(0, y - 2, 0);

    if (progress.current >= 1) {
      setElevatorActive(false);
      if (orbit) {
        orbit.enabled = true;
        orbit.target.set(0, VAULT_Y, 0);
        orbit.update();
      }
    }
  });

  return null;
}

/**
 * Zone 04 — Subterranean Battery Vault.
 * Elevator descent into LFP cooling halls; particle streams follow charge/discharge.
 */
export default function SubterraneanVault() {
  return (
    <group>
      <color attach="background" args={["#05070a"]} />
      <fog attach="fog" args={["#05070a", 8, 42]} />
      <ambientLight intensity={0.12} />
      <pointLight position={[0, -12, 0]} intensity={1.2} distance={30} color="#4ec9e8" />
      <pointLight position={[6, -16, 8]} intensity={0.6} distance={20} color="#e0a53a" />

      {/* Shaft */}
      <mesh position={[0, -8, 0]}>
        <cylinderGeometry args={[3.2, 3.2, 22, 16, 1, true]} />
        <meshStandardMaterial
          color="#1a1f28"
          side={THREE.BackSide}
          roughness={0.95}
          metalness={0.2}
        />
      </mesh>

      {/* Vault floor hall */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, VAULT_Y - 0.05, 0]} receiveShadow>
        <planeGeometry args={[28, 22]} />
        <meshStandardMaterial color="#12161c" roughness={0.9} metalness={0.15} />
      </mesh>

      {/* LFP battery racks */}
      {Array.from({ length: 5 }, (_, row) =>
        Array.from({ length: 6 }, (_, col) => (
          <mesh
            key={`${row}-${col}`}
            position={[(col - 2.5) * 1.8, VAULT_Y + 1.1, -4 + row * 2.2]}
            castShadow
          >
            <boxGeometry args={[1.4, 2.2, 0.7]} />
            <meshStandardMaterial
              color={SCENE_COLORS.panel}
              roughness={0.4}
              metalness={0.55}
              emissive={col % 2 === 0 ? "#0a2a30" : "#2a1a08"}
              emissiveIntensity={0.35}
            />
          </mesh>
        )),
      )}

      {/* Bus bar */}
      <mesh position={[0, VAULT_Y + 3.2, 0]}>
        <boxGeometry args={[12, 0.12, 0.35]} />
        <meshStandardMaterial
          color={SCENE_COLORS.steel}
          metalness={0.9}
          roughness={0.3}
        />
      </mesh>

      <EnergyParticleStreams />
      <ElevatorRide />
    </group>
  );
}
