"use client";

import { useSceneStore } from "@/lib/scene-state";

/** Infrared thermal heatmap on/off — explicit state for Array Ring Alpha. */
export default function ThermalToggle() {
  const currentZone = useSceneStore((s) => s.currentZone);
  const thermalHeatmap = useSceneStore((s) => s.thermalHeatmap);
  const toggleThermalHeatmap = useSceneStore((s) => s.toggleThermalHeatmap);

  if (currentZone !== "array-ring-alpha") return null;

  return (
    <div className="absolute bottom-20 left-4 z-20 sm:bottom-24 sm:left-6">
      <button
        type="button"
        onClick={toggleThermalHeatmap}
        aria-pressed={thermalHeatmap}
        className={`pointer-events-auto border px-3 py-2 font-mono text-[10px] tracking-[0.18em] uppercase backdrop-blur-sm transition-colors ${
          thermalHeatmap
            ? "border-hud-amber/70 bg-hud-amber/15 text-hud-amber"
            : "border-terminal-muted/40 bg-terminal-bg/85 text-terminal-muted hover:text-terminal-text"
        }`}
      >
        IR Thermal · {thermalHeatmap ? "On" : "Off"}
      </button>
    </div>
  );
}
