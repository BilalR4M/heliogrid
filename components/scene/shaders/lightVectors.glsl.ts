/** Light-beam vectors — mirror-field convergence onto the HelioSpire receiver. */

export const lightVectorsVertex = /* glsl */ `
uniform float uTime;
varying float vAlong;
varying float vDist;

void main() {
  // position.y in cylinder geometry runs -0.5..0.5 along height before instance transform
  vAlong = position.y + 0.5;
  vec4 world = modelMatrix * instanceMatrix * vec4(position, 1.0);
  vDist = length(world.xyz);
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

export const lightVectorsFragment = /* glsl */ `
uniform float uTime;
uniform float uIntensity;
uniform vec3 uColor;
varying float vAlong;

void main() {
  float pulse = fract(vAlong * 1.8 - uTime * 0.35);
  float core = smoothstep(0.55, 0.15, pulse) * smoothstep(0.0, 0.12, pulse);
  float haze = 0.12 + 0.2 * (1.0 - abs(vAlong - 0.5) * 2.0);
  float alpha = (haze + core * 0.85) * uIntensity;
  vec3 color = uColor * (0.55 + core * 1.4);
  gl_FragColor = vec4(color, alpha);
}
`;
