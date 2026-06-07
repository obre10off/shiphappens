# Project Memory — Clavis (Compliance Analyst Agent)

> **Living memory of this project.** Keep this file current — see the rule in
> [CLAUDE.md](./CLAUDE.md). Update it whenever a plan file changes or a build step ships.
> Last updated: 2026-06-07 (added `?mock=2` Ivan Ivanov ambiguous-identity high-band fixture).

## What we're building

An **AI compliance analyst** — a KYC/AML screening tool. Given a person/company, it screens
against **OpenSanctions** (sanctions + PEP), scans **adverse media** via Google search + LLM,
optionally checks **social media**, then synthesizes an **audit-ready risk report** with an
overall band (`clear` / `review` / `high`), a 0–100 weighted score, per-category scores, an
evidence trail with sources, and a downloadable PDF. One-liner: *screen anyone for sanctions,
PEP status, and adverse media in ~8s instead of 45 min.* Built for a hackathon.

## Architecture (the agreed design)

- **One Claude agent** (Vercel AI SDK) runs a tool-use loop with three main tools, in order:
  1. `searchSanctions` → OpenSanctions `/match` endpoint (sanctions + PEP).
  2. `searchEuSanctions` → **EU Sanctions Tracker** local snapshot (corroborating secondary source;
     runs right after the primary check, can escalate the band on a high-confidence match).
  3. `searchGoogle` → Google SERP → LLM adverse-media flagging.
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
- [x] **EU Sanctions Tracker source check** (`searchEuSanctions`) wired in after the primary sanctions
  check — local snapshot match, corroborating + can escalate, surfaced as its own phase/tool/section.
- [ ] Deploy to Vercel with env vars set.

### Known caveats
- **Latency (now intentionally high):** adverse media runs **deep research** — AI query planning +
  ~14 advanced Tavily queries + AI source curation + flagging — and can take **several minutes**.
  Budgets raised accordingly: route `maxDuration = 300`, `ADVERSE_STEP_MS = 260s`, `AGENT_LOOP_MS = 290s`
  (300s is the Vercel ceiling on most plans; locally there's no cap). The `?mock=1` toggle remains the
  demo safety net for quick walkthroughs.
- **Social** tool exists (`lib/social/tool.ts`) but is intentionally NOT wired into the default agent;
  the route ships `social: null` and weights renormalize.

## Progress log

- **2026-06-07** — **`/screen` form polished for live demo.** The input form now "pops out":
  wrapped in a raised white card (`bg-surface` + `border` + new `shadow-raised` token added to
  `tailwind.config.ts`) with an indigo accent hairline along the top, a shield icon badge in the
  header, an ambient accent glow behind the card, and a demo-prefill toolbar grouped in a tinted
  panel. Inputs upgraded in `app/globals.css`: larger padding/font, `surface-alt` fill that turns
  white on focus, a 4px accent focus glow, hover border, and leading-icon support
  (`.field-wrap`/`.field-lead`/`.field-has-lead`) — name/company/date/case-context now carry
  lucide icons. **The native country `<select>` was replaced by a new
  `components/CountryAutocomplete.tsx`** — a filtering combobox with flag emojis (reuses
  `toIso2` from `lib/sanctions/countries.ts` → regional-indicator pairs), startsWith→contains
  ranking, full keyboard nav (↑/↓/Enter/Esc/Tab + `aria-activedescendant`), click-outside close,
  and a clear (×) button; `onChange` emits the display-name string so `ScreeningInput.country`
  and the downstream engine are unchanged. Also fixed a pre-existing controlled→uncontrolled React
  warning by merging demo prefills over `empty` (`{ ...empty, ...DEMO_* }`). `next build` + `tsc`
  clean; verified in-browser (desktop + 390px mobile, filter/select/prefill flows, clean console).
- **2026-06-07** — **Feature-flagged the agent tool-call visuals.** Added `lib/config.ts` as the
- **2026-06-07** — **`?mock=2` ambiguous-identity high-band fixture (Ivan Ivanov).** Added
  `mockRiskReportAmbiguous` (+ `mockInputAmbiguous`/`mockSanctionsAmbiguous`/`mockAdverseMediaAmbiguous`)
  to `lib/contracts/mocks.ts` — a real run for an extremely common Bulgarian name: 5 distinct PEP
  matches (OpenSanctions, `isPep: true`, not sanctioned), empty EU, and per-individual adverse media
  with an explicit **Low confidence** disambiguation note + 9-entry timeline + 15 sources (10 media + 5
  OpenSanctions entities). Demonstrates the new ambiguous-identity prompt guidance end-to-end. The
  `mock` query param is now a value, not a flag: `app/screen/page.tsx` treats `mock=1`|`mock=2` as mock
  mode, `mock=2` always serves the Ivan Ivanov fixture, `mock=1` keeps name-based selection
  (clear/review/high). Reused `NEVZOROV_HIGH_RISK_KEYS` + `mockEuSanctionsClear`; `Source` added to the
  type import. `tsc` clean, 45 tests green.

- **2026-06-07** — **Ambiguous-identity / low-confidence guidance in the adverse-media prompt.**
  Extended guideline 8 of `FULL_SYSTEM_PROMPT` (`lib/data/adverseMedia.ts`): when the subject's name
  is common/ambiguous and few distinguishing identifiers were supplied (e.g. name only, no DOB), the
  model must lead the `summary` with a **Low confidence** note that the identity couldn't be
  disambiguated, explicitly recommend re-running with more identifiers (DOB first, then country/
  company/other), and stay conservative about attributing adverse media to the subject. No schema
  change — the signal is surfaced in the summary text. The subject block in `buildContext`
  (`lib/google/tool.ts`) already omits DOB when absent, so the model can detect the bare-name case.

- **2026-06-07** — **"Review"-band mock fixture + per-step mock timeouts.** Added
  `mockRiskReportReview` (the real Oleg Nevzorov run — `band: review`, score 33, empty
  sanctions/EU, rich adverse media: 14 sources, 10-entry timeline, one high-risk activity flag) to
  `lib/contracts/mocks.ts` alongside `mockInputReview`/`mockSanctionsReview`/`mockEuSanctionsReview`/
  `mockAdverseMediaReview`. `?mock=1` now picks it when the name matches `/nevzorov/i` (clear →
  kovacheva/asdf/qwerty, else high). Replaced the uniform 1.4s-per-phase cadence in `runMock`
  (`app/screen/page.tsx`) with a `PHASE_DURATIONS_MS` map (sanctions 1.6s · eu_sanctions 1.2s ·
  adverse_media 4.5s · synthesis 1.8s, `PHASE_GAP_MS` 200ms) walked via a cumulative `cursor`, so each
  step has its own timeout and adverse media visibly dominates — mirroring the real run's
  `durationMs`. `tsc` clean, no lint errors. Added `lib/config.ts` as the
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
- **2026-06-07** — **Deepened Tavily research (was only returning ~3 hits).** Root causes:
  (a) queries used Google boolean syntax `"name" (fraud OR corruption OR …)` — Tavily is a *semantic*
  API and returns far fewer/weaker results for boolean strings; (b) every query was hard-filtered by
  `country`, regionally collapsing inherently-international adverse media; (c) 14 concurrent queries with
  silent `.catch(() => [])` lost throttled (429) queries invisibly. Fixes (`lib/google/tavily.ts`,
  `tool.ts`, `research.ts`): rewrote `buildQueries`/`buildDeepQueries` + the LLM `QUERY_PLANNER_PROMPT`
  to plain-keyword (non-boolean) queries (name still quoted); **dropped the `country` API filter** (country
  stays in the query text + source curation); added **429/5xx retry with backoff** and **bounded
  concurrency (5)** via a `mapPool` helper; raised results-per-query 8→10 and the query cap 14→16; added
  per-query + failure logging (`[tavily] … N unique hit(s)`, `[tavily] X/N queries failed`). Note: the
  number shown on the adverse-media phase is the *cited* `sources.length` (post-LLM-flagging), which is a
  subset of raw hits — the raw breadth is now visible in the `[tavily]` server logs. 45 tests green, `tsc` clean.

- **2026-06-07** — **Copy JSON button + runtime clarification.** Added a "Copy JSON" action to
  `RiskDashboard` (copies the full `RiskReport` to clipboard, with an `execCommand` fallback for
  insecure origins) so a real run can be captured as a deterministic demo fixture (paste into
  `mocks.ts` / use with `?mock=1`). **Did NOT switch `/api/screen` to the edge runtime**: Edge has a
  hard, non-configurable **25s** timeout that would break the multi-minute deep adverse-media research,
  and the ~1 MB EU snapshot import risks the Edge bundle-size limit. Current Vercel docs: Node.js
  functions on **Fluid Compute default to 300s on all plans incl. Hobby**, so `runtime='nodejs'` +
  `maxDuration=300` already works without Pro. Kept the route on nodejs.

- **2026-06-07** — **EU Sanctions Tracker added as a second source check** (after the primary
  OpenSanctions check). Decisions (user-confirmed): **bundled local snapshot**, **corroborating +
  can escalate**, **individuals only**. (1) **Data** — scraped the EU Sanctions Tracker
  (`data.europa.eu/apps/eusanctionstracker`), which ships no API and loads a custom `subjects.jsonpack`
  unpacked client-side into `window.application.datasets.subjects`; extracted the 4,343 individuals to a
  compact snapshot `lib/data/euSanctionsIndividuals.json` (id, name, aliases, dob, nationalities, regime,
  OJ ref, sanction types, subject-page URL). (2) **Matcher** — `lib/eu/match.ts` `searchEuSanctions`:
  diacritic/stroke-aware name normalization (`normalizeName`) + token-set F1 (`scoreNames`), DOB/
  nationality corroboration boosts; thresholds DISPLAY 0.72 / LISTED 0.90; pure + synchronous, never
  throws. (3) **Agent** — new `searchEuSanctions` tool runs between sanctions and google, with the same
  phase/tool events + deterministic fallback (`lib/agent/agent.ts`, prompt order updated, `stepCountIs(8)`).
  (4) **Scoring** — `scoreReport` takes `euSanctions`; a high-confidence EU hit forces the sanctions
  component to 100 and the band to `high` even if OpenSanctions was clear; EU subject pages added to
  Sources; summary notes the EU match; `buildAdverseMediaScores` ORs EU into the "On a sanctions list"
  signal. (5) **UI** — new `eu_sanctions` phase (ProgressStream), `searchEuSanctions` tool card
  (ToolCallStream), and an **EU Sanctions Tracker** section in `RiskDashboard` (per-match regime/ref/
  type/confidence + link). Contracts extended (`EuSanctionsResult`/`EuSanctionsMatch`, `ScreenEvent`
  phase + tool + partial, `RiskReport.euSanctions`); mocks + page mock-mode updated. New `lib/eu/match.test.ts`
  + EU escalation tests in `score.test.ts`; **45 tests green, `tsc` clean**. Caveat: snapshot is a
  point-in-time copy (EU `updated` 2026-06-07) — refresh periodically by re-extracting the jsonpack.

- **2026-06-07** — **Deep adverse-media research + AI source curation + newest-first timeline**:
  (1) **Deep research** — `analyzeAdverseMedia` (`lib/google/tool.ts`) now runs a multi-stage pipeline:
  `planQueries` (LLM proposes 6–10 targeted queries, `lib/google/research.ts`) ∪ `buildDeepQueries`
  (deterministic sanctions/criminal/regulatory/financial-crime/leaks/litigation angles, `tavily.ts`),
  capped at 14 queries, all run through Tavily `searchQueries` (advanced depth, `max_results: 8`,
  `timeoutMs: 20s`). (2) **AI source curation** — new `selectRelevantSources` LLM step vets the large
  hit pool down to ≤15 sources that plausibly refer to the subject AND are risk-relevant, ordered
  most-material first; that order becomes the citation numbering passed to the flagging `generateObject`
  + `sanitizeAdverseMedia`. Every stage degrades gracefully (static-query / top-score fallbacks; skips
  AI steps when no `ANTHROPIC_API_KEY`). (3) **Timeouts raised** for the longer run (see Known caveats).
  (4) **Timeline reversed** — `RiskDashboard` sorts events newest-first via a loose `timeKey` parser
  (unknown dates sink to the bottom, behind "Show more"); mock timeline expanded to 6 entries to show it.
  New `buildDeepQueries` tests added; 23+ tests green, `tsc` clean. (PDF timeline left chronological as
  the audit document.)

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
