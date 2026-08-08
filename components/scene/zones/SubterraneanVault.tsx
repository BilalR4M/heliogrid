"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import {
  createVaultBusMaterial,
  createVaultConduitMaterial,
  createVaultFloorMaterial,
  createVaultRackMaterial,
  createVaultShaftMaterial,
  createVaultStatusStripMaterial,
} from "@/components/scene/materials/facilityPbr";
import {
  energyParticlesFragment,
  energyParticlesVertex,
} from "@/components/scene/shaders/energyParticles.glsl";
import { getVaultFlow, type VaultFlowMode } from "@/lib/facility-sim";
import { useSceneStore } from "@/lib/scene-state";

const PARTICLE_COUNT = 480;
const ELEVATOR_SECONDS = 3.2;
const SURFACE_Y = 2.5;
const VAULT_Y = -18;
const RACK_ROWS = 5;
const RACK_COLS = 6;
const RACK_COUNT = RACK_ROWS * RACK_COLS;

const ACCENT = {
  charge: "#4ec9e8",
  discharge: "#e0a53a",
  idle: "#6a7a88",
} as const;

function easeInOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function accentForMode(mode: VaultFlowMode): string {
  if (mode === "discharge") return ACCENT.discharge;
  if (mode === "charge") return ACCENT.charge;
  return ACCENT.idle;
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
        uChargeColor: { value: new THREE.Color(ACCENT.charge) },
        uDischargeColor: { value: new THREE.Color(ACCENT.discharge) },
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
      const orbit = controls as {
        enabled?: boolean;
        target: THREE.Vector3;
        update: () => void;
      } | null;
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

function VaultLighting() {
  const timeOfDay = useSceneStore((s) => s.timeOfDay);
  const flow = getVaultFlow(timeOfDay);
  const accent = accentForMode(flow.mode);
  const keyIntensity = flow.mode === "idle" ? 0.75 : 1.15;

  return (
    <>
      <ambientLight intensity={0.22} color="#1a2430" />
      <hemisphereLight args={["#2a3a4a", "#0a0c10", 0.35]} />
      <pointLight
        position={[-6, -14.5, -2]}
        intensity={keyIntensity}
        distance={18}
        color={accent}
      />
      <pointLight
        position={[6, -14.5, -2]}
        intensity={keyIntensity}
        distance={18}
        color={accent}
      />
      <pointLight
        position={[0, -14.5, 6]}
        intensity={0.7}
        distance={16}
        color="#b0c4d8"
      />
      <spotLight
        position={[0, -2, 0]}
        angle={0.45}
        penumbra={0.5}
        intensity={1.4}
        distance={28}
        color="#9eb6c8"
        castShadow={false}
      />
    </>
  );
}

function VaultRacks({ mode }: { mode: VaultFlowMode }) {
  const rackRef = useRef<THREE.InstancedMesh>(null);
  const stripRef = useRef<THREE.InstancedMesh>(null);

  const rackGeo = useMemo(() => new THREE.BoxGeometry(1.4, 2.2, 0.7), []);
  const stripGeo = useMemo(() => new THREE.BoxGeometry(1.25, 0.08, 0.08), []);

  const emissive = accentForMode(mode);
  const rackIntensity = mode === "idle" ? 0.18 : 0.45;
  const stripIntensity = mode === "idle" ? 0.35 : 1.1;

  const rackMat = useMemo(
    () => createVaultRackMaterial(emissive, rackIntensity),
    [emissive, rackIntensity],
  );
  const stripMat = useMemo(
    () => createVaultStatusStripMaterial(emissive, stripIntensity),
    [emissive, stripIntensity],
  );

  useLayoutEffect(() => {
    const racks = rackRef.current;
    const strips = stripRef.current;
    if (!racks || !strips) return;

    const dummy = new THREE.Object3D();
    let index = 0;
    for (let row = 0; row < RACK_ROWS; row += 1) {
      for (let col = 0; col < RACK_COLS; col += 1) {
        const x = (col - 2.5) * 1.8;
        const z = -4 + row * 2.2;
        dummy.position.set(x, VAULT_Y + 1.1, z);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        racks.setMatrixAt(index, dummy.matrix);

        dummy.position.set(x, VAULT_Y + 2.05, z + 0.38);
        dummy.updateMatrix();
        strips.setMatrixAt(index, dummy.matrix);
        index += 1;
      }
    }
    racks.instanceMatrix.needsUpdate = true;
    strips.instanceMatrix.needsUpdate = true;
    racks.computeBoundingSphere();
    strips.computeBoundingSphere();
  }, []);

  useLayoutEffect(() => {
    return () => {
      rackGeo.dispose();
      stripGeo.dispose();
      rackMat.dispose();
      stripMat.dispose();
    };
  }, [rackGeo, stripGeo, rackMat, stripMat]);

  return (
    <>
      <instancedMesh
        ref={rackRef}
        args={[rackGeo, rackMat, RACK_COUNT]}
        castShadow
        receiveShadow
        frustumCulled
      />
      <instancedMesh
        ref={stripRef}
        args={[stripGeo, stripMat, RACK_COUNT]}
        frustumCulled
      />
    </>
  );
}

function VaultConduits({ mode }: { mode: VaultFlowMode }) {
  const emissive = accentForMode(mode);
  const intensity = mode === "idle" ? 0.25 : 0.85;
  const mat = useMemo(
    () => createVaultConduitMaterial(emissive, intensity),
    [emissive, intensity],
  );

  useLayoutEffect(() => {
    return () => {
      mat.dispose();
    };
  }, [mat]);

  return (
    <group>
      <mesh position={[0, VAULT_Y + 3.55, -2]} material={mat}>
        <boxGeometry args={[14, 0.06, 0.06]} />
      </mesh>
      <mesh position={[-5.4, VAULT_Y + 2.4, 0]} material={mat}>
        <cylinderGeometry args={[0.04, 0.04, 8.5, 6]} />
      </mesh>
      <mesh position={[5.4, VAULT_Y + 2.4, 0]} material={mat}>
        <cylinderGeometry args={[0.04, 0.04, 8.5, 6]} />
      </mesh>
      <mesh
        position={[-5.4, VAULT_Y + 3.55, -2]}
        rotation={[0, 0, Math.PI / 2]}
        material={mat}
      >
        <cylinderGeometry args={[0.035, 0.035, 2.2, 6]} />
      </mesh>
      <mesh
        position={[5.4, VAULT_Y + 3.55, -2]}
        rotation={[0, 0, Math.PI / 2]}
        material={mat}
      >
        <cylinderGeometry args={[0.035, 0.035, 2.2, 6]} />
      </mesh>
    </group>
  );
}

/**
 * Zone 04 — Subterranean Battery Vault.
 * Elevator descent into LFP cooling halls; particle streams follow charge/discharge.
 */
export default function SubterraneanVault() {
  const timeOfDay = useSceneStore((s) => s.timeOfDay);
  const mode = getVaultFlow(timeOfDay).mode;

  const shaftMat = useMemo(() => createVaultShaftMaterial(), []);
  const floorMat = useMemo(() => createVaultFloorMaterial(), []);
  const busMat = useMemo(() => createVaultBusMaterial(), []);

  useLayoutEffect(() => {
    return () => {
      shaftMat.dispose();
      floorMat.dispose();
      busMat.dispose();
    };
  }, [shaftMat, floorMat, busMat]);

  return (
    <group>
      <color attach="background" args={["#05070a"]} />
      <fog attach="fog" args={["#080b10", 12, 48]} />
      <VaultLighting />

      <mesh position={[0, -8, 0]} material={shaftMat}>
        <cylinderGeometry args={[3.2, 3.2, 22, 16, 1, true]} />
      </mesh>

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, VAULT_Y - 0.05, 0]}
        receiveShadow
        material={floorMat}
      >
        <planeGeometry args={[28, 22]} />
      </mesh>

      <VaultRacks mode={mode} />
      <VaultConduits mode={mode} />

      <mesh position={[0, VAULT_Y + 3.2, 0]} material={busMat} castShadow>
        <boxGeometry args={[12, 0.12, 0.35]} />
      </mesh>

      <EnergyParticleStreams />
      <ElevatorRide />
    </group>
  );
}
