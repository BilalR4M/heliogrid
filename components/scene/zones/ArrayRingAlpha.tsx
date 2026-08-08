"use client";

import { ThreeEvent, useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import {
  createAluminumMaterial,
  createArrayPanelMaterial,
  createCellGridTexture,
  createRockMaterial,
  createSteelMaterial,
  setArrayPanelThermal,
} from "@/components/scene/materials/facilityPbr";
import {
  MODULE,
  createFrameGeometry,
  createGlassGeometry,
  createPostGeometry,
  moduleOrientation,
} from "@/components/scene/modules/trackingModule";
import {
  getOverlookHud,
  getPanelThermalNorm,
} from "@/lib/facility-sim";
import { useSceneStore } from "@/lib/scene-state";

const ROWS = 4;
const PANELS_PER_ROW = 24;
export const ARRAY_PANEL_COUNT = ROWS * PANELS_PER_ROW;

const ROW_RADIUS = [46, 49, 52, 55] as const;

/**
 * Zone 02 — Array Ring Alpha.
 * High-fidelity dual-axis tracking modules (glass + frame + posts), instanced.
 */
export default function ArrayRingAlpha() {
  const glassRef = useRef<THREE.InstancedMesh>(null);
  const frameRef = useRef<THREE.InstancedMesh>(null);
  const postRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const timeOfDay = useSceneStore((s) => s.timeOfDay);
  const thermalHeatmap = useSceneStore((s) => s.thermalHeatmap);
  const selectedPanelId = useSceneStore((s) => s.selectedPanelId);
  const selectPanel = useSceneStore((s) => s.selectPanel);

  const pad = useMemo(() => createRockMaterial("calderaRing"), []);
  const steel = useMemo(() => createSteelMaterial(), []);
  const aluminum = useMemo(() => createAluminumMaterial(), []);
  const gridMap = useMemo(() => createCellGridTexture(6, 10, 256), []);

  const { glassGeo, frameGeo, postGeo, glassMat } = useMemo(() => {
    const glass = createGlassGeometry();
    const frame = createFrameGeometry();
    const post = createPostGeometry();
    const temps = new Float32Array(ARRAY_PANEL_COUNT);
    const selects = new Float32Array(ARRAY_PANEL_COUNT);
    for (let i = 0; i < ARRAY_PANEL_COUNT; i += 1) {
      temps[i] = getPanelThermalNorm(i, 13);
      selects[i] = 0;
    }
    glass.setAttribute("aTemp", new THREE.InstancedBufferAttribute(temps, 1));
    glass.setAttribute(
      "aSelect",
      new THREE.InstancedBufferAttribute(selects, 1),
    );

    const mat = createArrayPanelMaterial();
    mat.map = gridMap;
    mat.needsUpdate = true;

    return {
      glassGeo: glass,
      frameGeo: frame,
      postGeo: post,
      glassMat: mat,
    };
  }, [gridMap]);

  useLayoutEffect(() => {
    materialRef.current = glassMat;
    return () => {
      glassGeo.dispose();
      frameGeo.dispose();
      postGeo.dispose();
      glassMat.dispose();
      steel.dispose();
      aluminum.dispose();
      pad.dispose();
      gridMap.dispose();
    };
  }, [
    glassGeo,
    frameGeo,
    postGeo,
    glassMat,
    steel,
    aluminum,
    pad,
    gridMap,
  ]);

  useLayoutEffect(() => {
    const glassMesh = glassRef.current;
    const frameMesh = frameRef.current;
    const postMesh = postRef.current;
    if (!glassMesh || !frameMesh || !postMesh) return;

    const sun = getOverlookHud(timeOfDay);
    const { tilt, yaw } = moduleOrientation(
      sun.sunElevationDeg,
      sun.sunAzimuthDeg,
    );

    const panel = new THREE.Object3D();
    const post = new THREE.Object3D();

    let index = 0;
    for (let row = 0; row < ROWS; row += 1) {
      const radius = ROW_RADIUS[row];
      for (let bay = 0; bay < PANELS_PER_ROW; bay += 1) {
        const angle =
          -Math.PI * 0.15 + (bay / (PANELS_PER_ROW - 1)) * Math.PI * 0.55;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        panel.position.set(x, MODULE.hingeY, z);
        panel.rotation.set(-tilt, yaw, 0);
        panel.scale.set(1, 1, 1);
        panel.updateMatrix();
        glassMesh.setMatrixAt(index, panel.matrix);
        frameMesh.setMatrixAt(index, panel.matrix);

        post.position.set(x, 0, z);
        post.rotation.set(0, yaw, 0);
        post.scale.set(1, 1, 1);
        post.updateMatrix();
        postMesh.setMatrixAt(index, post.matrix);

        index += 1;
      }
    }

    glassMesh.instanceMatrix.needsUpdate = true;
    frameMesh.instanceMatrix.needsUpdate = true;
    postMesh.instanceMatrix.needsUpdate = true;
    glassMesh.computeBoundingSphere();
    frameMesh.computeBoundingSphere();
    postMesh.computeBoundingSphere();
  }, [timeOfDay]);

  useLayoutEffect(() => {
    const attr = glassGeo.getAttribute(
      "aTemp",
    ) as THREE.InstancedBufferAttribute;
    for (let i = 0; i < ARRAY_PANEL_COUNT; i += 1) {
      attr.setX(i, getPanelThermalNorm(i, timeOfDay));
    }
    attr.needsUpdate = true;
  }, [glassGeo, timeOfDay]);

  useLayoutEffect(() => {
    const attr = glassGeo.getAttribute(
      "aSelect",
    ) as THREE.InstancedBufferAttribute;
    for (let i = 0; i < ARRAY_PANEL_COUNT; i += 1) {
      attr.setX(i, i === selectedPanelId ? 1 : 0);
    }
    attr.needsUpdate = true;
  }, [glassGeo, selectedPanelId]);

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

      <instancedMesh
        ref={postRef}
        args={[postGeo, steel, ARRAY_PANEL_COUNT]}
        castShadow
        receiveShadow
        frustumCulled
      />
      <instancedMesh
        ref={frameRef}
        args={[frameGeo, aluminum, ARRAY_PANEL_COUNT]}
        castShadow
        frustumCulled
      />
      <instancedMesh
        ref={glassRef}
        args={[glassGeo, glassMat, ARRAY_PANEL_COUNT]}
        castShadow
        receiveShadow
        frustumCulled
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
