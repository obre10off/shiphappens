# Part 2 — AI Agent, Adverse Media & Orchestration Route

> **Owner:** _B_  ·  **Priority:** Medium weight (adverse media) + owns the orchestration
> **Goal:** One Vercel AI SDK **agent** that first searches OpenSanctions (Part 1's tool),
> then searches Google for adverse media and has the LLM flag bad press + high-risk
> activities. Exposed via a streaming `POST /api/screen` route. Social search is a stretch.

This is the "1 agent" from the brief: a single agent, multiple tools, run in sequence.

---

## 1. Scope

```
lib/google/
  serper.ts        # Google search via Serper.dev
  tool.ts          # searchGoogle AI SDK tool (search + LLM adverse-media flagging)
lib/social/        # STRETCH (lowest priority)
  tool.ts          # searchSocial tool
lib/agent/
  agent.ts         # the single agent: registers tools, runs sanctions→google→synthesis
  prompts.ts       # system prompt (reuse FULL_SYSTEM_PROMPT from lib/data/adverseMedia.ts)
  schema.ts        # zod schema for the structured AdverseMediaResult
app/api/screen/
  route.ts         # POST: runs agent, streams ScreenEvents, calls Part 3 scoreReport()
lib/agent/agent.test.ts
```

You **consume**: `sanctionsTool` (Part 1), `scoreReport()` + types (Part 3).
You **produce**: `AdverseMediaResult`, `SocialMediaResult?`, and the `/api/screen` stream.

---

## 2. Google adverse-media tool (`lib/google/`)

### `serper.ts`
- `POST https://google.serper.dev/search`, header `X-API-KEY: ${SERPER_API_KEY}`.
- Body: `{ "q": "<query>", "num": 10, "gl": "<country>", "hl": "en" }`.
- Return normalized hits: `{ title, link, snippet, date? }[]`.
- 10s timeout, 1 retry, throw typed error (the tool catches and degrades).

### Query construction
Run a few targeted queries and merge/dedupe by URL:
```
"<name>" (fraud OR corruption OR "money laundering" OR sanctions OR investigation OR arrested OR lawsuit)
"<name>" <company?>
"<name>" <country>
```
Include `freeText` keywords if provided.

### `tool.ts` — `searchGoogle` (search → LLM flagging)
The tool itself does the adverse-media analysis so the agent gets structured data back:
1. Run the Serper queries, collect ~10–20 snippets with URLs + dates.
2. Call the LLM (`generateObject`, `claude-sonnet-4-6`) with:
   - **System prompt:** `FULL_SYSTEM_PROMPT` from `lib/data/adverseMedia.ts`.
   - **User message:** the subject (name/DoB/country/company/freeText) + the search results
     (title, snippet, url, date) as context to ground claims.
   - **Schema:** `adverseMediaSchema` (§3) → returns `AdverseMediaResult`.
3. Return the `AdverseMediaResult`. On any failure, return one with `error` set and
   `badPress: false` (degrade — adverse media is medium priority, never block the report).

```ts
export const googleTool = tool({
  description:
    'Search Google for adverse media about the subject and flag bad press + high-risk ' +
    'activities. Call this AFTER searchSanctions.',
  parameters: z.object({
    name: z.string(), dateOfBirth: z.string().optional(),
    country: z.string(), company: z.string().optional(), freeText: z.string().optional(),
  }),
  execute: async (a) => analyzeAdverseMedia(a),  // serper + generateObject
});
```

---

## 3. Adverse-media schema (`lib/agent/schema.ts`)

Mirror the output contract from `lib/data/adverseMedia.ts` exactly:

```ts
import { z } from 'zod';
import { HIGH_RISK_ACTIVITIES } from '@/lib/data/highRiskActivities';

export const adverseMediaSchema = z.object({
  name: z.string(),
  badPress: z.boolean(),
  badPressLast5Years: z.boolean(),       // true only if adverse media after 2021-01-01
  highRiskActivitiesFlag: z.boolean(),
  highRiskActivities: z.array(z.string()),   // must be exact strings from HIGH_RISK_ACTIVITIES
  summary: z.string(),                        // plain text, no markdown
  sources: z.array(z.object({ url: z.string(), note: z.string().optional() })),
  timeline: z.array(z.object({ date: z.string(), event: z.string() })),
});
```
After generation, **validate** `highRiskActivities` against `HIGH_RISK_ACTIVITIES` and drop
anything that doesn't match exactly (the scoring engine keys off exact strings).

---

## 4. The single agent (`lib/agent/agent.ts`)

Use the AI SDK with multi-step tool calling so one agent runs the whole sequence:

```ts
import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { sanctionsTool } from '@/lib/sanctions/tool';
import { googleTool } from '@/lib/google/tool';
import { socialTool } from '@/lib/social/tool'; // stretch

export async function runScreening(input, onEvent) {
  const result = await generateText({
    model: anthropic('claude-sonnet-4-6'),
    maxSteps: 6,
    tools: { searchSanctions: sanctionsTool, searchGoogle: googleTool /*, searchSocial: socialTool*/ },
    system: AGENT_ORCHESTRATION_PROMPT,   // "ALWAYS call searchSanctions first, then searchGoogle…"
    prompt: buildUserPrompt(input),
    onStepFinish: (step) => { /* emit phase events from tool calls */ },
  });
  // pull tool results out of result.steps → SanctionsResult + AdverseMediaResult
  return { sanctions, adverseMedia, social };
}
```

- **Order is enforced by the prompt + tool descriptions:** sanctions first, then Google,
  then social (if enabled). Emit `phase` start/done events as each tool call begins/finishes
  via `onStepFinish` / the `onEvent` callback.
- Pull the typed tool outputs from `result.steps[*].toolResults` to assemble the bundle.
- Keep the orchestration prompt small; the heavy adverse-media prompt lives in the tool.

---

## 5. The route (`app/api/screen/route.ts`)

```ts
export const runtime = 'nodejs';          // tools call external APIs
export const maxDuration = 60;            // Vercel function timeout

export async function POST(req) {
  const input = ScreeningInputSchema.parse(await req.json());
  const stream = new ReadableStream({ /* SSE */ });
  // 1. runScreening(input, emit) → emits 'phase' events as tools fire
  // 2. const report = scoreReport({ input, sanctions, adverseMedia, social })  // Part 3
  // 3. emit { type: 'report', report }; close.
  // on throw → emit { type: 'error', message }
  return new Response(stream, { headers: { 'Content-Type': 'text/event-stream' } });
}
```

Emit `ScreenEvent`s per the protocol in `DEV_PLAN.md §4`:
`phase` (sanctions→adverse_media→social→synthesis), optional `partial`, terminal `report`
or `error`. **Validate input with zod**; reject if `name` or `country` missing.

> Decision: stream newline-delimited JSON `ScreenEvent`s (simplest for Part 4 to parse). If
> you prefer the AI SDK's `streamText`/`toDataStreamResponse`, coordinate the event shape
> with Part 4 first — but the custom SSE keeps the per-phase UX the existing wizard expects.

---

## 6. Social media tool (STRETCH — only if ahead)
- `searchSocial` tool: Serper queries scoped to `linkedin.com`, `x.com`, `facebook.com`,
  `instagram.com` for the name (+company). LLM summarizes profiles + any flags →
  `SocialMediaResult`. Lowest weight (0.10). Ship `null` if not done; everything still works.

---

## 7. Tests

### Unit (mock Serper + LLM)
- [ ] `serper.ts` builds correct queries, normalizes hits, dedupes by URL.
- [ ] `analyzeAdverseMedia` returns a valid `AdverseMediaResult`; invalid `highRiskActivities`
      strings are dropped.
- [ ] `badPressLast5Years` only true for dated evidence after 2021-01-01.
- [ ] Serper failure → `AdverseMediaResult` with `error`, `badPress: false`, no throw.
- [ ] Agent runs tools in order sanctions → google (assert call sequence with mock tools).
- [ ] Route emits `phase` events then a terminal `report`; emits `error` on failure.

### Live (`*.live.test.ts`, keys required)
- [ ] A controversial public figure → `badPress: true` with real source URLs.
- [ ] A clean name → `badPress: false`, summary states no adverse media found.

### Acceptance
- `POST /api/screen` with a high-risk name streams 4 phase pairs + a `report` whose
  `adverseMedia.badPress === true` and `sanctions.isSanctioned === true`.

---

## 8. How to work without the other parts
- **Mock Part 1:** until `sanctionsTool` lands, register a stub tool returning
  `mocks.sanctionsResult` from `lib/contracts/mocks.ts`.
- **Mock Part 3:** until `scoreReport` lands, return `mocks.riskReport` in the route so the
  stream is shaped correctly for Part 4.
- Part 4 only needs the event protocol — build the route's streaming shell first so they can
  point at it early.

## 9. Definition of done
- [ ] One agent, tools fire in priority order (sanctions → google → social).
- [ ] `/api/screen` streams `ScreenEvent`s and returns a real `RiskReport`.
- [ ] Adverse media grounded in real Google sources; schema validated.
- [ ] Degrades gracefully if Google/social/LLM fail.
