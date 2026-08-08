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
  setZone: (zone: ZoneId) => void;
  setTimeOfDay: (hours: number) => void;
  selectPanel: (id: number | null) => void;
  setThermalHeatmap: (enabled: boolean) => void;
  toggleThermalHeatmap: () => void;
  setLightVectors: (enabled: boolean) => void;
  toggleLightVectors: () => void;
  setElevatorProgress: (progress: number) => void;
  setElevatorActive: (active: boolean) => void;
};

export const useSceneStore = create<SceneState>((set) => ({
  currentZone: "aerial-overlook",
  timeOfDay: 13.0,
  selectedPanelId: null,
  thermalHeatmap: false,
  lightVectors: true,
  elevatorProgress: 0,
  elevatorActive: false,
  setZone: (zone) =>
    set({
      currentZone: zone,
      selectedPanelId: null,
      elevatorProgress: zone === "subterranean-vault" ? 0 : 1,
      elevatorActive: zone === "subterranean-vault",
    }),
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
}));
