"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  Color,
  Fog,
  PMREMGenerator,
  Scene as ThreeScene,
  Vector3,
  type WebGLRenderTarget,
} from "three";
import { Sky as SkyImpl } from "three-stdlib";
import { useSceneStore } from "@/lib/scene-state";
import { getSunDirection } from "@/lib/sun";

/**
 * High-altitude (3,800 m) Rayleigh/Mie starting values — lower turbidity
 * and rayleigh than sea-level presets for a deeper zenith and harsher terminator.
 * Tuned further in Phase 1 C4; keep docs/06-photorealism-refactor.md in sync.
 */
export const CALDERA_SKY = {
  turbidity: 1.2,
  rayleigh: 1.4,
  mieCoefficient: 0.003,
  mieDirectionalG: 0.8,
} as const;

const SUN_VEC = new Vector3();
const FOG_DAY = new Color("#3a5f82");
const FOG_DUSK = new Color("#6a4828");
const FOG_NIGHT = new Color("#060a10");
const FOG_COLOR = new Color();

/** Quantize scrub updates so PMREM rebuilds ~every 15 local-solar minutes. */
function bakeKey(timeOfDay: number): number {
  return Math.round((((timeOfDay % 24) + 24) % 24) * 4) / 4;
}

function fogColorForElevation(elevationDeg: number, out: Color): Color {
  if (elevationDeg > 12) {
    return out.copy(FOG_DAY);
  }
  if (elevationDeg > -4) {
    const t = Math.min(1, Math.max(0, (elevationDeg + 4) / 16));
    return out.copy(FOG_DUSK).lerp(FOG_DAY, t);
  }
  if (elevationDeg > -12) {
    const t = Math.min(1, Math.max(0, (elevationDeg + 12) / 8));
    return out.copy(FOG_NIGHT).lerp(FOG_DUSK, t);
  }
  return out.copy(FOG_NIGHT);
}

/**
 * Atmospheric sky — baked to a PMREM environment/background so it fits the
 * outdoor camera far planes (no 450000-unit dome) and feeds PBR ambient later.
 * Hemisphere fill moved to Lighting.tsx (file boundary per photorealism doc).
 */
export default function Sky() {
  const timeOfDay = useSceneStore((s) => s.timeOfDay);
  const { gl, scene } = useThree();
  const targetRef = useRef<WebGLRenderTarget | null>(null);
  const fogRef = useRef<Fog | null>(null);

  const envScene = useMemo(() => {
    const s = new ThreeScene();
    const sky = new SkyImpl();
    // Unit box is enough for cube-camera bake (scattering is view-dir based).
    sky.scale.setScalar(1);
    const uniforms = sky.material.uniforms;
    uniforms["turbidity"].value = CALDERA_SKY.turbidity;
    uniforms["rayleigh"].value = CALDERA_SKY.rayleigh;
    uniforms["mieCoefficient"].value = CALDERA_SKY.mieCoefficient;
    uniforms["mieDirectionalG"].value = CALDERA_SKY.mieDirectionalG;
    s.add(sky);
    return s;
  }, []);

  const key = bakeKey(timeOfDay);

  useEffect(() => {
    const sky = envScene.children[0] as SkyImpl;
    const sun = getSunDirection(key);
    SUN_VEC.set(sun.x, sun.y, sun.z).normalize();
    sky.material.uniforms["sunPosition"].value.copy(SUN_VEC);

    const pmrem = new PMREMGenerator(gl);
    const next = pmrem.fromScene(envScene, 0, 0.1, 10);
    pmrem.dispose();

    const prev = targetRef.current;
    targetRef.current = next;
    scene.environment = next.texture;
    scene.background = next.texture;
    prev?.dispose();
  }, [envScene, gl, key, scene]);

  useEffect(() => {
    const fog = new Fog(FOG_DAY.clone(), 70, 220);
    fogRef.current = fog;
    scene.fog = fog;

    return () => {
      if (scene.fog === fog) {
        scene.fog = null;
      }
      fogRef.current = null;

      if (scene.environment === targetRef.current?.texture) {
        scene.environment = null;
      }
      if (scene.background === targetRef.current?.texture) {
        scene.background = null;
      }
      targetRef.current?.dispose();
      targetRef.current = null;
      envScene.clear();
    };
  }, [envScene, scene]);

  useFrame(() => {
    const fog = fogRef.current;
    if (!fog) return;
    const live = getSunDirection(useSceneStore.getState().timeOfDay);
    fogColorForElevation(live.elevationDeg, FOG_COLOR);
    fog.color.copy(FOG_COLOR);
  });

  return null;
}
