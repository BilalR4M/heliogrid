/** Infrared thermal heatmap — panel surface false-color by cell temperature.
 *  Phase 2: mixed into MeshPhysicalMaterial via onBeforeCompile (see facilityPbr).
 */

export const thermalRampGlsl = /* glsl */ `
vec3 thermalRamp(float t) {
  vec3 cool = vec3(0.05, 0.12, 0.45);
  vec3 mid = vec3(0.15, 0.75, 0.35);
  vec3 hot = vec3(0.95, 0.25, 0.05);
  vec3 low = mix(cool, mid, smoothstep(0.0, 0.55, t));
  return mix(low, hot, smoothstep(0.45, 1.0, t));
}
`;
