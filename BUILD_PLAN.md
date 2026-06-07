# Build Plan — Compliance Analyst Agent

> Implementation plan derived from [prd.md](./prd.md).
> **Stack:** Next.js (App Router, TypeScript, Tailwind) on Vercel · **LLM:** Claude API · **Search:** Tavily
>
> **Workflow rule for every part below:**
> 1. Build only what the part describes.
> 2. `git add -A && git commit` the changes with a clear message.
> 3. **STOP and wait for explicit approval before starting the next part.**

---

## Architecture overview

The screening is performed by **one Claude agent** running a tool-use loop. It has **two tools**:

| Tool | Purpose | Backed by |
|------|---------|-----------|
| `screen_open_sanctions` | Sanctions + PEP screening (PRD Steps 1 & 2) | OpenSanctions API |
| `search_adverse_media` | Adverse media scan (PRD Step 3) | Tavily |

The agent decides when to call each tool, reads the raw results, then synthesizes (PRD Step 4) and emits a structured risk assessment (PRD Step 5). The frontend streams progress and renders the final report + PDF.

```
Input (name, country, optional DOB/company)
        ↓
  Claude agent (tool-use loop)
   ├─ tool: screen_open_sanctions  → sanctions + PEP hits
   └─ tool: search_adverse_media   → adverse media hits
        ↓
  Synthesis → structured risk JSON (Clear / Review / High Risk + evidence)
        ↓
  Frontend report + PDF download
```

---

## Step 0 — Project scaffold (foundation for everything)

**Goal:** a runnable, deployable empty Next.js app that all later parts build on. No business logic.

- `npx create-next-app` — TypeScript, App Router, Tailwind, ESLint, `src/` dir.
- Folder structure:
  ```
  src/
    app/
      page.tsx            # landing / input form (placeholder)
      api/screen/route.ts # agent endpoint (placeholder, returns 501)
    lib/
      types.ts            # shared types (ScreenInput, RiskReport, …)
      env.ts              # validated env access
    agent/
      tools/              # tool definitions live here
      agent.ts            # agent loop (placeholder)
    components/           # UI components
  ```
- `.env.local.example` with `ANTHROPIC_API_KEY`, `TAVILY_API_KEY` (no OpenSanctions key needed for the free endpoint).
- `.gitignore` confirms `.env.local` is ignored.
- Install deps: `@anthropic-ai/sdk`, `jspdf`, `zod`.
- `README.md` with run instructions; verify `npm run dev` boots and `npm run build` passes.

**Gate:** commit (`chore: scaffold Next.js project structure`) → **wait for approval.**

---

## Part 1 — OpenSanctions tool + agent skeleton

**Goal:** the agent can call the OpenSanctions API through its first tool.

- `src/agent/tools/screenOpenSanctions.ts` — tool schema + handler hitting the OpenSanctions match API; returns normalized sanctions + PEP hits (name, score, datasets, topics, source URLs).
- `src/agent/agent.ts` — Claude tool-use loop wired with this one tool.
- `api/screen/route.ts` — accepts input, runs the agent, returns raw tool output (no synthesis yet).
- Quick manual test with a known sanctioned name.

**Gate:** commit (`feat: OpenSanctions screening tool + agent loop`) → **wait for approval.**

---

## Part 2 — Tavily adverse-media tool (second tool)

**Goal:** add the agent's second tool for adverse media.

- `src/agent/tools/searchAdverseMedia.ts` — tool schema + handler calling Tavily with `name + (fraud|corruption|money laundering|criminal)`; returns titles, snippets, URLs.
- Register the tool in the agent loop alongside Part 1's tool.
- Test that the agent calls both tools for a single input.

**Gate:** commit (`feat: Tavily adverse-media search tool`) → **wait for approval.**

---

## Part 3 — Synthesis + risk scoring

**Goal:** turn raw tool output into an audit-ready structured report.

- System prompt: resolve conflicts, flag likely false positives (common names), explain in plain language.
- Force structured output (`RiskReport`): `riskScore` (Clear/Review/High Risk), summary, per-finding evidence with sources, recommended action.
- `api/screen/route.ts` returns the validated `RiskReport`.

**Gate:** commit (`feat: AI synthesis + risk scoring`) → **wait for approval.**

---

## Part 4 — Frontend: input form + progress + report

**Goal:** the user-facing flow.

- Input form (name, country, optional DOB/company).
- Real-time progress UI showing each step completing (stream/poll agent stages).
- Results dashboard: risk badge, summary, evidence list with source links.

**Gate:** commit (`feat: input form, progress UI, results dashboard`) → **wait for approval.**

---

## Part 5 — PDF report generation

**Goal:** downloadable audit deliverable.

- jsPDF report: header, risk score, findings, evidence/sources, timestamp.
- "Download PDF" button on the results dashboard.

**Gate:** commit (`feat: PDF report export`) → **wait for approval.**

---

## Part 6 — Polish, edge cases, deploy

**Goal:** demo-ready.

- Handle no-hits, API errors, common-name false positives, missing optional fields.
- Test multiple real names; tighten copy and UI.
- Deploy to Vercel; verify env vars in production.

**Gate:** commit (`chore: polish, edge cases, deploy config`) → **wait for approval.**
