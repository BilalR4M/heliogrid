import { getPosition } from "suncalc";

const CALDERA_LAT = -23.5;
const CALDERA_LON = -67.9;

export type SunDirection = {
  /** Unit-ish direction vector toward the sun (Three.js Y-up). */
  x: number;
  y: number;
  z: number;
  elevationDeg: number;
  intensity: number;
};

function hoursToDate(timeOfDay: number): Date {
  const date = new Date();
  const hours = Math.floor(timeOfDay);
  const minutes = Math.round((timeOfDay - hours) * 60);
  date.setUTCHours(hours, minutes, 0, 0);
  return date;
}

/** Map suncalc altitude/azimuth into a Three.js directional light vector. */
export function getSunDirection(timeOfDay: number): SunDirection {
  const position = getPosition(
    hoursToDate(timeOfDay),
    CALDERA_LAT,
    CALDERA_LON,
  );
  const elevation = position.altitude;
  const azimuth = position.azimuth;

  // suncalc: azimuth from south; convert to Three XZ with Y up.
  const x = Math.sin(azimuth) * Math.cos(elevation);
  const y = Math.sin(elevation);
  const z = -Math.cos(azimuth) * Math.cos(elevation);
  const intensity = Math.max(0.05, Math.sin(elevation)) * 2.2;

  return {
    x,
    y: Math.max(0.05, y),
    z,
    elevationDeg: (elevation * 180) / Math.PI,
    intensity,
  };
}
