"use client";

import { useEffect, useState } from "react";
import { getZone } from "@/content/zones";
import { getOverlookHud } from "@/lib/facility-sim";
import { useSceneStore } from "@/lib/scene-state";

/** Compact readout for HelioSpire Observation Deck. */
export default function SpireDeckReadout() {
  const timeOfDay = useSceneStore((s) => s.timeOfDay);
  const currentZone = useSceneStore((s) => s.currentZone);
  const [hud, setHud] = useState(() => getOverlookHud(timeOfDay));

  useEffect(() => {
    setHud(getOverlookHud(timeOfDay));
  }, [timeOfDay]);

  if (currentZone !== "heliospire-tower") return null;

  const zone = getZone("heliospire-tower");

  return (
    <aside
      className="pointer-events-none absolute top-4 left-4 z-20 max-w-[min(100%-2rem,18rem)] border border-terminal-muted/30 bg-terminal-bg/85 p-3 font-mono shadow-lg backdrop-blur-sm sm:top-6 sm:left-6 sm:p-4"
      aria-label="HelioSpire observation deck readout"
    >
      <p className="text-[10px] tracking-[0.22em] text-hud-green uppercase">
        {zone.shortLabel}
      </p>
      <p className="mt-2 text-xs text-terminal-text">
        Observation deck · 250 m AGL
      </p>
      <dl className="mt-3 space-y-2 text-xs">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-terminal-muted tracking-wider uppercase">
            Sun elev
          </dt>
          <dd className="tabular-nums text-hud-amber">
            {hud.sunElevationDeg.toFixed(1)}°
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-terminal-muted tracking-wider uppercase">
            Azimuth
          </dt>
          <dd className="tabular-nums text-terminal-text">
            {hud.sunAzimuthDeg.toFixed(0)}°
          </dd>
        </div>
      </dl>
      <p className="mt-3 text-[10px] leading-relaxed text-terminal-muted">
        Orbit for 360° field · toggle light vectors
      </p>
    </aside>
  );
}
