import { create } from "zustand";
import type { ZoneId } from "@/content/zones";

type SceneState = {
  currentZone: ZoneId;
  /** Hours in [0, 24). Drives lighting + facility-sim. */
  timeOfDay: number;
  setZone: (zone: ZoneId) => void;
  setTimeOfDay: (hours: number) => void;
};

export const useSceneStore = create<SceneState>((set) => ({
  currentZone: "aerial-overlook",
  timeOfDay: 13.0,
  setZone: (zone) => set({ currentZone: zone }),
  setTimeOfDay: (hours) => set({ timeOfDay: ((hours % 24) + 24) % 24 }),
}));
