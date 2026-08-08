"use client";

import { useEffect } from "react";
import { getZone } from "@/content/zones";
import { useSceneStore } from "@/lib/scene-state";

/**
 * Zone-to-zone teleport overlay — brief fade so navigation is intentional,
 * not an instant hard cut. Vault elevator still owns its own descent.
 */
export default function ZoneTransitionManager() {
  const zoneTransition = useSceneStore((s) => s.zoneTransition);
  const setZoneTransition = useSceneStore((s) => s.setZoneTransition);
  const currentZone = useSceneStore((s) => s.currentZone);
  const zone = getZone(currentZone);

  useEffect(() => {
    if (zoneTransition <= 0) return;
    const fadeOut = window.setTimeout(() => setZoneTransition(0), 480);
    return () => window.clearTimeout(fadeOut);
  }, [zoneTransition, setZoneTransition]);

  // Also clear after zone settles (covers reduced timing edge cases)
  useEffect(() => {
    if (zoneTransition <= 0) return;
    const clear = window.setTimeout(() => setZoneTransition(0), 600);
    return () => window.clearTimeout(clear);
  }, [currentZone, setZoneTransition, zoneTransition]);

  const visible = zoneTransition > 0.05;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-terminal-bg transition-opacity duration-300"
      style={{ opacity: visible ? zoneTransition : 0 }}
      aria-hidden={!visible}
    >
      <p className="font-mono text-xs tracking-[0.28em] text-hologram-cyan uppercase">
        Teleport · {zone.shortLabel}
      </p>
    </div>
  );
}
