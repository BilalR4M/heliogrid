"use client";

import dynamic from "next/dynamic";
import ZoneSummary from "@/components/content/ZoneSummary";
import DigitalTwinCard from "@/components/ui/HUD/DigitalTwinCard";
import LightVectorToggle from "@/components/ui/HUD/LightVectorToggle";
import PowerOutputReadout from "@/components/ui/HUD/PowerOutputReadout";
import SpireDeckReadout from "@/components/ui/HUD/SpireDeckReadout";
import ThermalToggle from "@/components/ui/HUD/ThermalToggle";
import VaultReadout from "@/components/ui/HUD/VaultReadout";
import ZoneNav from "@/components/ui/ZoneNav";
import { useSceneStore } from "@/lib/scene-state";

const ExperienceCanvas = dynamic(() => import("@/components/scene/Canvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-dvh w-full items-center justify-center bg-scene-sky font-mono text-xs tracking-widest text-terminal-muted uppercase">
      Loading experience…
    </div>
  ),
});

export default function ExperiencePage() {
  const currentZone = useSceneStore((s) => s.currentZone);
  const elevatorActive = useSceneStore((s) => s.elevatorActive);
  const elevatorProgress = useSceneStore((s) => s.elevatorProgress);

  const showVignette =
    currentZone === "subterranean-vault" &&
    (elevatorActive || elevatorProgress < 1);

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-scene-sky">
      <ExperienceCanvas />
      <PowerOutputReadout />
      <SpireDeckReadout />
      <VaultReadout />
      <DigitalTwinCard />
      <ThermalToggle />
      <LightVectorToggle />
      <ZoneNav />
      <ZoneSummary zoneId={currentZone} />
      {showVignette && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background:
              "radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.55) 100%)",
            opacity: elevatorActive ? 0.9 : 0.35,
          }}
        />
      )}
    </div>
  );
}
