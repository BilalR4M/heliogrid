"use client";

import dynamic from "next/dynamic";
import { facilitySpec } from "@/content/facility-spec";
import EnterExperienceButton from "@/components/landing/EnterExperienceButton";

const CalderaHologram = dynamic(
  () => import("@/components/landing/CalderaHologram"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[280px] items-center justify-center font-mono text-xs tracking-widest text-terminal-muted uppercase">
        Caldera hologram offline…
      </div>
    ),
  },
);

function formatPanels(count: number) {
  return `${(count / 1_000_000).toFixed(1)}M`;
}

export default function HologramTerminal() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-terminal-bg">
      {/* Scanline / terminal atmosphere — subtle, non-decorative noise plane */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 2px, #fff 3px)",
        }}
      />

      <header className="relative z-10 flex items-start justify-between gap-4 border-b border-terminal-muted/25 px-5 py-4 sm:px-8">
        <div>
          <p className="font-mono text-[10px] tracking-[0.28em] text-hud-green uppercase">
            HelioGrid Dynamics // Terminal
          </p>
          <p className="mt-1 font-mono text-[10px] tracking-wider text-terminal-muted">
            SYS.STATUS&nbsp;&nbsp;NOMINAL
          </p>
        </div>
        <p className="font-mono text-[10px] tracking-wider text-terminal-muted">
          ALT {facilitySpec.altitudeMeters.toLocaleString()} m
        </p>
      </header>

      <main className="relative z-10 grid flex-1 grid-cols-1 items-center gap-8 px-5 py-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-4 lg:px-10 lg:py-6">
        <section className="order-2 flex max-w-xl flex-col gap-6 lg:order-1">
          <div className="space-y-3">
            <h1 className="text-4xl font-medium tracking-tight text-terminal-text sm:text-5xl lg:text-6xl">
              {facilitySpec.name}
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-terminal-muted sm:text-base">
              Holographic overview of the Helios Caldera — {facilitySpec.nameplateCapacityGw}{" "}
              GW nameplate, concentric array rings around the{" "}
              {facilitySpec.centralTowerHeightM} m Central Optics Tower.
            </p>
          </div>

          <EnterExperienceButton />

          <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-terminal-muted/25 pt-5 font-mono sm:grid-cols-3">
            <div>
              <dt className="text-[10px] tracking-[0.2em] text-terminal-muted uppercase">
                Output
              </dt>
              <dd className="mt-1 text-sm text-hud-amber">
                {facilitySpec.nameplateCapacityGw.toFixed(1)} GW
              </dd>
            </div>
            <div>
              <dt className="text-[10px] tracking-[0.2em] text-terminal-muted uppercase">
                Storage
              </dt>
              <dd className="mt-1 text-sm text-hud-amber">
                {facilitySpec.storageGwh.toFixed(1)} GWh
              </dd>
            </div>
            <div>
              <dt className="text-[10px] tracking-[0.2em] text-terminal-muted uppercase">
                Panels
              </dt>
              <dd className="mt-1 text-sm text-hud-amber">
                {formatPanels(facilitySpec.panelCount)}
              </dd>
            </div>
          </dl>
        </section>

        <section
          className="order-1 h-[42vh] min-h-[260px] w-full lg:order-2 lg:h-[min(70vh,640px)]"
          aria-label="Helios Caldera wireframe hologram"
        >
          <CalderaHologram />
        </section>
      </main>

      <footer className="relative z-10 border-t border-terminal-muted/25 px-5 py-3 font-mono text-[10px] tracking-wider text-terminal-muted sm:px-8">
        HOLOGRAM MODE&nbsp;&nbsp;WIREFRAME&nbsp;&nbsp;//&nbsp;&nbsp;TRANSITION
        ARMED ON ENTER
      </footer>
    </div>
  );
}
