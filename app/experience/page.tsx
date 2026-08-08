"use client";

import dynamic from "next/dynamic";
import ZoneSummary from "@/components/content/ZoneSummary";
import PowerOutputReadout from "@/components/ui/HUD/PowerOutputReadout";

const ExperienceCanvas = dynamic(() => import("@/components/scene/Canvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-dvh w-full items-center justify-center bg-scene-sky font-mono text-xs tracking-widest text-terminal-muted uppercase">
      Loading aerial overlook…
    </div>
  ),
});

export default function ExperiencePage() {
  return (
    <div className="relative h-dvh w-full overflow-hidden bg-scene-sky">
      <ExperienceCanvas />
      <PowerOutputReadout />
      <ZoneSummary zoneId="aerial-overlook" />
    </div>
  );
}
