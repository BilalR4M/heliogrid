import { create } from "zustand";
import type { ZoneId } from "@/content/zones";

type SceneState = {
  currentZone: ZoneId;
  /** Hours in [0, 24). Drives lighting + facility-sim. */
  timeOfDay: number;
  /** Selected Array Ring Alpha panel instance id, or null. */
  selectedPanelId: number | null;
  thermalHeatmap: boolean;
  setZone: (zone: ZoneId) => void;
  setTimeOfDay: (hours: number) => void;
  selectPanel: (id: number | null) => void;
  setThermalHeatmap: (enabled: boolean) => void;
  toggleThermalHeatmap: () => void;
};

export const useSceneStore = create<SceneState>((set) => ({
  currentZone: "aerial-overlook",
  timeOfDay: 13.0,
  selectedPanelId: null,
  thermalHeatmap: false,
  setZone: (zone) =>
    set({
      currentZone: zone,
      selectedPanelId: null,
    }),
  setTimeOfDay: (hours) => set({ timeOfDay: ((hours % 24) + 24) % 24 }),
  selectPanel: (id) => set({ selectedPanelId: id }),
  setThermalHeatmap: (enabled) => set({ thermalHeatmap: enabled }),
  toggleThermalHeatmap: () =>
    set((state) => ({ thermalHeatmap: !state.thermalHeatmap })),
}));
