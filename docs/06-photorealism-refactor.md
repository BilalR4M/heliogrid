# Photorealism Refactor Spec

## Status & relationship to the build order

This doc governs a **refactoring pass**, not a from-scratch milestone — it
assumes the zones in `docs/04-architecture.md` (steps 4–7) already exist in
some form and currently look flat/unlit (`MeshBasicMaterial`, no shadows, no
tone mapping). It slots in as **build-order step 12**, after the four zones
and cross-zone systems exist and before final VR/responsive polish — see the
updated build order in `04-architecture.md`.

Treat each phase below as its own set of review-gated steps per
`docs/05-git-workflow.md` — do not do a phase in one giant commit, and do not
start Phase 2 before Phase 1 is reviewed and merged.

## Executive overview

The current implementation suffers from flat lighting, unlit color blocks,
missing ambient occlusion/reflections, pitch-black voids, and low-fidelity
geometric shapes. This spec converts the project into a physically-based,
photorealistic WebGL/Three.js experience, in phases:

1. Renderer calibration & atmospheric sky lighting
2. PBR material overhaul (`MeshStandardMaterial` / `MeshPhysicalMaterial`)
3. Detailed array instancing (Array Ring Alpha — high-fidelity tracking modules)
4. Subterranean Vault realism (Zone 04 industrial interior lighting)
5. Post-processing pipeline (`EffectComposer`, bloom, anti-aliasing)

Each phase has a clear technical objective and should be independently
verifiable before moving to the next — this mirrors the per-zone build order
already in place, just applied to visual fidelity instead of new features.

## Core technical objectives

1. **Color management calibration**: linear default → `SRGBColorSpace` output
   with `ACESFilmicToneMapping`.
2. **Atmospheric lighting**: pitch-black void → dynamic Rayleigh/Mie
   atmospheric sky scattering, directional sunlight with soft shadow mapping,
   HDRI ambient fills.
3. **PBR material overhaul**: all scene meshes upgraded to `MeshStandardMaterial`
   / `MeshPhysicalMaterial` with roughness, metalness, normal maps, clearcoat
   gloss (panels specifically benefit from clearcoat — see design doc's
   bifacial-glass material direction).
4. **Detailed array instancing**: generic flat solar quads → high-fidelity
   dual-axis tracking modules (aluminum frames, monocrystalline gridlines,
   steel mounting posts) via `InstancedMesh`, still holding the 60fps target
   from `docs/03-tech-stack.md`.
5. **Subterranean Vault realism**: industrial interior lighting for Zone 04 —
   LED points, glowing conduits, emissive status indicators, consistent with
   the particle energy-flow shader already specified for this zone.
6. **Post-processing**: `EffectComposer` with `UnrealBloomPass` and `SMAAPass`
   for light glints and crisp edges.

**Performance note**: every phase here is additive rendering cost. Per
AGENTS.md rule 5, a frame-budget regression from any of these phases is a bug
to flag immediately, not a trade-off to note in passing — recheck the 60fps
desktop / 72–90fps VR targets after each phase, not just at the end.

---

## Phase 1 — Renderer Calibration & Atmospheric Sky Lighting

### Objective
Configure the WebGL renderer for photorealistic color handling, enable soft
shadow mapping, and build a sky dome tied to the existing 24-hour time-scrub
(`lib/sun.ts` / `components/ui/HUD/TimeScrub.tsx`) rather than a new,
separate slider.

### Implementation

```javascript
import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';

export function setupRendererAndLighting(scene, canvas) {
  // 1. Renderer Calibration
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // 2. Atmospheric Sky Dome
  const sky = new Sky();
  sky.scale.setScalar(450000);
  scene.add(sky);

  const skyUniforms = sky.material.uniforms;
  skyUniforms['turbidity'].value = 2.0;
  skyUniforms['rayleigh'].value = 2.5;
  skyUniforms['mieCoefficient'].value = 0.005;
  skyUniforms['mieDirectionalG'].value = 0.8;

  // 3. Directional Sun Light
  const sunLight = new THREE.DirectionalLight(0xfff5ea, 3.5);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far = 1500;

  const d = 500;
  sunLight.shadow.camera.left = -d;
  sunLight.shadow.camera.right = d;
  sunLight.shadow.camera.top = d;
  sunLight.shadow.camera.bottom = -d;
  sunLight.shadow.bias = -0.0001;
  scene.add(sunLight);

  // 4. Ambient & Ground Fill Light
  const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x3d3121, 0.8);
  scene.add(hemiLight);

  // Function to update sun position based on 24h slider (0 to 24)
  function updateSunPosition(hours) {
    const phi = THREE.MathUtils.degToRad(90 - (hours - 6) * 15);
    const theta = THREE.MathUtils.degToRad(180);

    const sunPosition = new THREE.Vector3();
    sunPosition.setFromSphericalCoords(1, phi, theta);

    sky.material.uniforms['sunPosition'].value.copy(sunPosition);
    sunLight.position.copy(sunPosition).multiplyScalar(1000);
  }

  updateSunPosition(13); // Default 13:00

  return { renderer, sunLight, updateSunPosition };
}
```

### Integration notes (specific to this codebase, not generic)

- This replaces the ad-hoc `Sky.tsx` / `Lighting.tsx` placeholders from
  `docs/04-architecture.md` step 4 — don't create a parallel system, refactor
  those files in place.
- `updateSunPosition(hours)` should be called from the *existing* Zustand
  time-of-day state (`lib/scene-state.ts`), not a new local slider — the whole
  point of the design doc's §3 motion principle ("sun-driven motion is
  physically justified") is that one time value drives sky, shadows, *and*
  dual-axis tracking rotation consistently. Wire this in as the single point
  where time → light comes from.
- **R3F decision (Phase 1):** implemented via R3F `<Canvas gl={…} shadows={…}>`
  plus a `three-stdlib` `Sky` baked through `PMREMGenerator` in `Sky.tsx` —
  not a raw `THREE.WebGLRenderer`. A second renderer would fight R3F's context
  and break the planned `@react-three/xr` path.
- **Sky delivery (Phase 1):** no 450000-unit dome mesh. Outdoor cameras use
  `far` 200–400, so the sky is baked to `scene.environment` / `scene.background`
  (PMREM) and rebuilt on a 15-minute `timeOfDay` quantize while fog tracks the
  live scrub.
- `renderer.toneMappingExposure = 1.25` and the sky uniforms above are
  starting values, not final ones — tune against the actual caldera altitude
  framing in the lore doc (thin atmosphere, harsher contrast) once the scene
  is visible, and note the final tuned values back in this doc so they don't
  silently drift from what's documented.

### Phase 1 tuned values (shipped)

| Parameter | Spec starting value | Shipped value | Where |
|---|---|---|---|
| `toneMappingExposure` | 1.25 | 1.25 | `Canvas.tsx` `gl` |
| `dpr` | `min(devicePixelRatio, 2)` | `[1, 1.75]` | `Canvas.tsx` (frame budget) |
| Shadow map | 2048 PCF soft | 2048 PCF soft | `Canvas.tsx` + `Lighting.tsx` |
| Shadow frustum half-extent | 500 | 95 | `Lighting.tsx` (caldera rim ~78) |
| Shadow camera far | 1500 | 280 | `Lighting.tsx` |
| Sun color / base scale | `#fff5ea` / 3.5 | `#fff5ea` / `intensity * 1.55` | `Lighting.tsx` via `getSunDirection` |
| Hemisphere | sky `#87ceeb`, ground `#3d3121`, 0.8 | sky `#7aa0c0`, ground rock `#8b5a3c`, 0.35 | `Lighting.tsx` (PMREM carries most ambient) |
| Turbidity | 2.0 | 1.2 | `Sky.tsx` `CALDERA_SKY` |
| Rayleigh | 2.5 | 1.4 | `Sky.tsx` `CALDERA_SKY` |
| Mie coefficient | 0.005 | 0.003 | `Sky.tsx` `CALDERA_SKY` |
| Mie directional G | 0.8 | 0.8 | `Sky.tsx` `CALDERA_SKY` |

### Review checklist for this phase specifically
- [x] No pitch-black voids remain in outdoor zones at daytime scrub values
      (PMREM + hemi + directional). **Open:** Subterranean Vault is still a
      near-black industrial interior by design of the current lights
      (`ambient 0.12` + two points) — full fix is Phase 4, not pulled forward.
- [x] Shadow mapping doesn't tank frame rate — build passes; shadow frustum
      kept caldera-sized (95 vs 500) and PMREM rebuilds quantized to 15 min.
      Headless SwiftShader sampling in this pass reported ~6–19fps (software
      GL — not a valid desktop target). Confirm 60fps desktop / 72–90fps VR
      on real GPU hardware in the PR review before calling the budget closed.
- [x] Sky reflects the caldera's altitude (harsher, higher-contrast light)
      per design doc §1 — turbidity/rayleigh lowered vs sea-level preset.
- [x] `updateSunPosition` is driven by the existing time-scrub state, not a
      second independent time value (`useSceneStore.timeOfDay` →
      `getSunDirection` → sky uniforms + directional light).

---

## Phases 2–5 — not yet specified in detail

Objectives are listed under "Core technical objectives" above. Write each
phase's detailed implementation doc the same way Phase 1 is written — code +
"Integration notes specific to this codebase" + a review checklist — and
append it here before starting that phase's implementation, so this doc stays
the single source of truth for the refactor the way `00-project-lore.md` is
for content.