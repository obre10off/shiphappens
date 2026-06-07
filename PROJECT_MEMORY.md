# Project Memory — Clavis (Compliance Analyst Agent)

> **Living memory of this project.** Keep this file current — see the rule in
> [CLAUDE.md](./CLAUDE.md). Update it whenever a plan file changes or a build step ships.
> Last updated: 2026-06-07 (bilingual EN/BG pitch deck at `/en/presentation` & `/bg/presentation`, light-only, real demo video).

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
- **Scoring weights:** sanctions 0.66 (highest) · adverse media 0.33 · social 0.01.
- **Score display scale:** the engine computes on 0–100 internally (bands, weights, category
  math, tests), but the UI + PDF render on a **0–10 scale** (`overallTo10` 1-decimal overall,
  `categoryTo10` whole-number sub-scores in `lib/theme.ts`). Bands/colors still keyed off 0–100.

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

- **2026-06-07** — **Feature-flagged the agent tool-call visuals.** Added `lib/config.ts` as the
  single source of truth for feature flags, with `featureFlags.showAgentToolCalls` (default
  **false**). The `ToolCallStream` ("Agent tool calls") render on `/screen` is now gated behind that
  flag; the agent's tool-calling loop is unchanged — only the visual surface is hidden. Flip the flag
  in `lib/config.ts` to re-enable.
- **2026-06-07** — **Pitch deck added — now bilingual (EN/BG), light-only.** A self-contained,
  client-side full-screen slide deck (12 slides), on-theme (DM Sans, white canvas, single indigo
  accent, two-dot mark). **All slides are uniform light — no dark backgrounds** (per user request).
  Structure: shared `components/PresentationDeck.tsx` (layout + keyboard nav ←/→/Space/PageUp-Down/
  Home/End, click arrows, clickable progress dots, counter, progress bar, EN/BG language switcher)
  driven entirely by `lib/presentation/content.ts` (`en` + `bg` dictionaries, typed
  `PresentationContent`). Routes: **`/en/presentation`** (English) and **`/bg/presentation`**
  (Bulgarian); **`/presentation` 307-redirects to `/en/presentation`**. Hybrid investor/demo
  narrative: problem → human factor → false-positive chain reaction → enforcement stakes →
  solution (3-step) → **YouTube demo embed** → speed before/after → value (4 pillars) → market
  (TAM/SAM) → vision (ongoing monitoring + deeper research) → close. Stats researched + footnoted
  (LexisNexis $206B FCC cost, 31–60% manual KYC, $2k+/review, 90–95% false positives, ~$4B 2025
  AML fines incl. crypto $1B+, RegTech ~$22B→~$85B @ ~21% CAGR). **Demo video id is
  `DEMO_VIDEO_ID = 'rZh0m8bg67k'` in `lib/presentation/content.ts`.** `next build` clean; both
  locales + redirect verified in-browser.
- **2026-06-07** — **Relevant-citations + meaningful-tags pass** (follow-up):
  (1) **Summary no longer truncates** — `generateObject` now sets `maxOutputTokens: 8000`; the prompt
  insists every sentence/`**` is closed; the `Markdown` renderer strips stray unclosed `**`.
  (2) **Citations are now relevant, not dumped** — the adverse-media prompt asks the model to place
  `[n]` *inline in the summary* next to the specific claim (≤2–3 per claim). `sanitizeAdverseMedia`
  (`lib/agent/schema.ts`) resolves those + the `sources[]` refs into one ordered source list and
  **renumbers the inline `[n]` to the final source position** (new unit test covers this). The
  `Markdown` component renders `[n]` as superscript links via a `citationUrl(n)` resolver built from
  `report.sources`; the Sources section and PDF are numbered to match. Removed the old per-category
  URL dump (`buildAdverseMediaScores`/`buildHighRiskActivityScores` no longer attach the full source
  list to every row) and the `citations` prop on `CategoryScoreList`. Dropped the dashboard source
  re-sort so `[n]` stays ascending/stable.
  (3) **Meaningful PEP + sanctions tags** (`lib/data/datasets.ts` gained a `kind` of
  sanctions/pep/enrichment + `isSanctionsDataset`/`isEnrichmentDataset`): the **sanctions row** shows
  only real enforcement lists (filters out wikidata/everypolitician/wd_categories), and the **PEP row**
  now shows the subject's actual public **positions** (`properties.position`, e.g. "President of
  Ukraine") instead of opaque dataset codes. Note: "On a sanctions list = 0" is correct for a
  PEP-but-not-sanctioned subject (sanctioned ≠ PEP). Mocks/tests updated; 35 tests green, `tsc` clean.
- **2026-06-07** — **KYC framing + citations pass** (follow-up to the UX overhaul):
  (1) **Hid the "Weighted score" breakdown** — `ScoreGauge` is now just the 0–10 ring (dropped the
  `weights` prop + `WeightRow`). (2) **Recommendations reframed from onboarding → KYC investor due
  diligence** in `recommendationFor` (`lib/scoring/score.ts`): high = "Decline the prospective
  relationship… do not accept funds/proceed with the investment…"; review = "conduct EDD… establish
  source of wealth/funds"; clear = "Cleared to proceed". `BAND_META.verdict` labels + mock
  recommendations updated to match. (3) **Inline adverse-media citations** — the Sources section is
  numbered (sorted by `sourceRank`), and `CategoryScoreList` renders URL evidence as compact
  superscript `[n]` links (via a `citations: Map<url, number>` prop built in `RiskDashboard`) that
  point at the matching numbered source. Non-URL evidence still shows as readable dataset tags.
  Tests/lint green, verified in-browser.
- **2026-06-07** — **Report dashboard UX overhaul** (`components/RiskDashboard.tsx` + helpers):
  (1) Summary now renders **light markdown** — a tiny in-house `components/Markdown.tsx`
  (headings/bullets/bold/paragraphs); the adverse-media prompt (`lib/data/adverseMedia.ts`) was
  flipped from "no markdown" to "use short **bold** headings + `-` bullets, quick-scannable"; the
  PDF strips markdown via `lib/util/markdown.ts` `stripMarkdown`. (2) **Recommended action moved to
  the top** with a per-band one-line verdict (`BAND_META.verdict`). (3) **Human-readable sanctions
  tags** — new `lib/data/datasets.ts` maps OpenSanctions dataset codes (`us_sam_exclusions`,
  `wd_peps`, …) → `{label, description}` with a prettify fallback; rendered as chips with a `title`
  tooltip in `CategoryScoreList`. (4) **No more repeated links per section** — category rows show
  only non-URL tags; all links live in a single **Sources** section, ordered by relevance
  (`sourceRank`: sanctions/OpenSanctions → noted media → rest) with a **Show more** beyond 3.
  (5) **Timeline** collapses beyond 4 items with Show more/less. (6) **0–10 score scale**: gauge +
  category bars + PDF now show 0–10 (`overallTo10`/`categoryTo10` in `lib/theme.ts`); **social
  weight set to 1%** (`WEIGHTS` → sanctions 0.66 / adverseMedia 0.33 / social 0.01). Updated the
  weighted-blend unit test + mock fixtures (markdown summary, new weights). 34 tests green,
  `next build` clean, verified in-browser with `?mock=1`.
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
- **2026-06-07** — Added **per-step timeout guards** (`lib/util/timeout.ts` `withTimeout`). In
  `lib/agent/agent.ts` each step now has a ceiling so a hung step degrades instead of stalling the
  run: sanctions step 25s, adverse-media step 45s (LLM call has no native cap), and the whole
  orchestration loop 90s (on timeout it stops awaiting and the deterministic fallback fills missing
  signals). Timed-out steps return a degraded result with `error` set, so the UI shows
  `failed — … timed out after Ns`. Also **fixed the white/invisible text** in
  `components/ToolCallStream.tsx`: it was built with a dark palette (`text-white`, slate grays,
  hardcoded `#00c9a7`) on the warm light canvas — remapped to theme tokens (`text-ink`/`text-muted`/
  `text-faint`/`accent`/`surface`). 34 tests green, `tsc` clean.
