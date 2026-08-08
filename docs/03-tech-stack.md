# Tech Stack

## Core

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js (App Router, TypeScript) | Familiar; clean split between the 2D landing terminal/HUD and the 3D scene |
| 3D engine | Three.js via **React Three Fiber (R3F)** | Declarative scene graph as JSX across four distinct zones |
| 3D helpers | **@react-three/drei** | Cameras, controls, loaders, environment/HDRI, 3D text (HUD labels in-scene) |
| VR/XR | **@react-three/xr** (WebXR) | Session management, controllers, teleport between zones, hand tracking |
| Shaders | Custom **GLSL** (via `shaderMaterial` from drei, or raw `THREE.ShaderMaterial`) | Heat-shimmer, atmospheric scattering (high-altitude sky), infrared thermal heatmap, energy-flow particle streams |
| State | **Zustand** | Current zone, selected panel, time-of-day (scrub position), VR status, HUD toggle states |
| Styling | Tailwind CSS | Landing terminal UI + HUD/case-study panel layer — kept out of the `<Canvas>` |
| Sun/time data | `suncalc` | Drives the 24-hour time scrub — sun angle feeds directly into lighting *and* the dual-axis tracking rotation logic, so both stay physically consistent |
| Spatial audio | **Web Audio API**, via drei's `PositionalAudio` or Howler.js with panner nodes | Wind, transformer hum, tracking-motor clicks — positional, not flat ambient loops (see design doc §5) |

## Asset pipeline

- **Blender** — model/optimize panel units, tracking mounts, the HelioSpire
  tower, caldera terrain, vault interior
- **glTF / GLB** — export format; Draco geometry compression + KTX2/Basis
  texture compression (explicitly called out in the lore doc's case-study
  claims — the case study panel should be able to state real compression
  numbers, so don't skip this)
- **gltfjsx** — GLB → typed R3F component conversion

## The "3.2 million panels" problem

The lore's nameplate figure (3.2M bifacial panels) is a narrative/content
number, not a literal instance count to render. Handle it explicitly:
- **Aerial Overlook**: represent the full field at distance via a small number
  of low-poly instanced "block" meshes or a baked/shader-driven texture
  representing panel density — never attempt to instance millions of real
  meshes here.
- **Array Ring Alpha**: only the panels within the visitor's local viewing
  radius are real, individually-interactive `InstancedMesh` instances; use LOD
  and frustum culling aggressively outside that radius.
- The case study panel should describe this technique honestly (e.g., "LOD +
  instancing represent the full 3.2M-panel field without literal per-panel
  geometry at range") — this is itself a demonstration of engineering judgment,
  not a thing to hide.

## Client-boundary rule (Next.js + R3F)

R3F/Three.js requires a browser WebGL context — it cannot run during SSR.
Every component that touches `<Canvas>` must be:
1. Marked `'use client'`, and
2. Loaded via `next/dynamic` with `{ ssr: false }` at the point it's mounted.

Get this working with a trivial scene before building the landing hologram —
first checkpoint in the architecture doc's build order.

## Performance constraints (requirements, not tuning)

- `InstancedMesh` for all repeated geometry (panel rows, tracking mounts).
- LOD per zone, especially Aerial Overlook (whole-field view) and HelioSpire
  Observation Deck (long view distance).
- Frustum culling + fog/atmospheric falloff for outdoor zones — also serves the
  "thin atmosphere, harsher contrast" lighting goal from the design doc.
- Target: 60fps minimum on desktop/mobile fallback (this is the number the
  case study panel commits to publicly — treat it as a hard target, not
  aspirational), 72–90fps in VR sessions.
- Shader cost audit for the infrared heatmap, light-vector visualization, and
  vault particle streams specifically — these are the most expensive visual
  features and the most likely place a frame budget regression hides.

## Domain/data layer

No real backend needed — HUD numbers (power output, cell temp, voltage,
degradation logs, wind speed) are derived from `00-project-lore.md`'s spec
table plus a deterministic simulated day/night curve driven by the time scrub
and `suncalc`. Keep this in `lib/facility-sim.ts` (see architecture doc) as
pure functions — no API routes needed unless real persistence (e.g. saved time-
of-day preference) is explicitly requested later.

## Explicitly out of scope unless requested

- No CMS — zone content and copy are typed local data.
- No multiplayer/shared VR sessions.
- No real backend/database — all facility data is simulated per above.
