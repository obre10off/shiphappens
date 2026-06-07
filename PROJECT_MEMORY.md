# Project Memory — ShipHappens (Compliance Analyst Agent)

> **Living memory of this project.** Keep this file current — see the rule in
> [CLAUDE.md](./CLAUDE.md). Update it whenever a plan file changes or a build step ships.
> Last updated: 2026-06-07.

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
- **LLM:** Anthropic Claude (`claude-sonnet-4-6`, bump to `claude-opus-4-8` if synthesis needs it).
- **Search:** Serper.dev in DEV_PLAN; **Tavily** chosen in the BUILD_PLAN track (1k free credits/mo, no card).
  ⚠️ *Open discrepancy to reconcile: DEV_PLAN says Serper, BUILD_PLAN says Tavily.*
- **PDF:** `@react-pdf/renderer` (server) or `jspdf` (client).
- Env vars: `OPENSANCTIONS_API_KEY`, `SERPER_API_KEY`/`TAVILY_API_KEY`, `ANTHROPIC_API_KEY`, `OPENSANCTIONS_SCOPE`.

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
- [ ] Shared contracts/types + data files (`lib/contracts`, `lib/data`).
- [ ] Part 1 — OpenSanctions `searchSanctions` tool.
- [ ] Part 2 — agent + `/api/screen` + adverse-media tool.
- [ ] Part 3 — scoring engine + report + PDF.
- [ ] Part 4 — frontend form / progress / dashboard.
- [ ] End-to-end real screening, deploy to Vercel.

## Progress log

- **2026-06-07** — Repo set up; DEV_PLAN + part specs + BUILD_PLAN authored; project memory + update rule added. No business logic implemented yet.
