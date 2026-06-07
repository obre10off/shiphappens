# Part 3 — Contracts, Scoring Engine & Report

> **Owner:** _C_  ·  **Priority:** The glue. You ship the shared contracts in hour 1, then
> own the risk-scoring math and the report (incl. per-category scores + PDF).
> **Goal:** Turn raw `SanctionsResult` + `AdverseMediaResult` (+ optional social) into a
> `RiskReport` with an overall weighted band/score and a score **per high-risk activity**
> and **per adverse-media signal**.

You unblock the whole team in hour 1 by landing the contracts + data + mocks.

---

## 1. Scope

```
lib/contracts/
  types.ts         # ALL shared types (DEV_PLAN §4) — LAND FIRST
  mocks.ts         # mock SanctionsResult / AdverseMediaResult / RiskReport for everyone
lib/data/
  highRiskActivities.ts   # moved from ~/Downloads/highRiskActivities.ts
  adverseMedia.ts          # moved from ~/Downloads/adverseMedia.ts (FULL_SYSTEM_PROMPT)
  weights.ts               # weighting + threshold config
lib/scoring/
  score.ts         # scoreReport() — the core
  categories.ts    # per-category score builders
  score.test.ts
lib/report/
  pdf.tsx          # @react-pdf/renderer report document
app/api/report/pdf/
  route.ts         # POST RiskReport → PDF download
```

---

## 2. Hour-1 deliverables (unblock everyone)

1. `lib/contracts/types.ts` — paste the full block from `DEV_PLAN.md §4`. Push immediately.
2. Move the two files from `~/Downloads` into `lib/data/` (keep exact contents):
   - `highRiskActivities.ts` → `export const HIGH_RISK_ACTIVITIES: string[]`
   - `adverseMedia.ts` → `export const FULL_SYSTEM_PROMPT` (imports `./highRiskActivities`)
3. `lib/contracts/mocks.ts` — realistic fixtures so Parts 1/2/4 can build against them:
   - `mockSanctionsResult` (a sanctioned + PEP hit), `mockSanctionsClear`
   - `mockAdverseMediaResult` (badPress + a couple high-risk activities), `mockAdverseClear`
   - `mockRiskReport` (a full HIGH report) — Part 4 builds the entire UI off this.
4. `.env.example` with the four keys (see `DEV_PLAN.md §2`).
5. Add `vitest` to `package.json` and the test scripts.

---

## 3. Weighting & thresholds (`lib/data/weights.ts`)

```ts
export const WEIGHTS = { sanctions: 0.60, adverseMedia: 0.30, social: 0.10 };

// Component sub-scores → 0..100, then weighted sum → overall.
export const SANCTIONS_POINTS = {
  sanctioned: 100,     // any matched sanction topic
  pep: 70,             // PEP but not sanctioned
  // otherwise graded by bestScore (see score.ts)
};

export const ADVERSE_POINTS = {
  badPressLast5Years: 100,
  badPressOlder: 60,
  highRiskActivity: 40,   // per-presence contribution, capped
};

export const BANDS = {       // overall 0..100 → band
  high: 60,                  // >= 60 → high
  review: 25,                // >= 25 → review, else clear
};
```

Weights/thresholds live in one file so they're easy to tune live during the demo.

---

## 4. `scoreReport()` (`lib/scoring/score.ts`)

```ts
export function scoreReport(args: {
  input: ScreeningInput;
  sanctions: SanctionsResult | null;
  adverseMedia: AdverseMediaResult | null;
  social: SocialMediaResult | null;
  durationMs: number;
}): RiskReport;
```

### Component scores (each 0..100)

**Sanctions (weight 0.60):**
- `isSanctioned` → 100.
- else `isPep` → 70.
- else if `bestScore > 0` → `Math.round(bestScore * 60)` (a strong name match w/o topics).
- else 0. If `sanctions.error` set → 0 but note degraded in summary.

**Adverse media (weight 0.30):**
- start 0; if `badPressLast5Years` → 100; else if `badPress` → 60.
- add `min(highRiskActivities.length * 15, 40)` for high-risk involvement; clamp 0..100.

**Social (weight 0.10):**
- `flags.length > 0` → `min(flags.length * 30, 100)`; else 0; null → 0 (and renormalize, below).

### Overall
```
overall = round( sanctionsScore*0.60 + adverseScore*0.30 + socialScore*0.10 )
```
If `social` is null, **renormalize** the remaining weights to sum to 1
(`sanctions 0.667 / adverseMedia 0.333`) so a missing stretch signal doesn't deflate the score.

### Band
`overall >= 60 → high`, `>= 25 → review`, else `clear`. **Override:** if
`isSanctioned` → force `high` regardless of overall (a sanctions hit is always high risk).

---

## 5. Per-category scores (`lib/scoring/categories.ts`)

This is the explicit ask: a score for **each** high-risk activity and **each** adverse signal.

### `highRiskActivityScores: CategoryScore[]`
One entry per string in `HIGH_RISK_ACTIVITIES` (28 categories):
```ts
{
  key: slug(activity),            // e.g. "gambling"
  label: activity,                // exact string
  present: adverseMedia?.highRiskActivities.includes(activity) ?? false,
  score: present ? 80 : 0,        // simple presence score; refine if confidence available
  evidence: present ? relevantSourceUrls : [],
}
```
> If the LLM later returns per-activity confidence, map it to `score`. For the hackathon,
> presence → 80, absence → 0 is enough and demos clearly.

### `adverseMediaScores: CategoryScore[]`
A fixed set of signals, each scored 0..100:
| key | label | present when | score |
|-----|-------|--------------|-------|
| `sanctioned` | On a sanctions list | `sanctions.isSanctioned` | 100 |
| `pep` | Politically Exposed Person | `sanctions.isPep` | 70 |
| `bad_press` | Adverse media (any time) | `adverseMedia.badPress` | 60 |
| `bad_press_recent` | Adverse media (last 5y) | `adverseMedia.badPressLast5Years` | 100 |
| `high_risk_activity` | High-risk activity involvement | `highRiskActivitiesFlag` | 50 |

`evidence` pulls matching `sources[]` URLs and `datasetsHit` names.

### Summary & recommendation
- `summary`: prefer `adverseMedia.summary`; prepend a sanctions sentence
  (e.g. "Listed on OFAC, EU sanctions; confirmed PEP."). Plain text.
- `recommendation` by band: `high` → reject/escalate + file SAR; `review` → manual review
  with named reasons; `clear` → proceed with standard due diligence + periodic rescreen.
- `sources`: union of `adverseMedia.sources` + sanctions `sourceUrl`s + social.

---

## 6. PDF export (`lib/report/pdf.tsx` + `app/api/report/pdf/route.ts`)
- `@react-pdf/renderer` `Document` rendering the `RiskReport`: header (subject + band +
  score), per-category score tables (high-risk activities + adverse signals), summary,
  recommendation, timeline, sources.
- Route: `POST /api/report/pdf` with a `RiskReport` body → `application/pdf` stream with
  `Content-Disposition: attachment`.
- Keep it simple and legible (it's the "real deliverable" in the demo).

---

## 7. Tests (`score.test.ts`) — pure functions, full coverage
- [ ] Sanctioned input → `band: 'high'`, `overallScore >= 60`, `sanctioned` category = 100.
- [ ] PEP-only → sanctions component 70; band per math.
- [ ] Adverse-media-only (recent) → adverse component 100; correct weighted overall.
- [ ] Clear everything → `band: 'clear'`, `overallScore` low, all categories present=false.
- [ ] `highRiskActivityScores` has exactly `HIGH_RISK_ACTIVITIES.length` entries; only the
      flagged ones have `present: true` / `score > 0`.
- [ ] `social: null` → weights renormalized to sanctions+adverse summing to 1.
- [ ] `isSanctioned` forces `high` even if overall < 60.
- [ ] `sanctions.error` set → score 0 for that component, no throw, degraded note in summary.
- [ ] Output validates against the `RiskReport` type (mocks double as golden values).

### Acceptance
`scoreReport(mockSanctionsResult, mockAdverseMediaResult)` === a `high` report matching
`mockRiskReport`; clear inputs produce a `clear` report.

---

## 8. How to work without the other parts
You depend on nobody. Build entirely against `mocks.ts`. Parts 1/2/4 depend on **you**, so
land `types.ts` + `mocks.ts` + data files first — that's your hour-1 priority over scoring.

## 9. Definition of done
- [ ] Contracts, data files, mocks, `.env.example`, vitest landed in hour 1.
- [ ] `scoreReport()` implements the weighting (sanctions 0.60 / adverse 0.30 / social 0.10).
- [ ] Per-activity and per-signal scores produced for the report.
- [ ] PDF export works. Tests green.
