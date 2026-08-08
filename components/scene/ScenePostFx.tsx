"use client";

import { Bloom, EffectComposer, SMAA } from "@react-three/postprocessing";
import { useEffect, useState } from "react";
import { useSceneStore } from "@/lib/scene-state";

/**
 * Phase 5 post-FX — bloom on specular/emissive peaks + SMAA.
 * Lives inside the existing R3F Canvas (no second renderer).
 */
export default function ScenePostFx() {
  const zone = useSceneStore((s) => s.currentZone);
  const isVault = zone === "subterranean-vault";
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(media.matches);
    const onChange = () => setReduceMotion(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const bloomIntensity = reduceMotion ? 0 : isVault ? 0.55 : 0.35;
  const bloomThreshold = isVault ? 0.55 : 0.75;

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        luminanceThreshold={bloomThreshold}
        luminanceSmoothing={0.25}
        intensity={bloomIntensity}
        mipmapBlur
      />
      <SMAA />
    </EffectComposer>
  );
}
