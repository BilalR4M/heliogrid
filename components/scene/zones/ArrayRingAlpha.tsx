"use client";

import { ThreeEvent, useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import {
  createArrayPanelMaterial,
  createRockMaterial,
  createSteelMaterial,
  setArrayPanelThermal,
} from "@/components/scene/materials/facilityPbr";
import {
  getOverlookHud,
  getPanelThermalNorm,
} from "@/lib/facility-sim";
import { useSceneStore } from "@/lib/scene-state";

const ROWS = 4;
const PANELS_PER_ROW = 24;
export const ARRAY_PANEL_COUNT = ROWS * PANELS_PER_ROW;

const ROW_RADIUS = [46, 49, 52, 55] as const;
const PANEL_WIDTH = 2.1;
const PANEL_HEIGHT = 1.05;
const PANEL_DEPTH = 0.06;

/**
 * Zone 02 — Array Ring Alpha.
 * Only local viewing-radius panels are real InstancedMesh instances.
 */
export default function ArrayRingAlpha() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const timeOfDay = useSceneStore((s) => s.timeOfDay);
  const thermalHeatmap = useSceneStore((s) => s.thermalHeatmap);
  const selectedPanelId = useSceneStore((s) => s.selectedPanelId);
  const selectPanel = useSceneStore((s) => s.selectPanel);

  const steel = useMemo(() => createSteelMaterial(), []);
  const pad = useMemo(() => createRockMaterial("calderaRing"), []);

  const { geometry, material } = useMemo(() => {
    const geo = new THREE.BoxGeometry(PANEL_WIDTH, PANEL_HEIGHT, PANEL_DEPTH);
    const temps = new Float32Array(ARRAY_PANEL_COUNT);
    const selects = new Float32Array(ARRAY_PANEL_COUNT);
    for (let i = 0; i < ARRAY_PANEL_COUNT; i += 1) {
      temps[i] = getPanelThermalNorm(i, 13);
      selects[i] = 0;
    }
    geo.setAttribute("aTemp", new THREE.InstancedBufferAttribute(temps, 1));
    geo.setAttribute("aSelect", new THREE.InstancedBufferAttribute(selects, 1));

    const mat = createArrayPanelMaterial();
    return { geometry: geo, material: mat };
  }, []);

  useLayoutEffect(() => {
    materialRef.current = material;
    return () => {
      geometry.dispose();
      material.dispose();
      steel.dispose();
      pad.dispose();
    };
  }, [geometry, material, steel, pad]);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const dummy = new THREE.Object3D();
    const sun = getOverlookHud(timeOfDay);
    const elev = Math.max(0, sun.sunElevationDeg);
    const stepDeg = Math.round(elev / 5) * 5;
    const tilt = THREE.MathUtils.degToRad(Math.min(55, stepDeg) * 0.7);

    let index = 0;
    for (let row = 0; row < ROWS; row += 1) {
      const radius = ROW_RADIUS[row];
      for (let bay = 0; bay < PANELS_PER_ROW; bay += 1) {
        const angle =
          -Math.PI * 0.15 + (bay / (PANELS_PER_ROW - 1)) * Math.PI * 0.55;
        dummy.position.set(
          Math.cos(angle) * radius,
          1.15,
          Math.sin(angle) * radius,
        );
        dummy.rotation.set(-tilt, -angle + Math.PI / 2, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        mesh.setMatrixAt(index, dummy.matrix);
        index += 1;
      }
    }

    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [timeOfDay]);

  useLayoutEffect(() => {
    const attr = geometry.getAttribute(
      "aTemp",
    ) as THREE.InstancedBufferAttribute;
    for (let i = 0; i < ARRAY_PANEL_COUNT; i += 1) {
      attr.setX(i, getPanelThermalNorm(i, timeOfDay));
    }
    attr.needsUpdate = true;
  }, [geometry, timeOfDay]);

  useLayoutEffect(() => {
    const attr = geometry.getAttribute(
      "aSelect",
    ) as THREE.InstancedBufferAttribute;
    for (let i = 0; i < ARRAY_PANEL_COUNT; i += 1) {
      attr.setX(i, i === selectedPanelId ? 1 : 0);
    }
    attr.needsUpdate = true;
  }, [geometry, selectedPanelId]);

  useFrame(() => {
    if (!materialRef.current) return;
    setArrayPanelThermal(materialRef.current, thermalHeatmap);
  });

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    const id = event.instanceId;
    if (id === undefined) return;
    selectPanel(selectedPanelId === id ? null : id);
  };

  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[40, 0.02, 40]}
        receiveShadow
        material={pad}
      >
        <circleGeometry args={[22, 48]} />
      </mesh>

      {ROW_RADIUS.map((radius, row) =>
        Array.from({ length: 8 }, (_, i) => {
          const bay = i * 3;
          const angle =
            -Math.PI * 0.15 + (bay / (PANELS_PER_ROW - 1)) * Math.PI * 0.55;
          return (
            <mesh
              key={`${row}-${bay}`}
              position={[
                Math.cos(angle) * radius,
                0.55,
                Math.sin(angle) * radius,
              ]}
              material={steel}
            >
              <cylinderGeometry args={[0.06, 0.08, 1.1, 6]} />
            </mesh>
          );
        }),
      )}

      <instancedMesh
        ref={meshRef}
        args={[geometry, material, ARRAY_PANEL_COUNT]}
        castShadow
        receiveShadow
        onClick={handleClick}
        onPointerOver={() => {
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      />
    </group>
  );
}
