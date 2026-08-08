/** Infrared thermal heatmap — panel surface false-color by cell temperature. */

export const thermalHeatmapVertex = /* glsl */ `
attribute float aTemp;
attribute float aSelect;
varying float vTemp;
varying float vSelect;
varying vec3 vNormalW;

void main() {
  vTemp = aTemp;
  vSelect = aSelect;
  mat4 mm = modelMatrix * instanceMatrix;
  vNormalW = normalize(mat3(mm) * normal);
  gl_Position = projectionMatrix * viewMatrix * mm * vec4(position, 1.0);
}
`;

export const thermalHeatmapFragment = /* glsl */ `
uniform float uThermal;
uniform vec3 uPanelColor;
uniform vec3 uSelectColor;
varying float vTemp;
varying float vSelect;
varying vec3 vNormalW;

vec3 thermalRamp(float t) {
  vec3 cool = vec3(0.05, 0.12, 0.45);
  vec3 mid = vec3(0.15, 0.75, 0.35);
  vec3 hot = vec3(0.95, 0.25, 0.05);
  vec3 low = mix(cool, mid, smoothstep(0.0, 0.55, t));
  return mix(low, hot, smoothstep(0.45, 1.0, t));
}

void main() {
  float light = 0.35 + 0.65 * max(dot(normalize(vNormalW), normalize(vec3(0.4, 0.85, 0.3))), 0.0);
  vec3 base = uPanelColor * light;
  vec3 heat = thermalRamp(vTemp);
  vec3 color = mix(base, heat, uThermal);
  color = mix(color, uSelectColor, vSelect * 0.6);
  gl_FragColor = vec4(color, 1.0);
}
`;
