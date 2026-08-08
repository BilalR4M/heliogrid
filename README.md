# HelioGrid Complex

A fictional **2.1 GW** flagship solar facility delivered as an interactive
**3D / VR portfolio experience**. Visitors enter through a dark terminal
landing with a wireframe caldera hologram, then move into a photoreal
WebGL scene across four spatial zones — usable on desktop and mobile, with
WebXR as progressive enhancement (not required).

| Zone | What you get |
|---|---|
| **01 · Aerial Overlook** | Whole-field LOD, cinematic orbit, power/wind HUD |
| **02 · Array Ring Alpha** | Dual-axis instanced tracking modules, Digital Twin, IR thermal |
| **03 · HelioSpire Tower** | Observation deck, light-vector beams |
| **04 · Subterranean Vault** | Elevator descent, LFP racks, charge/discharge particle flow |

Cross-zone systems: 24-hour sun scrub (lighting + tracking), spatial audio,
zone navigation / teleport transitions, bloom + SMAA post-processing.

## Status

**Running Next.js app** on `dev`. Core zones and cross-zone systems are in;
the photorealism refactor (build-order step 12, phases 1–5) is merged.

**Next up** (see `docs/04-architecture.md` build order):

- Step 9 — VR integration (`@react-three/xr`)
- Step 10 — Responsive + accessibility pass
- Step 11 — Technical case study panel + measured performance audit

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the landing terminal,
then **Enter Experience** → `/experience`.

```bash
npm run build && npm start   # production
npm run lint
```

**Stack (high level):** Next.js App Router · React Three Fiber · drei ·
Three.js · Zustand · suncalc · Tailwind CSS v4 · `@react-three/postprocessing`

Details and rationale live in [`docs/03-tech-stack.md`](docs/03-tech-stack.md).

## How documentation is managed

This repo treats `docs/` as the **product source of truth**, not after-the-fact
notes. Code follows the docs; when they drift, docs win and code is updated to
match (except when the human overrides in conversation — then flag the conflict
and update the docs afterward).

### Precedence

1. **`docs/00-project-lore.md`** — canonical facility content (names, numbers,
   zone order, interactions). HUD copy and sims derive from here /
   `content/facility-spec.ts`.
2. **`docs/02-design-principles.md`** — visual / UX direction for the terminal
   and the photoreal scene.
3. **`docs/03-tech-stack.md`** + **`docs/04-architecture.md`** — how it’s built
   and in what order.
4. **`docs/05-git-workflow.md`** — branches, conventional commits, review gates.
5. **`docs/06-photorealism-refactor.md`** — phased visual-fidelity refactor
   (renderer → PBR → array modules → vault → post-FX). Each phase is specified
   *in that file* before implementation; tuned values are written back after
   shipping so the doc stays accurate.

**`AGENTS.md`** is the agent entry point: read order, non-negotiable working
rules (small reviewed steps, no silent scope creep, performance as correctness).
Humans can start at the lore doc; agents should start at `AGENTS.md`.

### Working rules for docs

- Prefer **updating an existing numbered doc** over adding parallel READMEs.
- Architecture / build-order changes go in `04`; new major passes get their own
  numbered file (like `06`) and a line in `AGENTS.md`’s read list.
- After a phase ships, record **tuned values and checklist status** in the
  governing doc (see Phase 1–5 tables in `06`).
- Do not invent zone names, capacities, or HUD metrics — pull from lore /
  `content/`.

### Docs index

| File | Purpose |
|---|---|
| [`AGENTS.md`](AGENTS.md) | Agent entry point and working rules |
| [`docs/00-project-lore.md`](docs/00-project-lore.md) | Canonical facility spec & experience structure |
| [`docs/01-problem-statement.md`](docs/01-problem-statement.md) | What this is and who it’s for |
| [`docs/02-design-principles.md`](docs/02-design-principles.md) | UX / UI direction |
| [`docs/03-tech-stack.md`](docs/03-tech-stack.md) | Stack choices and performance targets |
| [`docs/04-architecture.md`](docs/04-architecture.md) | Folder structure and build order |
| [`docs/05-git-workflow.md`](docs/05-git-workflow.md) | Branching, commits, review gates |
| [`docs/06-photorealism-refactor.md`](docs/06-photorealism-refactor.md) | Photorealism refactor phases (step 12) |

## Repo layout (short)

```
app/                  # Next.js routes — / and /experience
components/
  landing/            # Terminal + hologram entry
  scene/              # R3F canvas, zones, sky, lighting, post-FX
  ui/                 # HUD overlays (outside <Canvas>)
content/              # Typed lore (facility-spec, zones)
lib/                  # scene-state, sun, facility-sim, audio
docs/                 # Product + process source of truth
```

Full conventions: [`docs/04-architecture.md`](docs/04-architecture.md).

## Contributing / agents

Work in the smallest coherent unit, show the diff, and ask before committing —
see [`docs/05-git-workflow.md`](docs/05-git-workflow.md) and `AGENTS.md`. Default
integration branch is `dev`; keep history linear (rebase / squash merge).
