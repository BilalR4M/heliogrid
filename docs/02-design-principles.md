# Design Principles

This project follows Google's Material Design foundations — chosen because
they're built around motion, depth, and responsive systems, which map onto a
3D/spatial site in a way flat web guidance doesn't. Each principle below is
translated into what it means *for HelioGrid specifically*, derived from
`00-project-lore.md`. Do not apply these generically — HelioGrid has a specific
aesthetic identity (high-altitude, high-tech, dark-terminal-to-photoreal) and
the design should come from that world, not a default template. See also the
general frontend design guidance available for typography/copy/restraint
practices — complementary to, not a substitute for, the decisions below.

## 1. Material is the metaphor, made literal

The "material" here is the actual facility — bifacial PV glass, galvanized
tracking mounts, the volcanic caldera floor, the HelioSpire's optics, the LFP
battery vault. UI chrome (HUD overlays, the case study panel) should read as
instrumentation *of that world* — like a real facility's control-room display —
not a web UI pasted over a 3D render.

**Token direction:**
- **Color**: two registers, matching the two states in the lore doc — (1) the
  landing terminal: near-black background, glowing cyan/amber wireframe
  hologram, monospace HUD green or amber for data readouts (think real SCADA/
  control-room palettes, not generic sci-fi neon); (2) the photorealistic
  scene: bifacial panel blue-black and silver, galvanized steel gray, caldera
  rock ochre/rust, thin-atmosphere sky (deeper blue, harsher sun contrast than
  sea-level — this is a real consequence of the 3,800m altitude in the lore,
  use it). Lock 4–6 named hex values per register before building.
- **Type**: a monospace/technical face for HUD numbers and the case study panel
  (this is instrumentation, it should look measured, not designed), a cleaner
  display face for the landing terminal headline and zone titles.
- **Motion**: the hologram-to-photoreal transition is the single most important
  motion moment in the site (see §3) — everything else should be calmer by
  comparison so it doesn't compete.

## 2. Bold, deliberate use of scale

The lore's own numbers do the work — 2.1GW, 3.2 million panels, a 250m tower,
3,800m altitude. Let the Aerial Overlook zone establish genuine scale (visitor
feels small against the field) before Array Ring Alpha brings them to human
scale at a single panel. That scale *contrast* between zones is more effective
than any one zone being individually large — see lore doc §2 for the intended
zone order, which is built around this progression (vast → intimate → vast
again from height → enclosed/underground).

## 3. Motion has meaning, not decoration

- **The landing transition** (wireframe hologram → zoom-in → photoreal scene,
  lore doc §1) is the site's signature element. It deserves real
  choreography: easing, a believable sense of "phasing" from data-visualization
  to physical reality, timed to hold attention for the first few seconds a
  skimming reviewer gives it.
- **Sun-driven motion**: panel dual-axis tracking rotation, shadow movement,
  and ambient lighting all respond to the 24-hour time scrub (lore doc §3) —
  this motion is physically justified, not decorative, and should look
  mechanically real (tracking motors have real, slightly stepped movement, not
  a smooth continuous glide).
- **Vault particle streams** (zone 04) visualize actual energy flow direction —
  particles should reverse/change density based on charge vs. discharge state,
  not loop identically regardless of the time-of-day state.
- Don't animate everything else. The four zones and the landing transition are
  where motion is earned; keep HUD updates and panel transitions calm and
  functional.

## 4. Feedback and system status are always visible

- Hovering/pointing at an interactive panel (zone 02) highlights it and
  previews that a Digital Twin HUD is available before click.
- The infrared thermal heatmap toggle (zone 02) and light-vector visualization
  (zone 03) need a clear on/off state, not a silent shader swap.
- WebXR entry button shows detected/connecting/active states explicitly — never
  a silent failure if WebXR isn't supported on the visitor's device.
- Asset loading (a facility this size implies substantial glTF/HDRI payload)
  shows real progress, not an indefinite spinner.

## 5. Accessibility and inclusivity are baseline

- The full four-zone experience must be navigable with mouse + keyboard and
  touch, with zero VR hardware — this is the majority path, not a fallback.
- Respect `prefers-reduced-motion` — provide a reduced/static-camera mode,
  especially important given the free-cam flight and elevator descent moments.
- HUD text and case-study panel content must meet WCAG AA contrast against the
  dynamic 3D background — give HUD elements their own solid or blurred backing
  rather than floating text directly over the render.
- Every zone's core content (what it shows, what its data means) needs a text
  equivalent for a visitor who can't parse the spatial scene — particularly the
  Digital Twin HUD data and the vault's energy-flow visualization.
- Spatial audio (lore doc §3) should never be the only channel a status change
  is communicated through — pair with a visible HUD state.

## 6. Responsive is a first-class layout problem

- **Mobile**: reduced polygon/texture budget, touch-drag free-cam, no VR entry
  shown, HUD simplified to essentials (power output + zone name), thermal
  heatmap and light-vector shaders may need a lower-cost fallback version.
- **Desktop, no headset**: full four-zone experience, mouse-drag/WASD free-cam,
  full HUD, VR entry button shown only if `navigator.xr` reports support.
- **VR headset connected**: full WebXR session across all four zones, teleport
  locomotion between zones, controller ray-select for panel interaction in
  Array Ring Alpha, comfort vignette during the vault elevator descent
  specifically (vertical motion is a common VR-comfort trigger point).

## 7. Content and copy follow the interface's voice

- HUD labels read like real facility instrumentation: units, precision, and
  terminology consistent with an actual SCADA/monitoring system — "Cell Temp,"
  "Output (MW)," not casual paraphrases.
- The Technical Case Study panel is written to a technical reviewer directly —
  plain, specific, verifiable claims (stack, technique, target metric), no
  marketing adjectives.
- Zone names and transition copy stay in the facility's own voice throughout
  (see lore doc for exact zone names) — don't rename or soften them into
  generic portfolio-speak ("Gallery" instead of "Array Ring Alpha").

## Process reminder for the agent

Before building any zone or HUD element, run the brainstorm → plan → critique
loop from the general design guidance: a compact token system for that specific
piece, checked against generic AI-design defaults (warm cream + serif,
near-black + single acid accent used decoratively rather than functionally,
broadsheet layout) — HelioGrid's dark-terminal palette should earn its place
functionally (it's a control-room aesthetic) rather than being a stylistic
default.
