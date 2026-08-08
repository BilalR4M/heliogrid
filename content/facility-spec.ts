/**
 * Typed facility spec — sourced from docs/00-project-lore.md.
 * If this drifts from the lore doc, the lore doc wins; update code to match.
 */
export const facilitySpec = {
  name: "HelioGrid Complex",
  operator: "HelioGrid Dynamics",
  location: "Helios Caldera",
  altitudeMeters: 3800,
  nameplateCapacityGw: 2.1,
  storageGwh: 4.2,
  panelCount: 3_200_000,
  panelDescription: "bifacial PV panels, active dual-axis tracking",
  centralTowerHeightM: 250,
  cooling: "Autonomous drone fleet, waterless electro-static dust clearance",
  gridTieIn: "High-Voltage Direct Current (HVDC) underground trunk line",
} as const;

export type FacilitySpec = typeof facilitySpec;
