import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export const MODULE = {
  glassW: 2.1,
  glassH: 1.05,
  glassD: 0.04,
  frameW: 2.18,
  frameH: 1.13,
  frameRail: 0.045,
  frameD: 0.055,
  postBottomR: 0.07,
  postTopR: 0.055,
  postH: 1.15,
  hingeY: 1.15,
} as const;

/**
 * Aluminum frame as four rails (border), origin at hinge / post top.
 */
export function createFrameGeometry(): THREE.BufferGeometry {
  const { frameW, frameH, frameRail, frameD } = MODULE;
  const y = frameH * 0.5;
  const top = new THREE.BoxGeometry(frameW, frameRail, frameD);
  top.translate(0, y - frameRail * 0.5, 0);
  const bottom = new THREE.BoxGeometry(frameW, frameRail, frameD);
  bottom.translate(0, frameRail * 0.5, 0);
  const sideH = frameH - frameRail * 2;
  const left = new THREE.BoxGeometry(frameRail, sideH, frameD);
  left.translate(-(frameW - frameRail) * 0.5, y, 0);
  const right = new THREE.BoxGeometry(frameRail, sideH, frameD);
  right.translate((frameW - frameRail) * 0.5, y, 0);

  const merged = mergeGeometries([top, bottom, left, right], false);
  top.dispose();
  bottom.dispose();
  left.dispose();
  right.dispose();
  if (!merged) {
    throw new Error("createFrameGeometry: mergeGeometries failed");
  }
  merged.computeVertexNormals();
  return merged;
}

/** Bifacial glass laminate, UV-mapped for cell grid texture. */
export function createGlassGeometry(): THREE.BufferGeometry {
  const { glassW, glassH, glassD } = MODULE;
  const geo = new THREE.BoxGeometry(glassW, glassH, glassD);
  geo.translate(0, glassH * 0.5, 0.01);
  return geo;
}

export function createPostGeometry(): THREE.BufferGeometry {
  const { postBottomR, postTopR, postH } = MODULE;
  const geo = new THREE.CylinderGeometry(postTopR, postBottomR, postH, 6);
  geo.translate(0, postH * 0.5, 0);
  return geo;
}

export type ModulePose = {
  tilt: number;
  yaw: number;
};

/**
 * Dual-axis stepped orientation from sun elevation/azimuth (degrees).
 * 5° quantization — design doc §3 mechanical tracking feel.
 */
export function moduleOrientation(
  sunElevationDeg: number,
  sunAzimuthDeg: number,
): ModulePose {
  const stepElev = Math.round(Math.max(0, sunElevationDeg) / 5) * 5;
  const stepAz = Math.round((((sunAzimuthDeg % 360) + 360) % 360) / 5) * 5;
  const tilt = THREE.MathUtils.degToRad(Math.min(55, stepElev) * 0.7);
  const az = THREE.MathUtils.degToRad(stepAz);
  // North-based azimuth: 0 = −Z, 90 = +X → yaw that faces the sun.
  const yaw = Math.atan2(Math.sin(az), -Math.cos(az));
  return { tilt, yaw };
}
