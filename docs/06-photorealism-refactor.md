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

## Phase 2 — PBR Material Overhaul

### Objective
Upgrade outdoor facility surfaces from flat/under-tuned `MeshStandardMaterial`
(and the unlit-leaning Array Ring thermal `ShaderMaterial`) to physically based
materials that respond to Phase 1’s PMREM environment and directional sun —
bifacial-glass clearcoat on panels, galvanized steel on mounts/spire, and
volcanic caldera rock on terrain — per design doc §1.

### Implementation

```javascript
import * as THREE from 'three';

/** Shared facility PBR presets — single source for outdoor zones. */
export const PBR = {
  panelGlass: {
    color: 0x1a2332,
    roughness: 0.18,
    metalness: 0.55,
    // MeshPhysicalMaterial clearcoat ≈ bifacial front glass
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.15,
  },
  galvanizedSteel: {
    color: 0x8a9199,
    roughness: 0.38,
    metalness: 0.88,
    envMapIntensity: 1.0,
  },
  calderaRock: {
    color: 0x8b5a3c,
    roughness: 0.92,
    metalness: 0.04,
    envMapIntensity: 0.55,
  },
  receiverCore: {
    color: 0xfff1d6,
    emissive: 0xe0a53a,
    emissiveIntensity: 1.4,
    roughness: 0.22,
    metalness: 0.35,
  },
};

export function createPanelMaterial() {
  return new THREE.MeshPhysicalMaterial({ ...PBR.panelGlass });
}

export function createSteelMaterial() {
  return new THREE.MeshStandardMaterial({ ...PBR.galvanizedSteel });
}

export function createRockMaterial(overrides = {}) {
  return new THREE.MeshStandardMaterial({ ...PBR.calderaRock, ...overrides });
}

/**
 * Optional: lightweight procedural normal for rock (no HDRI/texture download).
 * Canvas/DataTexture, shared, dispose with the material helper.
 */
export function createRockNormalMap(size = 128) {
  // low-frequency noise → bump-like normals; keep tiny for mobile budget
}
```

Array Ring Alpha panels today use a custom thermal `ShaderMaterial` that does
**not** sample `scene.environment`. Phase 2 must not drop the thermal toggle.
Preferred approach: rebuild the panel fragment as a **MeshPhysical-compatible
path** — either:

1. `MeshPhysicalMaterial` + `onBeforeCompile` injecting thermal/select mixes, or
2. Keep a dual-mode material: Physical when thermal is off; upgraded shader when
   on that still samples lights/env approximately.

Do **not** leave thermal-mode panels as the current flat Lambert-ish shade while
day mode gets clearcoat — the scrub would expose a material discontinuity.

### Integration notes (specific to this codebase, not generic)

- **Scope — outdoor only.** Terrain, Aerial Overlook LOD blocks + aerial spire
  stand-in, Array Ring Alpha panels/posts/pad, HelioSpire deck/rail/receiver.
  **Subterranean Vault meshes stay for Phase 4** (industrial interior lighting
  + materials together). Do not “finish” vault PBR in this phase.
- **Landing hologram stays dual-mode.** `PlaceholderCaldera.tsx` wireframe
  `meshBasicMaterial` layers are intentional terminal aesthetics — do not
  convert them to Physical. Photoreal blend layers already use Standard; retune
  those to the shared `PBR` presets only if it keeps the morph coherent.
- **Centralize presets** in something like `components/scene/materials/facilityPbr.ts`
  (or `lib/materials.ts`) and consume from zone files — don’t scatter magic
  roughness/metalness numbers again. Reuse `SCENE_COLORS` hexes where they
  already match design tokens (`panel`, `steel`, `rock`).
- **Normal maps:** prefer one shared procedural rock normal (small DataTexture)
  over shipping new `public/` assets in this phase unless an asset is already
  approved. Panel micro-gridlines are **Phase 3** (detailed array instancing),
  not Phase 2 — Phase 2 is material response, not new panel geometry.
- **Env response:** Phase 1 already sets `scene.environment` outdoors. Physical/
  Standard materials should leave `envMap` unset so they pick it up automatically;
  tune `envMapIntensity` per preset (rock lower, glass higher).
- **Thermal shader** (`components/scene/shaders/thermalHeatmap.glsl.ts`) must be
  updated in the same phase as Array Ring panel materials — treating it as
  “out of scope” would leave zone 02 looking pre-Phase-1 when IR is on.
- **Performance:** clearcoat on ~276 aerial + ~96 array instances is acceptable
  if we do **not** add per-instance unique materials. One shared panel material
  per zone. Recheck 60fps after clearcoat lands; if Array Ring regresses, drop
  clearcoat on aerial LOD blocks first (distance hides glass) and keep it on
  human-scale Array Ring only.
- Follow the same review-gate loop as Phase 1 — smallest coherent commits
  (shared presets → terrain/spire steel/rock → panels+thermal), not one giant
  material dump.

### Review checklist for this phase specifically
- [x] Outdoor meshes respond visibly to PMREM + sun (specular on steel/glass,
      soft bounce on rock) — no remaining flat unlit look outdoors
- [x] Bifacial panels use clearcoat (`MeshPhysicalMaterial`) at Array Ring
      Alpha human scale; aerial LOD uses reduced clearcoat (`panelLod`)
- [x] Thermal heatmap toggle still works via `MeshPhysicalMaterial` +
      `onBeforeCompile` (ramp lives in `thermalHeatmap.glsl.ts`) — not a flat
      unlit fallback
- [x] Vault interior deliberately unchanged (Phase 4) — called out, not silently
      “half upgraded”
- [x] Shared PBR presets live in `components/scene/materials/facilityPbr.ts`;
      outdoor zone files consume factories instead of one-off literals
- [ ] Frame rate rechecked against 60fps desktop target after clearcoat on real
      GPU (build passes; confirm in PR review — AGENTS.md rule 5)

### Phase 2 tuned values (shipped)

| Surface | Material | Key params | Module |
|---|---|---|---|
| Panel glass (Array Ring) | `MeshPhysicalMaterial` | roughness 0.18, metalness 0.55, clearcoat 1.0 / 0.08, env 1.15 | `PBR.panelGlass` |
| Panel LOD (Aerial) | `MeshPhysicalMaterial` | clearcoat 0.35 / 0.2 (cheaper at distance) | `PBR.panelLod` |
| Galvanized steel | `MeshStandardMaterial` | roughness 0.38, metalness 0.88, env 1.0 | `PBR.galvanizedSteel` |
| Caldera rock / ring / rim | `MeshStandardMaterial` + procedural normal 128² | env 0.45–0.55 | `createRockMaterial` |
| Receiver core | `MeshStandardMaterial` | emissive amber 1.4 | `PBR.receiverCore` |

---

## Phase 3 — Detailed Array Instancing (Array Ring Alpha)

### Objective
Replace Array Ring Alpha’s flat `BoxGeometry` panel quads and sparse hand-placed
posts with **high-fidelity dual-axis tracking modules** — aluminum frame,
monocrystalline cell gridlines, bifacial glass laminate, and steel mounting
posts — still via `InstancedMesh`, holding the 60fps target. Aerial Overlook
LOD blocks stay low-detail (Phase 3 is human-scale only).

### Implementation

```javascript
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/**
 * Build one tracking-module prototype (local space, origin at post top / hinge).
 * Prefer merging glass + frame (+ optional thin grid bars) into ONE geometry so
 * a single InstancedMesh carries the module. Posts can be a second InstancedMesh
 * sharing the same instance matrices (or merged if pivot allows).
 */
export function createTrackingModuleGeometry() {
  const glass = new THREE.BoxGeometry(2.1, 1.05, 0.04);
  glass.translate(0, 0.55, 0); // hinge at bottom edge of laminate

  // Aluminum frame as a slightly larger shallow box / four thin rails
  const frame = new THREE.BoxGeometry(2.18, 1.13, 0.06);
  frame.translate(0, 0.55, 0);

  // Optional: bake cell grid as a CanvasTexture on the glass material instead
  // of extra geometry — cheaper and reads as monocrystalline gridlines.

  // mergeGeometries needs compatible attributes; use groups + multi-material
  // OR keep two InstancedMeshes (glass, frame) with identical instanceMatrix.
  return { glass, frame };
}

export function createPostGeometry() {
  const post = new THREE.CylinderGeometry(0.055, 0.07, 1.15, 6);
  post.translate(0, 0.575, 0);
  return post;
}

/**
 * Dual-axis pose from existing sun helpers — stepped, not smooth (design §3).
 * elevation → tilt; azimuth → yaw about vertical (relative to radial facing).
 */
export function moduleOrientation(sunElevationDeg, sunAzimuthDeg, radialYaw) {
  const stepElev = Math.round(Math.max(0, sunElevationDeg) / 5) * 5;
  const tilt = THREE.MathUtils.degToRad(Math.min(55, stepElev) * 0.7);
  const stepAz = Math.round(sunAzimuthDeg / 5) * 5;
  // Compose: face outward along ring, then apply stepped azimuth offset + tilt
  return { tilt, yaw: radialYaw /* + small azimuth delta if desired */ };
}
```

**Recommended draw setup for this codebase (96 modules):**

1. **Glass** `InstancedMesh` — `createArrayPanelMaterial()` (Phase 2 clearcoat +
   thermal `aTemp` / `aSelect` attrs). Click picking stays on this mesh.
2. **Frame** `InstancedMesh` — `createSteelMaterial()` or a lighter aluminum
   preset (`roughness ~0.32`, `metalness ~0.75`, color near `#b0b6bc`).
3. **Posts** `InstancedMesh` — replace the current 32 individual `<mesh>` posts
   with one instanced set aligned under each module.
4. Share one `instanceMatrix` write loop (dummy Object3D) across all three so
   dual-axis tracking stays locked.

Cell **gridlines**: prefer a small shared `CanvasTexture` / `DataTexture` on the
glass material (`map` or `roughnessMap` modulation) over dozens of bar meshes.
Document the texture size (e.g. 256², 6×10 cell grid) in the tuned-values table.

### Integration notes (specific to this codebase, not generic)

- **Zone scope = Array Ring Alpha only.** Do not rebuild Aerial Overlook rings
  into high-fidelity modules — those remain LOD density blocks per the tech
  stack’s “3.2 million panels” rule. Optionally retune aerial block aspect to
  vaguely match module proportions; not required for Phase 3 done.
- **Keep interaction contracts:** `ARRAY_PANEL_COUNT` (96), click →
  `selectedPanelId`, thermal attrs, Digital Twin HUD. Changing instance count
  or pick mesh without updating `getPanelTwin` / HUD is a bug.
- **Tracking motion:** today only elevation tilt is applied
  (`ArrayRingAlpha.tsx`). Phase 3 should make the dual-axis claim real:
  stepped tilt **and** a visible second axis (yaw or roll relative to the ring
  radial). Keep the 5° quantization from design doc §3 (“slightly stepped…
  not a continuous glide”).
- **Materials:** reuse `facilityPbr.ts`. Add an `aluminumFrame` preset there
  rather than one-off literals in the zone file. Glass keeps Phase 2 Physical +
  thermal compile path; if a grid `map` is added, ensure thermal mix still
  looks correct when IR is on (map can dim or be ignored under `uThermal`).
- **Geometry source:** procedural Three.js primitives + merge/groups — **no new
  `.glb` requirement** in this phase unless an asset is explicitly approved.
  Keep vertex counts modest (frame as 4–8 boxes max, or one shell + texture).
- **Shadows:** glass + frame + posts should `castShadow` / `receiveShadow` as
  appropriate; watch shadow-map cost with ~288 shadow casters (3×96). If FPS
  regresses, disable shadows on frames first, keep posts + glass.
- **Posts cleanup:** delete the sparse `ROW_RADIUS.map(… Array.from(length: 8))`
  individual meshes once instanced posts land — don’t leave both.
- Review-gate commits: (1) module geometry + aluminum preset + grid texture,
  (2) wire triple InstancedMesh + dual-axis matrix loop, (3) docs tuned values /
  checklist — not one giant zone rewrite without review.

### Review checklist for this phase specifically
- [x] Array Ring modules read as framed bifacial panels with cell gridlines at
      human scale — not flat unmarked boxes
- [x] Aluminum frames + steel posts are instanced (no per-post React mesh list)
- [x] Dual-axis tracking responds to `timeOfDay` with stepped motion on both axes
- [x] Click-select + thermal heatmap still work on the glass instances
- [x] Aerial Overlook remains LOD blocks (not high-fidelity modules)
- [ ] Frame rate rechecked at 60fps desktop after the extra instances/shadows on
      real GPU (build passes; confirm in PR review — AGENTS.md rule 5)

### Phase 3 tuned values (shipped)

| Piece | Approach | Notes |
|---|---|---|
| Glass | Instanced `BoxGeometry` 2.1×1.05×0.04 + cell grid map 256² (6×10) | Phase 2 Physical + thermal |
| Frame | Merged 4-rail aluminum, instanced | `PBR.aluminumFrame` `#b0b6bc` |
| Posts | Instanced cylinders (96), steel | Replaces sparse individual meshes |
| Tracking | 5° stepped elev tilt + azimuth yaw | `moduleOrientation` in `trackingModule.ts` |
| Aerial | Unchanged LOD blocks | Out of Phase 3 scope |

---

## Phase 4 — Subterranean Vault Realism

### Objective
Turn Zone 04 from a near-black box hall (`ambient 0.12` + two point lights) into
a readable **industrial LFP cooling vault**: layered LED work lights, glowing
charge/discharge conduits, emissive rack status strips, and vault-specific PBR
materials — without breaking the elevator descent, particle energy-flow shader,
or `getVaultFlow(timeOfDay)` charge/discharge behavior.

### Implementation

```javascript
import * as THREE from 'three';

/** Vault interior light rig — local to SubterraneanVault (not outdoor Lighting.tsx). */
export function VaultLighting({ mode /* charge | discharge | idle */ }) {
  // Cool cyan work LEDs along the hall; amber accent when discharging
  const primary = mode === 'discharge' ? 0xe0a53a : 0x4ec9e8;
  return (
    <>
      <ambientLight intensity={0.22} color={0x1a2430} />
      <hemisphereLight args={[0x2a3a4a, 0x0a0c10, 0.35]} />
      {/* Ceiling LED strip proxies — several point/spot lights, not one fill */}
      <pointLight position={[-6, -14.5, -2]} intensity={1.1} distance={18} color={primary} />
      <pointLight position={[6, -14.5, -2]} intensity={1.1} distance={18} color={primary} />
      <pointLight position={[0, -14.5, 6]} intensity={0.7} distance={16} color={0xb0c4d8} />
      {/* Shaft downlight */}
      <spotLight
        position={[0, -2, 0]}
        angle={0.45}
        penumbra={0.5}
        intensity={1.4}
        distance={28}
        color={0x9eb6c8}
        castShadow={false} // keep shadow budget for racks only if needed
      />
    </>
  );
}

/** Instanced LFP racks with status emissive driven by vault flow mode. */
export function createVaultRackMaterial(mode) {
  return new THREE.MeshStandardMaterial({
    color: 0x1a2332,
    roughness: 0.42,
    metalness: 0.55,
    emissive: mode === 'discharge' ? 0x2a1a08 : 0x0a2a30,
    emissiveIntensity: mode === 'idle' ? 0.15 : 0.55,
  });
}
```

**Geometry / set-dressing (procedural, no new GLB required):**

1. **Racks** — keep the 5×6 layout; convert to a single `InstancedMesh` (30
   instances) instead of 30 React `<mesh>` nodes. Optional thin front “status
   strip” as a second instanced box with stronger emissive.
2. **Conduits** — thin cylinder/torus runs along the ceiling or between racks;
   emissive cyan/amber matching particle charge/discharge colors so streams
   feel grounded in hardware.
3. **Floor / shaft / bus** — retune via vault PBR presets (dark coated steel,
   matte epoxy floor); slightly raise metalness on bus bar for specular from LEDs.
4. **Fog / background** — keep the enclosed feel (`#05070a`) but lift fog far
   plane / density so LED falloff reads before everything crushes to black.

### Integration notes (specific to this codebase, not generic)

- **Zone-local lights only.** Outdoor `Sky.tsx` / `Lighting.tsx` already unmount
  when `currentZone === "subterranean-vault"` (`Canvas.tsx` `outdoor` flag). Do
  **not** wire vault LEDs into the outdoor sun path. Clear `scene.environment` /
  PMREM when entering the vault if any bleed remains (Sky cleanup should already
  null these on unmount — verify, don’t double-own).
- **Drive accents from `getVaultFlow(timeOfDay)`** — same source as
  `EnergyParticleStreams` and `VaultReadout`. Charge → cyan LEDs/emissives;
  discharge → amber; idle → dim. One mode value, three consumers.
- **Particles stay.** Do not replace or remove `energyParticles.glsl.ts`; Phase 4
  adds hardware context around them. Tune particle brightness only if LEDs make
  them wash out.
- **Materials:** extend `facilityPbr.ts` with vault presets (`vaultFloor`,
  `vaultShaft`, `vaultRack`, `vaultConduit`) rather than scattering hexes in
  `SubterraneanVault.tsx`. Outdoor presets stay untouched.
- **Elevator + a11y:** `ElevatorRide` and `prefers-reduced-motion` behavior must
  remain. Don’t add motion that fights the descent or ignores reduced-motion.
- **Performance:** prefer instanced racks; cap vault point/spot lights (target
  ≤6). No shadow maps on every LED — at most one key light if shadows are kept.
  Recheck 60fps; vault should be cheaper than outdoor clearcoat scenes.
- **Post-processing is Phase 5** — no `EffectComposer` / bloom here even though
  emissives would “look better” with bloom. Earn the glow with materials + lights
  first; Phase 5 can amplify.
- Review-gate commits: (1) vault PBR presets + instanced racks, (2) LED/conduit
  light rig tied to flow mode, (3) docs tuned values / checklist.

### Review checklist for this phase specifically
- [x] Vault is readable at all `timeOfDay` values — no pitch-black void; racks
      and floor form is visible without crushing blacks
- [x] LED / emissive accents follow charge (cyan) vs discharge (amber) vs idle
      from `getVaultFlow`, consistent with particle stream direction
- [x] Racks are instanced; materials come from shared vault presets
- [x] Elevator descent + reduced-motion path still work
- [x] Energy particle streams still reverse/density-modulate with flow mode
- [ ] Frame rate rechecked at 60fps desktop on real GPU (build passes; confirm
      in PR review — AGENTS.md rule 5)

### Phase 4 tuned values (shipped)

| Piece | Approach | Notes |
|---|---|---|
| Lights | ambient 0.22 + hemi 0.35 + 3 points + 1 shaft spot | Accent color from flow mode; ≤6 lights |
| Racks | Instanced 5×6 boxes + status strips | `createVaultRackMaterial` / status strip |
| Conduits | Ceiling + vertical runs, emissive | Cyan charge / amber discharge / dim idle |
| Floor / shaft / bus | Vault PBR presets | Fog `#080b10` near 12 far 48 |
| Particles | Unchanged shader | Still driven by `getVaultFlow` |

---

## Phase 5 — not yet specified in detail

Objective remains under "Core technical objectives" (post-processing:
`EffectComposer`, bloom, SMAA). Write Phase 5’s detailed implementation section
the same way Phases 1–4 are written — code + "Integration notes specific to
this codebase" + a review checklist — and append it here before starting that
phase’s implementation.