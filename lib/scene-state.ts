import { create } from "zustand";
import type { ZoneId } from "@/content/zones";

type SceneState = {
  currentZone: ZoneId;
  /** Hours in [0, 24). Drives lighting + facility-sim. */
  timeOfDay: number;
  /** Selected Array Ring Alpha panel instance id, or null. */
  selectedPanelId: number | null;
  thermalHeatmap: boolean;
  /** HelioSpire light-beam vector visualization. */
  lightVectors: boolean;
  /** Vault elevator: 0 at surface, 1 at vault floor. */
  elevatorProgress: number;
  elevatorActive: boolean;
  /** Facility spatial audio master mute. */
  audioMuted: boolean;
  /** Brief zone-teleport overlay (0–1). */
  zoneTransition: number;
  setZone: (zone: ZoneId) => void;
  requestZone: (zone: ZoneId) => void;
  setTimeOfDay: (hours: number) => void;
  selectPanel: (id: number | null) => void;
  setThermalHeatmap: (enabled: boolean) => void;
  toggleThermalHeatmap: () => void;
  setLightVectors: (enabled: boolean) => void;
  toggleLightVectors: () => void;
  setElevatorProgress: (progress: number) => void;
  setElevatorActive: (active: boolean) => void;
  setAudioMuted: (muted: boolean) => void;
  toggleAudioMuted: () => void;
  setZoneTransition: (value: number) => void;
};

export const useSceneStore = create<SceneState>((set, get) => ({
  currentZone: "aerial-overlook",
  timeOfDay: 13.0,
  selectedPanelId: null,
  thermalHeatmap: false,
  lightVectors: true,
  elevatorProgress: 0,
  elevatorActive: false,
  audioMuted: false,
  zoneTransition: 0,
  setZone: (zone) =>
    set({
      currentZone: zone,
      selectedPanelId: null,
      elevatorProgress: zone === "subterranean-vault" ? 0 : 1,
      elevatorActive: zone === "subterranean-vault",
    }),
  requestZone: (zone) => {
    const current = get().currentZone;
    if (zone === current) return;
    set({ zoneTransition: 1 });
    // Fade handled by ZoneTransitionManager; commit zone mid-fade.
    window.setTimeout(() => {
      get().setZone(zone);
    }, 220);
  },
  setTimeOfDay: (hours) => set({ timeOfDay: ((hours % 24) + 24) % 24 }),
  selectPanel: (id) => set({ selectedPanelId: id }),
  setThermalHeatmap: (enabled) => set({ thermalHeatmap: enabled }),
  toggleThermalHeatmap: () =>
    set((state) => ({ thermalHeatmap: !state.thermalHeatmap })),
  setLightVectors: (enabled) => set({ lightVectors: enabled }),
  toggleLightVectors: () =>
    set((state) => ({ lightVectors: !state.lightVectors })),
  setElevatorProgress: (progress) =>
    set({ elevatorProgress: Math.min(1, Math.max(0, progress)) }),
  setElevatorActive: (active) => set({ elevatorActive: active }),
  setAudioMuted: (muted) => set({ audioMuted: muted }),
  toggleAudioMuted: () => set((state) => ({ audioMuted: !state.audioMuted })),
  setZoneTransition: (value) =>
    set({ zoneTransition: Math.min(1, Math.max(0, value)) }),
}));
