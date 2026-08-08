# Agent Context — HelioGrid Complex (3D/VR Portfolio Experience)

You are starting work on this repository for the first time. Read this file fully before
writing any code or running any commands. It tells you what the project is, how to think
about design, what to build with, and — critically — how to work with the human on this repo.

Read in this order:
1. `docs/00-project-lore.md` — the facility spec and experience structure (source of truth for content)
2. `docs/01-problem-statement.md` — what this project is for and who it's for
3. `docs/02-design-principles.md` — the UX/UI direction (Google-style principles, applied)
4. `docs/03-tech-stack.md` — what to build with and why
5. `docs/04-architecture.md` — folder structure and conventions once code exists
6. `docs/05-git-workflow.md` — how you commit, branch, and request review
7. `docs/06-photorealism-refactor.md` — visual-fidelity refactor after the core zones exist (step 12)

Do not skip the docs and start scaffolding. `00-project-lore.md` in particular is the
canonical content reference — every HUD number, zone name, and interaction described
elsewhere derives from it. If content ever seems to drift between docs, that file wins.

## Non-negotiable working rules

**1. Small steps, always reviewed.**
Never batch multiple unrelated changes into one pass. Work in the smallest coherent
unit that could stand on its own (one zone, one shader, one HUD component, one doc).
After each unit:
- Summarize what changed and why, in plain language.
- Show the diff or new files.
- Explicitly ask: "Should I commit this?" — and wait for a yes before committing.
Do not commit, push, merge, or open a PR without explicit approval for that specific
change. Approval for one step is not approval for the next.

**2. No silent scope creep.**
If you notice something else that should be fixed while working on a step, name it
and ask whether to do it now or log it for later. Don't just do it.

**3. Follow `docs/05-git-workflow.md` exactly** for branch names, commit message
format, and PR structure. Don't invent your own conventions.

**4. Ground every design decision in `docs/02-design-principles.md`.**
If you're about to reach for a generic template layout (centered hero, three feature
cards, gradient CTA), stop and check the design doc — this project has a specific,
dark high-tech point of view derived from the lore, and it isn't that.

**5. Performance is a correctness constraint, not a polish pass.**
This scene targets 3.2 million panels conceptually (rendered via instancing + LOD,
never literal instance counts — see tech stack doc) across four distinct zones, with
a VR mode. If a change regresses frame rate, that's a bug, not a trade-off to mention
in passing. Call it out immediately.

**6. Responsive and accessible by default.**
Every screen/component you build should work from a small phone viewport up to
desktop, and should work with no headset at all (the free-cam/orbit experience is
the primary path for most visitors — VR is progressive enhancement). See
`docs/02-design-principles.md` and `docs/04-architecture.md`.

## First session checklist

1. Confirm the lore doc and problem statement read correctly against what the human
   actually wants built — don't assume the uploaded spec is 100% final.
2. Scaffold the Next.js app per `docs/04-architecture.md` (empty shell, no scene yet).
3. Get it running locally, screenshot/describe the empty shell, ask for review.
4. Only after that's approved, move to the first real milestone in
   `docs/04-architecture.md`'s build order (the landing hologram, before any zone).

Do not attempt to build all four zones, VR integration, and the full HUD system in
one pass. This project is sequenced deliberately — follow the build order.

## Source of truth

If any instruction here ever conflicts with something the human says directly in
conversation, the human's direct instruction in the moment wins — but flag the
conflict so the docs can be updated afterward.
