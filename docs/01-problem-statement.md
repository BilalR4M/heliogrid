# Problem Statement

## What this is

**HelioGrid Complex** is a portfolio piece delivered as a fictional flagship
facility: a 2.1GW solar installation with a fully-realized spatial web/VR
experience built around it. The facility itself (see `00-project-lore.md`) is
the content — the *reason* it exists is to demonstrate spatial web engineering
(WebXR, GLSL shaders, instanced rendering at scale, real-time data-driven
lighting/audio) at a level that a static portfolio page cannot.

Unlike a conventional "about me + project grid" portfolio, there's no pretense
that HelioGrid is a real operating facility the builder manages — it's a
showcase built *as if* it were a real client deliverable for an energy company,
which lets it carry production-quality UX (HUD systems, technical case study
panel, a genuine 4-zone spatial narrative) without needing real operational
data to back it.

## 1. The problem

A conventional portfolio site can't demonstrate certain skills — spatial
reasoning, shader work, real-time rendering performance at scale, WebXR — 
because the medium (a static page, a project card, a resume line) can't carry
them. Recruiters and technical reviewers skim; they rarely read a stack list
and infer competence from it.

HelioGrid solves this by being the artifact itself: a fully spatial, data-driven,
VR-capable experience that a reviewer can walk through in under two minutes and
come away with direct evidence of engineering ability — not a description of it.

## 2. Who this is for

- **Primary**: technical recruiters, hiring managers, and engineers evaluating
  the builder's skill. Most visit on a laptop, spend well under two minutes
  unless something hooks them immediately, and do not own a VR headset. The
  landing hologram → zoom-in transition (see lore doc, §1) has to earn attention
  in the first few seconds.
- **Secondary**: visitors with a VR headset (Quest, Vision Pro class) who want
  the full immersive walkthrough — the "wow" tier, entered via the one-click
  WebXR button, never the default/required path.
- **Tertiary**: anyone reviewing this as a technical case study specifically —
  the togglable "Technical Case Study" panel (see lore doc, §3) is built for
  this audience and should read like real engineering documentation, not
  marketing copy.

## 3. How the site addresses it

- **The hologram-to-scene transition is the thesis statement.** It's the first
  thing every visitor sees, and it's a direct demonstration of the exact
  capability being showcased (seamless scene transitions, WebGL performance) —
  see design doc, "hero as thesis."
- **Four zones, not one scene.** Aerial Overlook, Array Ring Alpha, HelioSpire
  Tower, Subterranean Vault (lore doc §2) each demonstrate a different technical
  problem: free-cam cinematic camera work, human-scale instanced geometry with
  per-object interaction, large-vista rendering with light-vector visualization,
  and shader-driven particle systems, respectively. The variety is deliberate —
  it's a technical range statement, not just a bigger scene.
- **Real-seeming data as substance.** HUD numbers (power output, cell
  temperature, voltage, degradation logs) are driven by the facility spec and a
  simulated but internally consistent day/night model (time scrub, lore doc
  §3), not decorative placeholder numbers. Consistency is what sells it as
  engineering rather than a demo reel.
- **Progressive fidelity, not a hard gate.** Desktop/mobile visitors get the
  full free-cam/orbit experience with zero headset required. VR is additive.
- **The case study panel closes the loop for reviewers** who want to verify the
  claims — stack, performance approach, and specific techniques used, in their
  own words, not marketing language (see design doc §7).

## 4. What success looks like

- A visitor understands they're looking at a solar facility within the first
  few seconds of the landing transition, without instructions.
- A technical reviewer can open the case study panel and verify that the
  performance claims (60fps target, LOD, instancing, Draco compression) match
  what they're actually experiencing.
- The site works correctly with zero VR hardware and is materially more
  impressive with it.
- Load time and first interaction are fast enough that an impatient reviewer
  doesn't bounce before the hologram transition completes.

## 5. Resolved / no longer open

Earlier drafts of this doc left "portfolio vs. real product" as an open
question. It's resolved: HelioGrid is a fictional flagship facility built
specifically to be a portfolio centerpiece, and copy throughout should lean
into that — confident, technical, "this is how a real energy company's site
would read" — rather than caveated as a demo.
