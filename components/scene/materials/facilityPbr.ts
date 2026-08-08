import * as THREE from "three";
import { SCENE_COLORS } from "@/components/scene/PlaceholderCaldera";
import { thermalRampGlsl } from "@/components/scene/shaders/thermalHeatmap.glsl";

/**
 * Shared outdoor facility PBR presets — Phase 2 single source.
 * Keep docs/06-photorealism-refactor.md tuned-values table in sync when changing.
 */
export const PBR = {
  panelGlass: {
    color: SCENE_COLORS.panel,
    roughness: 0.18,
    metalness: 0.55,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.15,
  },
  /** Aerial LOD blocks — Physical without full clearcoat cost at distance. */
  panelLod: {
    color: SCENE_COLORS.panel,
    roughness: 0.28,
    metalness: 0.62,
    clearcoat: 0.35,
    clearcoatRoughness: 0.2,
    envMapIntensity: 1.0,
  },
  galvanizedSteel: {
    color: SCENE_COLORS.steel,
    roughness: 0.38,
    metalness: 0.88,
    envMapIntensity: 1.0,
  },
  aluminumFrame: {
    color: "#b0b6bc",
    roughness: 0.32,
    metalness: 0.78,
    envMapIntensity: 1.05,
  },
  calderaRock: {
    color: SCENE_COLORS.rock,
    roughness: 0.92,
    metalness: 0.04,
    envMapIntensity: 0.55,
  },
  calderaRing: {
    color: "#6e4530",
    roughness: 0.94,
    metalness: 0.03,
    envMapIntensity: 0.5,
  },
  calderaRim: {
    color: "#5a3828",
    roughness: 0.97,
    metalness: 0.02,
    envMapIntensity: 0.45,
  },
  receiverCore: {
    color: "#fff1d6",
    emissive: SCENE_COLORS.amber,
    emissiveIntensity: 1.4,
    roughness: 0.22,
    metalness: 0.35,
    envMapIntensity: 0.8,
  },
} as const;

export type RockPreset = "calderaRock" | "calderaRing" | "calderaRim";

/** Small procedural rock normal — no asset download, shared across terrain. */
export function createRockNormalMap(size = 128): THREE.DataTexture {
  const data = new Uint8Array(size * size * 4);
  const height = (x: number, y: number) => {
    const n1 = Math.sin(x * 0.19) * Math.cos(y * 0.15);
    const n2 = Math.sin(x * 0.06 + y * 0.09) * 0.55;
    const n3 = Math.sin((x + y) * 0.31) * 0.25;
    return n1 * 0.45 + n2 + n3;
  };

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const i = (y * size + x) * 4;
      const hL = height(x - 1, y);
      const hR = height(x + 1, y);
      const hD = height(x, y - 1);
      const hU = height(x, y + 1);
      const dx = (hL - hR) * 0.55;
      const dy = (hD - hU) * 0.55;
      const invLen = 1 / Math.sqrt(dx * dx + dy * dy + 1);
      data[i] = Math.round((dx * invLen * 0.5 + 0.5) * 255);
      data[i + 1] = Math.round((dy * invLen * 0.5 + 0.5) * 255);
      data[i + 2] = Math.round(invLen * 255);
      data[i + 3] = 255;
    }
  }

  const tex = new THREE.DataTexture(data, size, size);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.NoColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export function createPanelMaterial(
  kind: "glass" | "lod" = "glass",
): THREE.MeshPhysicalMaterial {
  const preset = kind === "lod" ? PBR.panelLod : PBR.panelGlass;
  return new THREE.MeshPhysicalMaterial({ ...preset });
}

export function createSteelMaterial(
  overrides: THREE.MeshStandardMaterialParameters = {},
): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    ...PBR.galvanizedSteel,
    ...overrides,
  });
}

export function createAluminumMaterial(
  overrides: THREE.MeshStandardMaterialParameters = {},
): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    ...PBR.aluminumFrame,
    ...overrides,
  });
}

/** Monocrystalline cell grid for bifacial glass — 256² CanvasTexture. */
export function createCellGridTexture(
  cols = 6,
  rows = 10,
  size = 256,
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("createCellGridTexture: 2D context unavailable");
  }

  ctx.fillStyle = SCENE_COLORS.panel;
  ctx.fillRect(0, 0, size, size);

  const inset = size * 0.04;
  const cellW = (size - inset * 2) / cols;
  const cellH = (size - inset * 2) / rows;

  ctx.strokeStyle = "rgba(90, 120, 150, 0.55)";
  ctx.lineWidth = Math.max(1, size / 256);
  for (let c = 0; c <= cols; c += 1) {
    const x = inset + c * cellW;
    ctx.beginPath();
    ctx.moveTo(x, inset);
    ctx.lineTo(x, size - inset);
    ctx.stroke();
  }
  for (let r = 0; r <= rows; r += 1) {
    const y = inset + r * cellH;
    ctx.beginPath();
    ctx.moveTo(inset, y);
    ctx.lineTo(size - inset, y);
    ctx.stroke();
  }

  // Busbars
  ctx.strokeStyle = "rgba(180, 190, 200, 0.35)";
  ctx.lineWidth = Math.max(1.5, size / 128);
  for (let c = 0; c < cols; c += 1) {
    const x = inset + (c + 0.5) * cellW;
    ctx.beginPath();
    ctx.moveTo(x, inset);
    ctx.lineTo(x, size - inset);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

export function createRockMaterial(
  preset: RockPreset = "calderaRock",
  overrides: THREE.MeshStandardMaterialParameters = {},
): THREE.MeshStandardMaterial {
  const base = PBR[preset];
  return new THREE.MeshStandardMaterial({
    ...base,
    ...overrides,
  });
}

export function createReceiverMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ ...PBR.receiverCore });
}

type ThermalUniforms = {
  uThermal: { value: number };
  uSelectColor: { value: THREE.Color };
};

/**
 * Array Ring panel Physical material with thermal/select instance attrs.
 * Keeps env + clearcoat when IR is off; mixes thermal ramp when on.
 */
export function createArrayPanelMaterial(): THREE.MeshPhysicalMaterial {
  const mat = new THREE.MeshPhysicalMaterial({ ...PBR.panelGlass });
  const thermalUniforms: ThermalUniforms = {
    uThermal: { value: 0 },
    uSelectColor: { value: new THREE.Color(SCENE_COLORS.cyan) },
  };
  mat.userData.thermalUniforms = thermalUniforms;

  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, thermalUniforms);

    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        /* glsl */ `#include <common>
attribute float aTemp;
attribute float aSelect;
varying float vPanel;
varying float vSelect;`,
      )
      .replace(
        "#include <begin_vertex>",
        /* glsl */ `#include <begin_vertex>
vTemp = aTemp;
vSelect = aSelect;`,
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        /* glsl */ `#include <common>
uniform float uThermal;
uniform vec3 uSelectColor;
varying float vTemp;
varying float vSelect;
${thermalRampGlsl}`,
      )
      .replace(
        "#include <opaque_fragment>",
        /* glsl */ `vec3 heat = thermalRamp(vTemp);
outgoingLight = mix(outgoingLight, heat, uThermal);
outgoingLight = mix(outgoingLight, uSelectColor, vSelect * 0.6);
#include <opaque_fragment>`,
      );

    mat.userData.shader = shader;
  };

  mat.customProgramCacheKey = () => "heliogrid-array-panel-thermal-v2";
  return mat;
}

export function setArrayPanelThermal(
  material: THREE.MeshPhysicalMaterial,
  enabled: boolean,
): void {
  const uniforms = material.userData.thermalUniforms as
    | ThermalUniforms
    | undefined;
  if (uniforms) {
    uniforms.uThermal.value = enabled ? 1 : 0;
  }
}
