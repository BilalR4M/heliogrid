"use client";

import { formatTimeLabel } from "@/lib/audio";
import { useSceneStore } from "@/lib/scene-state";

/** 24-hour sun scrub — drives lighting, tracking tilt, vault flow, HUD. */
export default function TimeScrub() {
  const timeOfDay = useSceneStore((s) => s.timeOfDay);
  const setTimeOfDay = useSceneStore((s) => s.setTimeOfDay);
  const audioMuted = useSceneStore((s) => s.audioMuted);
  const toggleAudioMuted = useSceneStore((s) => s.toggleAudioMuted);

  return (
    <div className="absolute right-4 bottom-20 z-20 w-[min(100%-2rem,16rem)] border border-terminal-muted/30 bg-terminal-bg/90 p-3 font-mono shadow-lg backdrop-blur-sm sm:right-6 sm:bottom-24">
      <div className="flex items-baseline justify-between gap-3">
        <label
          htmlFor="time-scrub"
          className="text-[10px] tracking-[0.18em] text-terminal-muted uppercase"
        >
          Sun / Time
        </label>
        <span className="text-xs text-hud-amber tabular-nums" aria-live="polite">
          {formatTimeLabel(timeOfDay)}
        </span>
      </div>
      <input
        id="time-scrub"
        type="range"
        min={0}
        max={24}
        step={0.05}
        value={timeOfDay}
        onChange={(event) => setTimeOfDay(Number(event.target.value))}
        className="mt-2 w-full accent-hologram-cyan"
        aria-valuemin={0}
        aria-valuemax={24}
        aria-valuenow={Number(timeOfDay.toFixed(2))}
        aria-valuetext={formatTimeLabel(timeOfDay)}
      />
      <div className="mt-1 flex justify-between text-[9px] tracking-wider text-terminal-muted uppercase">
        <span>Dawn</span>
        <span>Noon</span>
        <span>Night</span>
      </div>
      <button
        type="button"
        onClick={toggleAudioMuted}
        aria-pressed={audioMuted}
        className={`mt-3 w-full border px-2 py-1.5 text-[10px] tracking-[0.18em] uppercase transition-colors ${
          audioMuted
            ? "border-terminal-muted/40 text-terminal-muted"
            : "border-hologram-cyan/40 text-hologram-cyan"
        }`}
      >
        Spatial Audio · {audioMuted ? "Muted" : "Live"}
      </button>
    </div>
  );
}
