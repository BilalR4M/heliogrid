# Architecture & Folder Structure

Describes the **actual Next.js app**, which does not exist yet. The agent
scaffolds it as step 1 of the real build (see AGENTS.md, "First session
checklist"). Grow into this structure per the build order below — don't create
it all at once.

## Target folder structure

```
app/
  layout.tsx                 # Root layout, theme, font loading
  page.tsx                   # Landing terminal — hologram, "Enter Experience"
  experience/                # The main 3D/VR route once past the landing transition
    page.tsx                  # Mounts the 3D canvas (client, dynamic import)
  api/                       # Not expected to be needed — see tech stack doc

components/
  landing/
    HologramTerminal.tsx      # Dark terminal UI + wireframe caldera hologram (2D/lightweight 3D)
    EnterExperienceButton.tsx # Triggers the zoom-in transition into /experience
  scene/                     # Everything inside <Canvas> at /experience
    Canvas.tsx                 # Canvas wrapper, client-only, dynamic-imported
    zones/
      AerialOverlook.tsx        # Zone 01 — cinematic/free-cam, whole-field LOD representation
      ArrayRingAlpha.tsx        # Zone 02 — instanced panel rows, per-panel interaction
      HelioSpireTower.tsx       # Zone 03 — observation deck, light-vector visualization
      SubterraneanVault.tsx     # Zone 04 — elevator sequence, particle energy-flow shader
    ZoneTransitionManager.tsx  # Teleport/camera-move logic between the four zones
    Terrain.tsx                # Caldera terrain, shared across zones
    Sky.tsx                    # Thin-atmosphere sky, driven by suncalc
    Lighting.tsx                # Directional "sun" + ambient/env, tied to time scrub
    shaders/
      thermalHeatmap.glsl.ts
      lightVectors.glsl.ts
      energyParticles.glsl.ts
      atmosphericScatter.glsl.ts
    XRRig.tsx                  # VR controllers, teleport, comfort vignette (esp. vault descent)
  ui/                         # 2D HUD/overlay layer (Tailwind), NOT inside <Canvas>
    HUD/
      PowerOutputReadout.tsx
      DigitalTwinCard.tsx       # Per-panel data card, zone 02
      TimeScrub.tsx              # 24-hour sun slider
      ThermalToggle.tsx
    EnterVRButton.tsx
    TechnicalCaseStudyPanel.tsx # Togglable, see lore doc §3 / problem statement §3
    LoadingProgress.tsx
    ZoneNav.tsx                 # Names/order must match lore doc exactly
  content/                   # Non-3D fallback / accessible content mirror
    ZoneSummary.tsx            # Text alternative to each spatial zone, for a11y

lib/
  scene-state.ts              # Zustand store — current zone, selected panel, time, VR status
  sun.ts                       # suncalc wrapper, feeds lighting + tracking rotation
  facility-sim.ts              # Deterministic HUD data (power, temp, voltage) from lore spec + time
  audio.ts                     # Positional audio setup/helpers
  xr-support.ts                # navigator.xr feature detection

content/
  facility-spec.ts             # Typed version of 00-project-lore.md's spec table — single source
  zones.ts                      # Zone metadata: names, order, descriptions (matches lore doc exactly)
  case-study-copy.ts            # Technical case study panel content

public/
  models/                      # Compressed .glb assets, per zone subfolder
  hdri/                        # Compressed environment maps
  audio/                       # Positional audio sources

docs/                        # Kept up to date as decisions are made; 00-project-lore.md is canonical
```

## Conventions

- **Client boundary**: only `components/scene/Canvas.tsx` and its children
  touch Three.js/R3F. `app/experience/page.tsx` imports it via `next/dynamic`
  with `ssr: false`. Nothing under `components/ui/` or `components/content/`
  imports from `@react-three/fiber`.
- **Instancing + LOD over duplication**: any repeated geometry goes through a
  zone's instancing logic, per the "3.2 million panels" handling in the tech
  stack doc — never hand-placed individual meshes at range.
- **Facility data lives in `content/facility-spec.ts`**, sourced directly from
  `docs/00-project-lore.md`. If the two drift, the docs file wins — update code
  to match, not the other way around.
- **Zone names/order are fixed** per the lore doc: Aerial Overlook → Array Ring
  Alpha → HelioSpire Tower → Subterranean Vault. Don't reorder or rename in
  code without updating the lore doc first and flagging the change.
- **Every 3D-only interaction gets a non-3D equivalent**: each zone's
  `components/content/ZoneSummary.tsx` entry provides accessible text content
  covering the same information as the spatial experience — see design doc §5.

## Build order (do not reorder without discussing)

1. **Empty shell**: Next.js app scaffolded, Tailwind configured, empty
   `<Canvas>` placeholder at `/experience`. Confirms client-boundary setup.
   Review gate.
2. **Landing terminal**: dark HUD-style landing page with the static wireframe
   hologram (no zoom transition yet). Review gate — this locks the dark/terminal
   color and type tokens from the design doc.
3. **Hologram → scene transition**: the signature zoom-in moment connecting
   landing to a placeholder photoreal scene. This is worth its own dedicated
   step given its role as the site's thesis (see design doc §3). Review gate.
4. **Aerial Overlook**: terrain, sky, whole-field LOD representation,
   cinematic/free-cam camera, basic HUD (power output). Review gate.
5. **Array Ring Alpha**: instanced panel rows at human scale, click-to-select,
   Digital Twin HUD card, thermal heatmap shader toggle. Review gate.
6. **HelioSpire Tower**: observation deck, light-vector visualization shader.
   Review gate.
7. **Subterranean Vault**: elevator sequence, energy-flow particle shader.
   Review gate.
8. **Cross-zone systems**: time scrub wired to lighting + tracking rotation
   across all zones, spatial audio, zone-to-zone teleportation/navigation.
   Review gate.
9. **VR integration**: `@react-three/xr`, Enter VR button with feature
   detection, teleport locomotion between zones, controller ray-select mirroring
   desktop click interaction, comfort vignette for the vault descent. Review
   gate.
10. **Responsive + accessibility pass**: mobile/tablet layouts and controls,
    reduced asset budget path, reduced-motion mode, contrast audit, zone text
    mirrors. Review gate.
11. **Technical case study panel + performance audit**: verify the panel's
    claims against actual measured frame rates and confirm compression/LOD
    numbers are accurate before publishing them. Review gate.
12. **Photorealism refactor**: renderer calibration, atmospheric sky lighting,
    PBR materials, detailed array instancing, vault interior lighting, and
    post-processing — phased per `docs/06-photorealism-refactor.md`. Each
    phase is its own review-gated set of commits; do not start Phase N+1
    before Phase N is reviewed and merged. Review gate per phase.

Each numbered step is its own set of commits per the git workflow doc — not one
commit per step, but no step's work should be commit-ready without review as
described in AGENTS.md.
