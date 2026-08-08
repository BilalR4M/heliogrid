"use client";

import { useEffect, useState } from "react";
import { getZone } from "@/content/zones";
import { getOverlookHud } from "@/lib/facility-sim";
import { useSceneStore } from "@/lib/scene-state";

function formatMw(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(2)} GW`;
  return `${value.toFixed(0)} MW`;
}

/** Live plant instrumentation for Aerial Overlook — SCADA-style readout. */
export default function PowerOutputReadout() {
  const timeOfDay = useSceneStore((s) => s.timeOfDay);
  const currentZone = useSceneStore((s) => s.currentZone);
  const [hud, setHud] = useState(() => getOverlookHud(timeOfDay));

  useEffect(() => {
    setHud(getOverlookHud(timeOfDay));
  }, [timeOfDay]);

  if (currentZone !== "aerial-overlook") return null;

  const zone = getZone("aerial-overlook");

  return (
    <aside
      className="pointer-events-none absolute top-4 left-4 z-20 max-w-[min(100%-2rem,18rem)] border border-terminal-muted/30 bg-terminal-bg/85 p-3 font-mono shadow-lg backdrop-blur-sm sm:top-6 sm:left-6 sm:p-4"
      aria-label="Aerial Overlook facility readout"
    >
      <p className="text-[10px] tracking-[0.22em] text-hud-green uppercase">
        {zone.shortLabel}
      </p>
      <dl className="mt-3 space-y-2.5 text-xs">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-terminal-muted tracking-wider uppercase">
            Output
          </dt>
          <dd className="text-sm text-hud-amber tabular-nums">
            {formatMw(hud.powerMw)}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-terminal-muted tracking-wider uppercase">
            Wind
          </dt>
          <dd className="tabular-nums text-terminal-text">
            {hud.windSpeedMs.toFixed(1)} m/s
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-terminal-muted tracking-wider uppercase">
            Sun elev
          </dt>
          <dd className="tabular-nums text-terminal-text">
            {hud.sunElevationDeg.toFixed(1)}°
          </dd>
        </div>
      </dl>
      <p className="mt-3 text-[10px] leading-relaxed text-terminal-muted">
        Drag to orbit · scroll to zoom
      </p>
    </aside>
  );
}
