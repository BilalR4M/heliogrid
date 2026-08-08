/**
 * Zone metadata — names/order must match docs/00-project-lore.md exactly.
 */
export const zones = [
  {
    id: "aerial-overlook",
    index: 1,
    name: "Aerial Overlook",
    shortLabel: "01. Aerial Overlook",
    summary:
      "Orbit the full 2.1GW caldera via cinematic camera path or manual free-fly. Live HUD shows global power output, local wind speed, and current sun angle.",
  },
  {
    id: "array-ring-alpha",
    index: 2,
    name: "Array Ring Alpha",
    shortLabel: "02. Array Ring Alpha",
    summary:
      "Ground-level dual-axis tracking panel rows at human scale, with Digital Twin readouts and an infrared thermal heatmap toggle.",
  },
  {
    id: "heliospire-tower",
    index: 3,
    name: "HelioSpire Tower",
    shortLabel: "03. HelioSpire Tower",
    summary:
      "Observation deck 250m up atop the central receiver spire, with light-beam vectors converging on the core.",
  },
  {
    id: "subterranean-vault",
    index: 4,
    name: "Subterranean Vault",
    shortLabel: "04. Subterranean Vault",
    summary:
      "Elevator descent into the LFP battery cooling vaults, with particle streams visualizing charge and discharge flow.",
  },
] as const;

export type ZoneId = (typeof zones)[number]["id"];
export type ZoneMeta = (typeof zones)[number];

export function getZone(id: ZoneId): ZoneMeta {
  const zone = zones.find((entry) => entry.id === id);
  if (!zone) throw new Error(`Unknown zone: ${id}`);
  return zone;
}
