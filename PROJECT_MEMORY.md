# Project Memory — Clavis (Compliance Analyst Agent)

> **Living memory of this project.** Keep this file current — see the rule in
> [CLAUDE.md](./CLAUDE.md). Update it whenever a plan file changes or a build step ships.
> Last updated: 2026-06-07 (added agent tool-calling visualization).

## What we're building

An **AI compliance analyst** — a KYC/AML screening tool. Given a person/company, it screens
against **OpenSanctions** (sanctions + PEP), scans **adverse media** via Google search + LLM,
optionally checks **social media**, then synthesizes an **audit-ready risk report** with an
overall band (`clear` / `review` / `high`), a 0–100 weighted score, per-category scores, an
evidence trail with sources, and a downloadable PDF. One-liner: *screen anyone for sanctions,
PEP status, and adverse media in ~8s instead of 45 min.* Built for a hackathon.

## Architecture (the agreed design)

- **One Claude agent** (Vercel AI SDK) runs a tool-use loop with two main tools:
  1. `searchSanctions` → OpenSanctions `/match` endpoint (sanctions + PEP).
  2. `searchGoogle` → Google SERP → LLM adverse-media flagging.
  - `searchSocial` → optional social lookup (stretch).
- Agent results → `scoreReport()` → `RiskReport` → streamed to UI over SSE.
- **Scoring weights:** sanctions 0.60 (highest) · adverse media 0.30 · social 0.10.

## Stack & decisions

- **Next.js 15** (App Router) + React 19 + Tailwind, deployed on **Vercel**.
- **AI SDK:** upgraded to latest — `ai@^6` + `@ai-sdk/anthropic@^3` (v6 API: `tool({ inputSchema })`,
  `stopWhen: stepCountIs()`, tool results at `result.steps[].toolResults[].output`). Next stayed at 15.3.3,
  zod at 3.25 (deliberately not bumped to avoid destabilizing the scaffold). `vitest@^4` added for tests.
- **LLM:** Anthropic Claude (`claude-sonnet-4-6`, bump to `claude-opus-4-8` if synthesis needs it).
- **Search:** ✅ **Tavily** chosen (user decision 2026-06-07; resolves the prior Serper/Tavily discrepancy).
  `https://api.tavily.com/search`, `Authorization: Bearer`, `topic:news`, `max_results: 5`.
- **PDF:** `@react-pdf/renderer` (server-side, `renderToBuffer` in the route).
- Env vars (canonical, in `.env`): `OPENSANCTIONS_API_KEY`, `TAVILY_API_KEY`, `ANTHROPIC_API_KEY`,
  `OPENSANCTIONS_SCOPE`. (User initially named them `ANTHROPIC_KEY`/`TAVILY_KEY`; renamed to the `_API_KEY`
  forms the SDK + code expect.)
- **OpenSanctions gotcha:** the `/match` endpoint returns an EMPTY top-level `topics`; the real
  classification (`sanction`, `role.pep`, …) lives under `properties.topics`. `lib/sanctions/map.ts`
  reads `properties.topics` as the fallback — this is what makes PEP/sanction detection work.

## Plan files (sources of truth)

- [docs/DEV_PLAN.md](./docs/DEV_PLAN.md) — full 4-way parallel team plan; shared contracts/types, streaming protocol, folder ownership, DoD.
- [docs/part-1-opensanctions-engine.md](./docs/part-1-opensanctions-engine.md) — OpenSanctions engine + `searchSanctions` tool.
- [docs/part-2-ai-agent-adverse-media.md](./docs/part-2-ai-agent-adverse-media.md) — agent, `/api/screen`, Google adverse-media + social.
- [docs/part-3-scoring-and-report.md](./docs/part-3-scoring-and-report.md) — contracts, scoring engine, report, PDF.
- [docs/part-4-frontend.md](./docs/part-4-frontend.md) — input form, streaming progress, results dashboard.
- [BUILD_PLAN.md](./BUILD_PLAN.md) — sequential single-dev track (Step 0 scaffold → parts), commit + approval gate per part.
- [prd.md](./prd.md) — original product brief / pitch.

## Implementation status

- [x] Next.js app scaffolded (`app/`, config, `package.json`, pitch deck HTML).
- [x] Planning docs written (DEV_PLAN + part specs + BUILD_PLAN).
- [x] Shared contracts/types + data files (`lib/contracts`, `lib/data`) + `mocks.ts` + `.env.example`.
- [x] Part 1 — OpenSanctions `searchSanctions` + `sanctionsTool` (`lib/sanctions/`), unit + live tests.
- [x] Part 2 — single agent + `/api/screen` SSE route + Tavily adverse-media tool + social stretch.
- [x] Part 3 — scoring engine + per-category scores + PDF export + `/api/report/pdf`.
- [x] Part 4 — frontend: 5-field form, streaming progress, risk dashboard, PDF download, `?mock=1` toggle.
- [x] End-to-end real screening verified (HIGH for Yanukovych, CLEAR for random name); PDF renders.
- [ ] Deploy to Vercel with env vars set.

### Known caveats
- **Latency:** a live run is ~40–70s (agent orchestration LLM call + adverse-media `generateObject`),
  close to the route's `maxDuration = 60`. The `?mock=1` toggle is the demo safety net. Could be sped up
  by skipping the orchestration LLM and calling the tool functions directly (the deterministic fallback
  path in `lib/agent/agent.ts` already does this when the model doesn't call a tool).
- **Social** tool exists (`lib/social/tool.ts`) but is intentionally NOT wired into the default agent;
  the route ships `social: null` and weights renormalize.

## Progress log

- **2026-06-07** — Repo set up; DEV_PLAN + part specs + BUILD_PLAN authored; project memory + update rule added.
- **2026-06-07** — Implemented ALL parts in one pass (single-dev). Upgraded to AI SDK v6 / anthropic v3,
  added vitest. Built `lib/{contracts,scoring,report,sanctions,google,social,agent,client}`, the
  `/api/screen` (NDJSON streaming) and `/api/report/pdf` routes, and refactored `app/screen/page.tsx`
  + `components/` into the real form→stream→dashboard flow. Switched adverse-media search from Serper to
  **Tavily** (user decision) and capped it at 5 results. Fixed OpenSanctions PEP/sanction detection
  (`properties.topics` fallback). 33 unit tests green (+2 live skipped). `next build` clean. Verified live
  end-to-end against real Anthropic + Tavily + OpenSanctions keys.
- **2026-06-07** — Fixed adverse-media source links pointing to root domains. The LLM was emitting the
  `sources` URLs itself and collapsing them to domains. Switched the schema to **ref-based citations**
  (`sources: [{ ref, note }]`), updated `FULL_SYSTEM_PROMPT` to cite the numbered `[n]` search results,
  and resolve refs back to the exact Tavily deep links in `sanitizeAdverseMedia(obj, hits)`. Invalid
  refs are dropped, results deduped by URL. Added a unit test for the resolution.
- **2026-06-07** — Added an **agent tool-calling visualization** to the running view. Extended the NDJSON
  protocol with a `tool` event (`{ tool, status: call|result, args, summary, ok }`), emitted from each
  tool's `execute` AND the deterministic fallback in `lib/agent/agent.ts`. `useScreening` now tracks
  `toolCalls[]`; new `components/ToolCallStream.tsx` renders expandable agent-style cards (tool
  signature, source, pretty-printed args, ✓/spinner/⚠ status, one-line result summary). Wired into
  `app/screen/page.tsx` for both live and mock modes (mock synthesizes the calls/summaries from the
  fixture report). Verified live in-browser. 34 tests green, `tsc` clean.
