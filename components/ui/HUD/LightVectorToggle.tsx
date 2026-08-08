"use client";

import { useSceneStore } from "@/lib/scene-state";

/** Light-beam vector visualization on/off — HelioSpire Observation Deck. */
export default function LightVectorToggle() {
  const currentZone = useSceneStore((s) => s.currentZone);
  const lightVectors = useSceneStore((s) => s.lightVectors);
  const toggleLightVectors = useSceneStore((s) => s.toggleLightVectors);

  if (currentZone !== "heliospire-tower") return null;

  return (
    <div className="absolute bottom-20 left-4 z-20 sm:bottom-24 sm:left-6">
      <button
        type="button"
        onClick={toggleLightVectors}
        aria-pressed={lightVectors}
        className={`pointer-events-auto border px-3 py-2 font-mono text-[10px] tracking-[0.18em] uppercase backdrop-blur-sm transition-colors ${
          lightVectors
            ? "border-hud-amber/70 bg-hud-amber/15 text-hud-amber"
            : "border-terminal-muted/40 bg-terminal-bg/85 text-terminal-muted hover:text-terminal-text"
        }`}
      >
        Light Vectors · {lightVectors ? "On" : "Off"}
      </button>
    </div>
  );
}
