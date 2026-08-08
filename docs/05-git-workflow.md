# Git Workflow

## Golden rule

**Nothing is committed, pushed, or merged without the human explicitly approving
that specific change first.** Prior approval of a plan is not approval of the
diff. Approval of one commit is not approval of the next. Ask every time.

## Branching

- `main` — always deployable. Never commit directly to `main`.
- Feature branches: `feat/<short-description>` (e.g. `feat/instanced-panel-field`)
- Fix branches: `fix/<short-description>`
- Docs-only branches: `docs/<short-description>`
- Branch per build-order milestone from `docs/04-architecture.md` is a reasonable
  default (e.g. `feat/empty-shell`, `feat/hologram-transition`,
  `feat/array-ring-alpha`, `feat/vr-integration`), but a milestone can span
  multiple small branches/PRs if it's large — smaller is better than fewer.

## Commit convention (Conventional Commits)

```
<type>(<scope>): <short summary>

<optional body — why, not just what>
```

Types: `feat`, `fix`, `refactor`, `perf`, `docs`, `style`, `test`, `chore`

Examples:
- `feat(scene): add Array Ring Alpha instanced panel rows`
- `feat(shaders): add infrared thermal heatmap toggle`
- `perf(scene): switch panel rows to InstancedMesh, ~4x draw call reduction`
- `docs(architecture): lock folder structure after empty-shell review`

Scope should match the folder/area touched (`scene`, `shaders`, `ui`, `xr`,
`content`, `docs`, `lib`, or a zone name like `aerial-overlook`).

## The per-step loop (every single step, no exceptions)

1. Agent implements one coherent unit of work (see AGENTS.md — smallest
   standalone piece, not a whole milestone).
2. Agent presents:
   - What changed and why, in plain language (not just "updated files").
   - The diff (or new file contents).
   - Anything the human should specifically look at or decide (a design call,
     a trade-off, a risk).
3. Agent asks explicitly: **"Should I commit this?"**
4. Human responds with approval, changes requested, or rejection.
   - Approval → agent commits with a properly formatted message, states the
     commit hash/summary back, and stops — does not automatically continue to
     the next step unless told to.
   - Changes requested → agent revises and repeats from step 2.
   - Rejection → agent asks what to do instead; does not silently retry the same
     approach.

## Pull requests

- Open a PR when a milestone (per the build-order in `docs/04-architecture.md`)
  is complete and its constituent commits are all approved and committed.
- PR description follows `.github/PULL_REQUEST_TEMPLATE.md`.
- Agent asks for explicit approval before merging, same as for commits. Prefer
  squash or rebase merge to keep `main` history readable — confirm preference
  with the human on the first PR and reuse it after.

## What the agent should never do unprompted

- Force-push to any shared branch.
- Rewrite history on `main`.
- Delete branches without confirming they're merged/no-longer-needed with the
  human.
- Commit generated/build artifacts, large binary assets outside `public/models`
  and `public/hdri` (with compression already applied), or `.env` files —
  check `.gitignore` if unsure rather than guessing.
