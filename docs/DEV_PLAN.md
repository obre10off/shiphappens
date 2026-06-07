# ShipHappens — KYC Auditing Tool · Dev & Implementation Plan

> An AI compliance analyst that screens a person/company against the **OpenSanctions**
> database, scans for **adverse media** via Google + LLM, and (time permitting) checks
> **social media** — producing an audit-ready risk report with a per-category score.

This document is the **shared contract** for a 4-person team working in parallel. Read
this file first, agree the contracts at kickoff (~30 min), then each person owns one
self-contained part and can build/test independently against mocks.

---

## 1. Product summary

**Inputs** (single form):

| Field | Required | Notes |
|-------|----------|-------|
| `name` | ✅ | Full legal name |
| `dateOfBirth` | optional | ISO `YYYY-MM-DD`; disambiguates common names |
| `country` | ✅ | Country of residence/nationality |
| `company` | optional | Screened as a linked entity if present |
| `freeText` | optional | Case-specific context (claims, known associates, etc.) |

**Output:** a `RiskReport` with:
- An overall **risk band** (`clear` / `review` / `high`) and weighted **0–100 score**.
- A **score per high-risk activity** (the 28 categories in `lib/data/highRiskActivities.ts`).
- A **score per adverse-media signal** (bad press, recent bad press, PEP, sanctions hit).
- Evidence trail with sources, a plain-language summary, a timeline, and a downloadable PDF.

**Priority / weighting** (this drives the scoring engine):

| Signal | Priority | Default weight |
|--------|----------|----------------|
| OpenSanctions match (sanctions + PEP) | **Highest** | **0.60** |
| Adverse media (Google + LLM) | Medium | **0.30** |
| Social media | Lowest (stretch) | **0.10** |

---

## 2. Tech stack

- **Next.js 15** (App Router, already scaffolded) + React 19 + TailwindCSS.
- **Vercel AI SDK** (`ai` + `@ai-sdk/anthropic`) — a **single agent** with tools:
  1. `searchSanctions` → OpenSanctions `/match` endpoint (Part 1).
  2. `searchGoogle` → Google search for adverse media, then LLM flagging (Part 2).
  3. `searchSocial` → optional social lookup (Part 2, stretch).
- **LLM:** Anthropic `claude-sonnet-4-6` (fast, cheap enough for the demo; bump to
  `claude-opus-4-8` if synthesis quality needs it).
- **Google search:** [Serper.dev](https://serper.dev) (`/search` Google SERP API, free tier).
  Alternative: Tavily, or a provider-native web-search tool from the AI SDK.
- **PDF:** `@react-pdf/renderer` (server-side) or `jspdf` (client-side).
- **Deploy:** Vercel.

### Required env vars (`.env.local`, mirrored in `.env.example`)

```bash
OPENSANCTIONS_API_KEY=        # Part 1 — provided
SERPER_API_KEY=               # Part 2 — google search
ANTHROPIC_API_KEY=            # Part 2 — the agent LLM
OPENSANCTIONS_SCOPE=default   # Part 1 — match scope/dataset (default | sanctions | bg_omnio_poi)
```

---

## 3. Architecture & data flow

```
                          ┌─────────────────────────────────────────────┐
  Browser (Part 4)        │  POST /api/screen   (Part 2 owns the route)  │
  form → fetch/stream ───►│                                              │
                          │   Vercel AI SDK agent (single agent)         │
                          │   ├─ tool: searchSanctions  ──► Part 1       │
                          │   │     OpenSanctions /match endpoint        │
                          │   ├─ tool: searchGoogle     ──► Part 2       │
                          │   │     Serper → LLM adverse-media flagging  │
                          │   └─ tool: searchSocial (stretch) ► Part 2   │
                          │                                              │
                          │   results ──► scoreReport()  ──► Part 3      │
                          │                 RiskReport                   │
   ◄── SSE stream of ─────┤   stream phase events + final RiskReport     │
       phase events       └─────────────────────────────────────────────┘
       + RiskReport
                          PDF export: /api/report/pdf (Part 3 + Part 4)
```

**Why this split parallelizes cleanly:** every boundary is a typed function or an HTTP
contract. Part 1 is a pure async function `searchSanctions(input) → SanctionsResult`.
Part 2 owns the agent + route but imports Part 1 and Part 3 *by interface*. Part 3 is
pure functions over the result objects. Part 4 codes against the streaming protocol and a
checked-in mock report. Nobody is blocked: mock the other three from day one.

---

## 4. Shared contracts (agree these at kickoff — DO NOT diverge)

Part 3 owns and lands `lib/contracts/types.ts` in the **first hour** so everyone can import
it. Until then, paste this block locally. These types are frozen for the hackathon; changes
require a Slack ping to all four.

```ts
// lib/contracts/types.ts

export interface ScreeningInput {
  name: string;
  dateOfBirth?: string;   // ISO YYYY-MM-DD
  country: string;        // ISO-2 or display name
  company?: string;
  freeText?: string;
  caseId?: string;
}

// ── Part 1: OpenSanctions ──────────────────────────────────────────────
export interface SanctionsMatch {
  id: string;                         // OpenSanctions entity id
  caption: string;                    // display name
  schema: string;                     // Person | Organization | ...
  score: number;                      // 0..1 from /match
  match: boolean;                     // above match threshold
  datasets: string[];                 // lists the entity is on
  topics: string[];                   // e.g. sanction, role.pep, crime
  properties: Record<string, string[]>;
  sourceUrl: string;                  // https://www.opensanctions.org/entities/<id>/
}

export interface SanctionsResult {
  matches: SanctionsMatch[];
  totalMatches: number;
  bestScore: number;                  // 0..1
  isPep: boolean;
  isSanctioned: boolean;
  datasetsHit: string[];
  scope: string;                      // dataset queried
  error?: string;                     // set if the call failed (degrade gracefully)
}

// ── Part 2: Adverse media (LLM) + social ───────────────────────────────
export interface Source { url: string; note?: string; }
export interface TimelineItem { date: string; event: string; }  // date: ISO | year | ""

export interface AdverseMediaResult {
  name: string;
  badPress: boolean;
  badPressLast5Years: boolean;        // true only if after 2021-01-01
  highRiskActivitiesFlag: boolean;
  highRiskActivities: string[];       // subset of HIGH_RISK_ACTIVITIES (exact strings)
  summary: string;                    // plain text, no markdown
  sources: Source[];
  timeline: TimelineItem[];
  error?: string;
}

export interface SocialMediaResult {  // stretch — may be null
  profiles: { platform: string; url: string; note?: string }[];
  flags: string[];
  summary: string;
  error?: string;
}

// ── Part 3: scoring + report ───────────────────────────────────────────
export type RiskBand = 'clear' | 'review' | 'high';

export interface CategoryScore {
  key: string;            // stable id
  label: string;          // human label
  score: number;          // 0..100
  present: boolean;
  evidence: string[];     // urls / short notes
}

export interface RiskReport {
  input: ScreeningInput;
  band: RiskBand;
  overallScore: number;                 // 0..100 weighted
  weights: { sanctions: number; adverseMedia: number; social: number };
  sanctions: SanctionsResult | null;
  adverseMedia: AdverseMediaResult | null;
  social: SocialMediaResult | null;
  highRiskActivityScores: CategoryScore[];   // one per HIGH_RISK_ACTIVITIES
  adverseMediaScores: CategoryScore[];        // bad press / recent / PEP / sanctioned
  summary: string;
  recommendation: string;
  sources: Source[];
  generatedAt: string;                  // ISO
  durationMs: number;
}
```

### Streaming protocol (Part 2 → Part 4 over SSE)

`POST /api/screen` streams newline-delimited JSON events. Each event:

```ts
type ScreenEvent =
  | { type: 'phase'; phase: 'sanctions' | 'adverse_media' | 'social' | 'synthesis';
      status: 'start' | 'done'; detail?: string; matches?: number }
  | { type: 'partial'; sanctions?: SanctionsResult; adverseMedia?: AdverseMediaResult }
  | { type: 'report'; report: RiskReport }     // terminal success
  | { type: 'error'; message: string };        // terminal failure
```

Part 4 renders the existing 4-step progress UI off `phase` events and the final report
off the `report` event. Part 2 emits `phase` start/done around each tool call.

---

## 5. Work split (4 people, 4 self-contained parts)

| Part | Owner | Scope | Spec |
|------|-------|-------|------|
| **1** | _A_ | OpenSanctions `/match` engine + `searchSanctions` tool | [part-1-opensanctions-engine.md](./part-1-opensanctions-engine.md) |
| **2** | _B_ | Vercel AI SDK agent, `/api/screen` route, Google adverse-media + social tools | [part-2-ai-agent-adverse-media.md](./part-2-ai-agent-adverse-media.md) |
| **3** | _C_ | Shared contracts, scoring engine, report model, PDF export | [part-3-scoring-and-report.md](./part-3-scoring-and-report.md) |
| **4** | _D_ | Frontend: input form, streaming progress, results dashboard with per-category scores | [part-4-frontend.md](./part-4-frontend.md) |

### Dependency direction (who imports whom)

```
Part 4 (UI) ──HTTP──► Part 2 (route/agent) ──fn──► Part 1 (sanctions)
                                          └──fn──► Part 3 (scoring/report)
All parts ──import──► Part 3 (contracts/types + data files)
```

Part 3's `lib/contracts/types.ts`, `lib/data/highRiskActivities.ts`, and
`lib/data/adverseMedia.ts` (moved from `~/Downloads`) are the only hard cross-deps, and
they ship in hour 1.

---

## 6. Integration plan (avoid a big-bang merge)

1. **Hour 0 — Kickoff (all):** agree contracts, Part 3 pushes `lib/contracts/types.ts` +
   data files + a checked-in `lib/contracts/mocks.ts` (mock `SanctionsResult`,
   `AdverseMediaResult`, `RiskReport`). Set up `.env.example`. Each person branches.
2. **Hours 1–4 — Parallel build:** everyone works against mocks. Part 1 & 2 verify against
   live APIs. Part 4 builds the whole UI off `mocks.ts`. Part 3 unit-tests scoring.
3. **Hour 4 — First integration:** Part 1 ↔ Part 2 (real `searchSanctions` in the agent);
   Part 2 ↔ Part 3 (real `scoreReport`); Part 4 ↔ Part 2 (swap mock for real `/api/screen`).
4. **Hours 5–6 — End-to-end + polish:** real demo names, edge cases, PDF, deploy to Vercel.

**Branching:** one feature branch per part (`part1-sanctions`, `part2-agent`,
`part3-scoring`, `part4-frontend`), PR into `main`. Keep PRs scoped to your `lib/`/route/
component folders to avoid conflicts (see folder ownership below).

### Folder ownership (no two people edit the same file)

```
lib/contracts/        → Part 3   (types, mocks)
lib/data/             → Part 3   (highRiskActivities, adverseMedia, weights)
lib/sanctions/        → Part 1
lib/agent/            → Part 2
lib/google/           → Part 2
lib/social/           → Part 2   (stretch)
lib/scoring/          → Part 3
lib/report/           → Part 3   (PDF)
app/api/screen/       → Part 2
app/api/report/       → Part 3
app/screen/           → Part 4   (refactor existing wizard)
app/page.tsx          → Part 4
components/            → Part 4
```

---

## 7. Definition of done (whole project)

- [ ] Submitting the form runs a **real** screening end to end (no mocked results).
- [ ] OpenSanctions match drives the dominant weight; PEP + sanction topics detected.
- [ ] Adverse media flagged by the LLM with real Google sources and a timeline.
- [ ] Report shows an overall band + score **and** a score per high-risk activity and per
      adverse-media signal.
- [ ] Graceful degradation: if Google or social fails, sanctions-only report still renders.
- [ ] PDF export works.
- [ ] Deployed to Vercel with env vars set.
- [ ] Each part has passing tests per its spec.

---

## 8. Testing strategy (shared)

- **Unit:** `vitest` (add to repo). Pure functions (scoring, parsers, mappers) get full
  coverage. Each part ships its own `*.test.ts` next to the code.
- **Contract tests:** every part validates it produces/consumes the shared types
  (the `mocks.ts` fixtures double as golden values).
- **Integration:** Part 1 & 2 have a `pnpm test:live` script that hits real APIs (skipped
  in CI without keys). Part 4 uses Playwright (already available) for the form→report flow.
- **Manual demo matrix:** at least one HIGH-RISK name (e.g. a sanctioned public figure),
  one PEP-only, one adverse-media-only, and one CLEAR name. Document expected bands in
  each spec.

Add to `package.json`:
```json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest",
  "test:live": "vitest run --dir lib --mode live"
}
```
