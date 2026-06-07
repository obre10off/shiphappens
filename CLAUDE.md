# CLAUDE.md — Project rules

## Keep project memory current (required)

[PROJECT_MEMORY.md](./PROJECT_MEMORY.md) is the living memory of this project. **You must update it:**

- **After any change to a plan file** — `BUILD_PLAN.md`, `prd.md`, or anything under `docs/`
  (`DEV_PLAN.md`, `part-*.md`). Reflect the new decision/scope in the relevant section.
- **After implementing each build step / part** — tick the matching item in
  *Implementation status*, append a dated line to the *Progress log*, and note any new
  decisions or discrepancies.

Always bump the `Last updated:` date in PROJECT_MEMORY.md when you edit it, and commit the
memory update together with the change that triggered it.
