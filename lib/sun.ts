import { getPosition } from "suncalc";

/** Approximate Helios Caldera coordinates (high-altitude fictional basin). */
export const CALDERA_LAT = -23.5;
export const CALDERA_LON = -67.9;

/** Longitude → hours offset so timeOfDay reads as local solar time. */
const LOCAL_SOLAR_OFFSET_H = -CALDERA_LON / 15;

export type SunDirection = {
  /** Unit-ish direction vector toward the sun (Three.js Y-up, −Z north). */
  x: number;
  y: number;
  z: number;
  elevationDeg: number;
  intensity: number;
};

/**
 * Map facility time-of-day (local solar hours in [0, 24)) to a UTC Date
 * for suncalc at the caldera longitude.
 */
export function hoursToDate(timeOfDay: number, base = new Date()): Date {
  const date = new Date(base);
  const local = ((timeOfDay % 24) + 24) % 24;
  const utc = local + LOCAL_SOLAR_OFFSET_H;
  const hours = Math.floor(utc);
  const minutes = Math.round((utc - hours) * 60);
  date.setUTCHours(hours, minutes, 0, 0);
  return date;
}

/** Map suncalc altitude/azimuth (degrees) into a Three.js directional light vector. */
export function getSunDirection(timeOfDay: number): SunDirection {
  const position = getPosition(
    hoursToDate(timeOfDay),
    CALDERA_LAT,
    CALDERA_LON,
  );
  // suncalc@2 returns degrees: altitude; north-based clockwise azimuth (0 = N).
  const elevationDeg = position.altitude;
  const azimuthDeg = position.azimuth;
  const elevation = (elevationDeg * Math.PI) / 180;
  const azimuth = (azimuthDeg * Math.PI) / 180;

  const x = Math.sin(azimuth) * Math.cos(elevation);
  const y = Math.sin(elevation);
  const z = -Math.cos(azimuth) * Math.cos(elevation);
  const intensity = Math.max(0.05, Math.sin(elevation)) * 2.2;

  return {
    x,
    y: Math.max(0.05, y),
    z,
    elevationDeg,
    intensity,
  };
}
