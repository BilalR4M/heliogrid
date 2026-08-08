"use client";

import { useEffect, useState } from "react";
import { getZone } from "@/content/zones";
import { getVaultFlow } from "@/lib/facility-sim";
import { useSceneStore } from "@/lib/scene-state";

/** Vault instrumentation — SOC, flow direction, elevator status. */
export default function VaultReadout() {
  const timeOfDay = useSceneStore((s) => s.timeOfDay);
  const currentZone = useSceneStore((s) => s.currentZone);
  const elevatorProgress = useSceneStore((s) => s.elevatorProgress);
  const elevatorActive = useSceneStore((s) => s.elevatorActive);
  const [flow, setFlow] = useState(() => getVaultFlow(timeOfDay));

  useEffect(() => {
    setFlow(getVaultFlow(timeOfDay));
  }, [timeOfDay]);

  if (currentZone !== "subterranean-vault") return null;

  const zone = getZone("subterranean-vault");
  const modeLabel =
    flow.mode === "charge"
      ? "CHARGE"
      : flow.mode === "discharge"
        ? "DISCHARGE"
        : "IDLE";

  return (
    <aside
      className="pointer-events-none absolute top-4 left-4 z-20 max-w-[min(100%-2rem,18rem)] border border-terminal-muted/30 bg-terminal-bg/90 p-3 font-mono shadow-lg backdrop-blur-sm sm:top-6 sm:left-6 sm:p-4"
      aria-label="Subterranean vault readout"
    >
      <p className="text-[10px] tracking-[0.22em] text-hud-green uppercase">
        {zone.shortLabel}
      </p>
      <p className="mt-2 text-xs text-terminal-text">LFP cooling vault</p>

      <dl className="mt-3 space-y-2 text-xs">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-terminal-muted tracking-wider uppercase">Mode</dt>
          <dd
            className={`tabular-nums ${
              flow.mode === "charge"
                ? "text-hologram-cyan"
                : flow.mode === "discharge"
                  ? "text-hud-amber"
                  : "text-terminal-text"
            }`}
          >
            {modeLabel}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-terminal-muted tracking-wider uppercase">Flow</dt>
          <dd className="tabular-nums text-terminal-text">
            {flow.flowMw >= 0 ? "+" : ""}
            {flow.flowMw.toFixed(0)} MW
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-terminal-muted tracking-wider uppercase">SOC</dt>
          <dd className="tabular-nums text-hud-amber">
            {flow.socPct.toFixed(1)} %
          </dd>
        </div>
      </dl>

      {(elevatorActive || elevatorProgress < 1) && (
        <p className="mt-3 text-[10px] tracking-wider text-terminal-muted uppercase">
          Elevator {Math.round(elevatorProgress * 100)}%
        </p>
      )}
      <p className="mt-2 text-[10px] leading-relaxed text-terminal-muted">
        Particle streams reverse on discharge
      </p>
    </aside>
  );
}
