"use client";

import { SCENE_COLORS } from "@/components/scene/PlaceholderCaldera";

/** Thin-atmosphere sky stand-in — deeper blue, harsh contrast (3,800m lore). */
export default function Sky() {
  return (
    <>
      <color attach="background" args={[SCENE_COLORS.sky]} />
      <fog attach="fog" args={[SCENE_COLORS.sky, 55, 160]} />
      <hemisphereLight args={["#6a90b8", "#3a2418", 0.35]} />
    </>
  );
}
