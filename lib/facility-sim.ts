import { getPosition } from "suncalc";
import { facilitySpec } from "@/content/facility-spec";

/** Approximate Helios Caldera coordinates (high-altitude fictional basin). */
const CALDERA_LAT = -23.5;
const CALDERA_LON = -67.9;

export type OverlookHud = {
  /** Instantaneous plant output in megawatts. */
  powerMw: number;
  windSpeedMs: number;
  sunElevationDeg: number;
  sunAzimuthDeg: number;
};

function hoursToDate(timeOfDay: number, base = new Date()): Date {
  const date = new Date(base);
  const hours = Math.floor(timeOfDay);
  const minutes = Math.round((timeOfDay - hours) * 60);
  date.setUTCHours(hours, minutes, 0, 0);
  return date;
}

/**
 * Deterministic HUD values from lore nameplate + time-of-day sun curve.
 * No network — pure functions for the simulated facility.
 */
export function getOverlookHud(timeOfDay: number): OverlookHud {
  const date = hoursToDate(timeOfDay);
  const position = getPosition(date, CALDERA_LAT, CALDERA_LON);
  const sunElevationDeg = (position.altitude * 180) / Math.PI;
  const sunAzimuthDeg = ((position.azimuth * 180) / Math.PI + 180) % 360;

  const elevationFactor = Math.max(0, Math.sin(position.altitude));
  const nameplateMw = facilitySpec.nameplateCapacityGw * 1000;
  // High-altitude lore bonus (~35% capture) folded into a calm daytime curve.
  const powerMw = nameplateMw * elevationFactor * 0.92;

  const windSpeedMs = 6.5 + 3.2 * Math.sin((timeOfDay / 24) * Math.PI * 2);

  return {
    powerMw,
    windSpeedMs,
    sunElevationDeg,
    sunAzimuthDeg,
  };
}

export type PanelTwin = {
  panelId: number;
  row: number;
  bay: number;
  cellTempC: number;
  voltageV: number;
  efficiencyPct: number;
  degradationLog: string[];
};

/** Per-panel Digital Twin — deterministic from panel id + time-of-day. */
export function getPanelTwin(panelId: number, timeOfDay: number): PanelTwin {
  const overlook = getOverlookHud(timeOfDay);
  const sunFactor = Math.max(0, Math.sin((overlook.sunElevationDeg * Math.PI) / 180));
  const row = Math.floor(panelId / 24);
  const bay = panelId % 24;
  const jitter = ((panelId * 17) % 10) / 10;

  const cellTempC = 22 + sunFactor * 28 + jitter * 4 + row * 0.35;
  const voltageV = 41 + sunFactor * 14.5 + (bay % 5) * 0.15;
  const efficiencyPct = 22.4 - row * 0.08 - jitter * 0.35 - (1 - sunFactor) * 1.2;

  const degradationLog = [
    `T-${90 + (panelId % 40)}d  microcrack scan — clear`,
    `T-${30 + (panelId % 12)}d  soiling Δ −${(0.2 + jitter * 0.3).toFixed(2)}%`,
    `T-${7 + (panelId % 5)}d  bifacial gain ${ (4.1 + jitter).toFixed(1)}%`,
  ];

  return {
    panelId,
    row: row + 1,
    bay: bay + 1,
    cellTempC,
    voltageV,
    efficiencyPct,
    degradationLog,
  };
}

/** Normalized 0–1 temperature used by the thermal heatmap shader. */
export function getPanelThermalNorm(panelId: number, timeOfDay: number): number {
  const twin = getPanelTwin(panelId, timeOfDay);
  return Math.min(1, Math.max(0, (twin.cellTempC - 20) / 45));
}
