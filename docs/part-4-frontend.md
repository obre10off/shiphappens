# Part 4 — Frontend: Form, Live Progress & Risk Dashboard

> **Owner:** _D_  ·  **Priority:** The face of the demo.
> **Goal:** Refactor the existing (fully-mocked) wizard at `app/screen/page.tsx` into a real
> flow: collect the 5 inputs, call `POST /api/screen`, render live phase progress from the
> SSE stream, then show a risk dashboard with the overall band/score **and a score per
> high-risk activity and per adverse-media signal**, plus PDF download.

The current UI is a strong starting point — keep the look (`#0d1b2a` / `#00c9a7`), the step
wizard, and the progress component. Swap the `setTimeout` fake screening for the real stream.

---

## 1. Scope

```
app/page.tsx              # landing (light touch — update copy/demos if needed)
app/screen/page.tsx       # refactor: real form + stream + dashboard
components/
  ScreeningForm.tsx       # the 5-field form (simplify from current 4-step wizard)
  ProgressStream.tsx      # renders phase events (sanctions→adverse→social→synthesis)
  RiskDashboard.tsx       # band, overall score, category score lists, summary, sources
  CategoryScoreList.tsx   # the per-activity / per-signal score bars
  ScoreGauge.tsx          # overall 0..100 gauge + band color
lib/client/
  useScreening.ts         # hook: POST /api/screen, parse SSE, expose phases + report
```

You **consume**: the `ScreenEvent` protocol + `RiskReport` type (`DEV_PLAN.md §4`) and
`lib/contracts/mocks.ts` (build the entire UI off `mockRiskReport` before the API is live).

---

## 2. Inputs (simplify to the brief's 5 fields)

The current wizard has many fields; the spec needs exactly:

| Field | Required | Control |
|-------|----------|---------|
| `name` | ✅ | text |
| `dateOfBirth` | optional | date |
| `country` | ✅ | select (reuse `COUNTRIES`) |
| `company` | optional | text |
| `freeText` | optional | textarea ("case-specific context") |

You may keep the multi-step feel or collapse to a single form + the existing demo buttons.
Keep the two quick-demo buttons (high-risk / clear) — wire them to prefill these 5 fields.
Validate `name` + `country` before enabling submit.

---

## 3. The streaming hook (`lib/client/useScreening.ts`)

```ts
type Phase = 'sanctions' | 'adverse_media' | 'social' | 'synthesis';
interface PhaseState { phase: Phase; status: 'pending' | 'running' | 'done'; detail?: string; matches?: number }

export function useScreening() {
  // start(input): POST /api/screen, read the body as a stream,
  //   split on newlines, JSON.parse each ScreenEvent:
  //     'phase'   → update PhaseState list
  //     'partial' → optional incremental data
  //     'report'  → setReport(report) (terminal)
  //     'error'   → setError(message)
  // returns { start, phases, report, error, isRunning }
}
```
Use `fetch` + `response.body.getReader()` + `TextDecoder` to read the SSE/NDJSON stream.
Buffer partial lines across chunks.

---

## 4. Live progress (`ProgressStream.tsx`)
Reuse the existing 4-step progress visuals. Map phases to the existing labels:
- `sanctions` → "Checking OpenSanctions (sanctions + PEP)…"
- `adverse_media` → "Scanning adverse media (Google + AI)…"
- `social` → "Checking social media…" (hide if social disabled/null)
- `synthesis` → "AI synthesis & risk scoring…"

Show running spinner / done check / match count per phase from the events. On `error`, show
a friendly failure state with a retry button.

---

## 5. Risk dashboard (`RiskDashboard.tsx`)
Render the final `RiskReport`:

1. **Header band:** `band` color (high=red, review=amber, clear=teal) + `ScoreGauge`
   showing `overallScore`/100 + the weight breakdown (sanctions 60 / adverse 30 / social 10).
2. **Summary** (plain text) + **Recommendation**.
3. **Adverse-media signals** (`CategoryScoreList` over `adverseMediaScores`): one row per
   signal (Sanctioned / PEP / Bad press / Recent bad press / High-risk activity) with a
   0–100 bar, present/absent state, and evidence links.
4. **High-risk activities** (`CategoryScoreList` over `highRiskActivityScores`): 28 rows,
   present ones highlighted with score bars + evidence; collapse the 0-score ones behind a
   "Show all 28 categories" toggle so the present ones stand out.
5. **Timeline** (from `adverseMedia.timeline`) + **Sources** (clickable URLs).
6. **Actions:** "Download PDF report" → `POST /api/report/pdf` with the report body; "New
   screening" resets.

`CategoryScoreList`: a labeled horizontal bar (width = score%), color by score band, the
score number, and evidence chips/links. Reuse the existing expand/collapse pattern.

---

## 6. Tests
- [ ] **Component:** `CategoryScoreList` renders all categories; bar width tracks score;
      present vs absent styling differs.
- [ ] **Hook:** `useScreening` parses a fixture NDJSON stream into phases + a final report
      (feed it a mocked `ReadableStream`).
- [ ] **Form:** submit disabled until `name` + `country` set; demo buttons prefill.
- [ ] **E2E (Playwright, available):** load `/screen`, run the "high-risk" demo against a
      mocked `/api/screen`, assert the band, overall score, and that flagged high-risk
      activities appear with non-zero bars; click PDF → download triggered.

### Acceptance
Submitting the high-risk demo shows live progress then a HIGH dashboard with per-category
scores; the clear demo shows a CLEAR dashboard with all categories at 0.

---

## 7. How to work without the other parts
- Build the **entire** UI against `lib/contracts/mocks.ts` (`mockRiskReport`) — no backend
  needed. Add a dev toggle (`?mock=1`) that bypasses the fetch and feeds the mock report
  through the same render path, plus a fake phase animation. Keep this toggle for the demo
  as a safety net if a live API is flaky.
- Swap to the real `/api/screen` once Part 2's route streams (coordinate event shape early —
  it's frozen in `DEV_PLAN.md §4`).

## 8. Definition of done
- [ ] 5-field form with validation + working demo prefills.
- [ ] Live phase progress driven by the real SSE stream.
- [ ] Dashboard shows band, overall score, per-activity + per-signal scores, summary,
      timeline, sources.
- [ ] PDF download works. Graceful error + retry. Looks polished on the existing theme.
