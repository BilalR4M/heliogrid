"use client";

import { zones, type ZoneId } from "@/content/zones";
import { useSceneStore } from "@/lib/scene-state";

const ENABLED_ZONES: ZoneId[] = [
  "aerial-overlook",
  "array-ring-alpha",
  "heliospire-tower",
  "subterranean-vault",
];

export default function ZoneNav() {
  const currentZone = useSceneStore((s) => s.currentZone);
  const requestZone = useSceneStore((s) => s.requestZone);

  return (
    <nav
      className="absolute bottom-4 left-1/2 z-20 flex max-w-[calc(100%-2rem)] -translate-x-1/2 gap-1 overflow-x-auto border border-terminal-muted/30 bg-terminal-bg/90 p-1 font-mono shadow-lg backdrop-blur-sm"
      aria-label="Facility zones"
    >
      {zones.map((zone) => {
        const enabled = ENABLED_ZONES.includes(zone.id);
        const active = currentZone === zone.id;
        return (
          <button
            key={zone.id}
            type="button"
            disabled={!enabled}
            onClick={() => requestZone(zone.id)}
            aria-current={active ? "true" : undefined}
            title={enabled ? zone.name : `${zone.name} — coming online`}
            className={`shrink-0 px-2.5 py-2 text-[10px] tracking-[0.12em] uppercase transition-colors sm:px-3 ${
              active
                ? "bg-hologram-cyan/15 text-hologram-cyan"
                : enabled
                  ? "text-terminal-muted hover:text-terminal-text"
                  : "cursor-not-allowed text-terminal-muted/35"
            }`}
          >
            {String(zone.index).padStart(2, "0")}
          </button>
        );
      })}
    </nav>
  );
}
