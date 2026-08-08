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
