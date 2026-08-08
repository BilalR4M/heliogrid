"use client";

import { useEffect, useState } from "react";
import { getPanelTwin } from "@/lib/facility-sim";
import { useSceneStore } from "@/lib/scene-state";

/** Per-panel Digital Twin card — Array Ring Alpha. */
export default function DigitalTwinCard() {
  const selectedPanelId = useSceneStore((s) => s.selectedPanelId);
  const timeOfDay = useSceneStore((s) => s.timeOfDay);
  const currentZone = useSceneStore((s) => s.currentZone);
  const selectPanel = useSceneStore((s) => s.selectPanel);
  const [twin, setTwin] = useState(() =>
    selectedPanelId === null ? null : getPanelTwin(selectedPanelId, timeOfDay),
  );

  useEffect(() => {
    if (selectedPanelId === null) {
      setTwin(null);
      return;
    }
    setTwin(getPanelTwin(selectedPanelId, timeOfDay));
  }, [selectedPanelId, timeOfDay]);

  if (currentZone !== "array-ring-alpha" || !twin) return null;

  return (
    <aside
      className="absolute top-4 right-4 z-20 w-[min(100%-2rem,17rem)] border border-terminal-muted/30 bg-terminal-bg/90 p-3 font-mono shadow-lg backdrop-blur-sm sm:top-6 sm:right-6 sm:p-4"
      aria-label={`Digital Twin panel ${twin.panelId}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] tracking-[0.22em] text-hud-green uppercase">
            Digital Twin
          </p>
          <p className="mt-1 text-xs text-terminal-text">
            Row {twin.row} · Bay {twin.bay}
          </p>
        </div>
        <button
          type="button"
          onClick={() => selectPanel(null)}
          className="pointer-events-auto text-[10px] tracking-wider text-terminal-muted uppercase hover:text-terminal-text"
        >
          Close
        </button>
      </div>

      <dl className="mt-3 space-y-2 text-xs">
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-terminal-muted tracking-wider uppercase">
            Cell Temp
          </dt>
          <dd className="text-sm text-hud-amber tabular-nums">
            {twin.cellTempC.toFixed(1)} °C
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-terminal-muted tracking-wider uppercase">
            Voltage
          </dt>
          <dd className="tabular-nums text-terminal-text">
            {twin.voltageV.toFixed(2)} V
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-terminal-muted tracking-wider uppercase">
            Efficiency
          </dt>
          <dd className="tabular-nums text-terminal-text">
            {twin.efficiencyPct.toFixed(2)} %
          </dd>
        </div>
      </dl>

      <div className="mt-3 border-t border-terminal-muted/25 pt-3">
        <p className="text-[10px] tracking-[0.18em] text-terminal-muted uppercase">
          Degradation Log
        </p>
        <ul className="mt-2 space-y-1.5 text-[10px] leading-snug text-terminal-text">
          {twin.degradationLog.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
