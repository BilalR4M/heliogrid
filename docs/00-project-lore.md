# Project Lore & Facility Spec — Source of Truth

This is the canonical world/content reference. Every other doc (problem
statement, design, architecture) derives from this — if a detail here changes,
update it here first, then propagate.

## Origin & vision

Built in the sun-drenched floor of the **Helios Caldera** — a high-altitude
extinct volcanic basin elevated 3,800 meters above sea level — the **HelioGrid
Complex** represents the apex of modern clean-energy engineering. Operating
above 40% of the Earth's atmospheric density, the complex receives
non-attenuated solar radiance, yielding a 35% increase in photon capture
efficiency compared to sea-level installations.

Commissioned by **HelioGrid Dynamics**, the complex acts as both a primary
energy anchor for regional industrial grids and a global testbed for
next-generation grid synchronization technology.

## Facility specification

| Parameter | Specification |
|---|---|
| Nameplate capacity | 2.1 Gigawatts (GW) direct solar output |
| Grid energy storage | 4.2 Gigawatt-hours (GWh), subterranean LFP battery system |
| Primary solar layout | 3.2 million bifacial PV panels, active dual-axis tracking |
| Core architecture | Concentric field rings surrounding a 250m Central Optics Tower |
| Cooling & maintenance | Autonomous drone fleet, waterless electro-static dust clearance |
| Grid tie-in | High-Voltage Direct Current (HVDC) underground trunk line |

These numbers are content, not arbitrary — they should show up verbatim in HUD
readouts, the technical case study panel, and any narrative copy. Treat this
table as the ground truth if any other doc drifts from it.

## Experience structure

### 1. Landing — the Holographic Caldera
- Initial state: dark, high-tech terminal interface with a glowing 3D wireframe
  hologram of the Helios Caldera.
- "Enter Experience" triggers a camera zoom *into* the hologram, transitioning
  seamlessly from wireframe to full-scale photorealistic rendering. This
  transition is the site's signature moment — see design doc.

### 2. The four zones (teleportation nodes)

```
[01. Aerial Overlook] → [02. Array Ring Alpha] → [03. HelioSpire Tower] → [04. Subterranean Vault]
```

**01 — Aerial Overlook (free-cam flight)**
- Orbit the full 2.1GW caldera via cinematic camera path, or manual free-fly.
- HUD overlay: live global power output (MW), local wind speed, current sun
  angle.

**02 — Array Ring Alpha (ground-level, human scale)**
- Teleport between dual-axis tracking panel rows at human scale.
- Click a panel → Digital Twin HUD: cell temperature, real-time voltage
  output, efficiency degradation logs.
- Toggle: infrared thermal heatmap shader over panel surfaces.

**03 — HelioSpire Observation Deck**
- 250m up, atop the central receiver spire. 360° view of the full field.
- Visualized light-beam vectors show mirror-field convergence onto the core
  receiver.

**04 — Subterranean Battery Vault**
- Virtual elevator descends into the cooling vaults housing the grid-scale LFP
  batteries.
- Particle-stream shader visualizes energy flow into/out of storage cells,
  driven by day/night demand curve.

### 3. Cross-zone UI/controls
- **24-hour time scrub**: sun slider from dawn to nightfall — real-time shadow
  casting, dual-axis tracking rotation, ambient lighting all respond live.
- **Spatial audio**: high-altitude wind, low electromagnetic transformer hum,
  tracking-motor clicks as panels reposition. Audio should be positional
  (louder near its source), not a flat ambient loop.
- **VR mode**: one-click WebXR entry (Meta Quest / Vision Pro class headsets)
  for full spatial immersion — additive, not required (see design doc §5/§6).
- **Technical case study panel** (togglable): tech stack, performance approach
  — this is the portfolio-facing layer for reviewers, see problem statement.
