/** Energy-flow particle streams for the Subterranean Battery Vault. */

export const energyParticlesVertex = /* glsl */ `
uniform float uTime;
uniform float uDirection; // 1 = charge (into cells), -1 = discharge
uniform float uSpeed;
attribute float aOffset;
attribute float aLane;
varying float vAlpha;
varying float vLane;

void main() {
  vLane = aLane;
  vec3 pos = position;
  // Scroll along local Y (shaft/bus axis), wrapped
  float travel = fract(aOffset + uTime * uSpeed * uDirection);
  pos.y += (travel - 0.5) * 8.0;
  pos.x += sin(travel * 6.28318 + aLane) * 0.05;

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = 3.5 * (1.0 / -mv.z);
  vAlpha = smoothstep(0.0, 0.15, travel) * smoothstep(1.0, 0.85, travel);
}
`;

export const energyParticlesFragment = /* glsl */ `
uniform float uDirection;
uniform vec3 uChargeColor;
uniform vec3 uDischargeColor;
varying float vAlpha;
varying float vLane;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  if (d > 0.5) discard;
  float soft = smoothstep(0.5, 0.1, d);
  vec3 color = mix(uDischargeColor, uChargeColor, step(0.0, uDirection));
  color *= 0.85 + 0.15 * fract(vLane * 0.37);
  gl_FragColor = vec4(color, vAlpha * soft);
}
`;
