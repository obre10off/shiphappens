Great choice. Let me lock in exactly what we're building.

---

**The AI Employee:**
# Compliance Analyst Agent

**One line pitch:**
*"An AI employee that screens any person or company for sanctions, PEP status, and adverse media — in 8 seconds instead of 45 minutes."*

---

**The exact workflow we're building:**

```
Input: Full name + country + (optional: DOB, company)
        ↓
Step 1: Sanctions screening
OpenSanctions API — 200+ lists including
OFAC, EU, UN, UK, Interpol
        ↓
Step 2: PEP screening
OpenSanctions PEP database —
politicians, government officials,
their family + close associates
        ↓
Step 3: Adverse media scan
Web search for name + fraud / corruption /
money laundering / criminal
        ↓
Step 4: AI synthesis
Claude reads all findings, resolves
conflicts, assesses false positives,
writes plain-language explanation
        ↓
Step 5: Risk report generation
Risk score: Clear / Review / High Risk
Evidence trail with sources
Recommended action
Downloadable PDF
        ↓
Output: Audit-ready compliance report
```

---

**Why this wins on every judging criterion:**

**AI/Tech Innovation (35%)**
- Hits 3 real external data sources simultaneously
- AI doesn't just retrieve — it synthesizes, resolves ambiguity, explains reasoning
- Handles false positives intelligently (common names)
- Genuinely non-trivial — not a ChatGPT wrapper

**Product & UX (25%)**
- Single input form — name + country
- Real-time progress showing each step completing
- Output anyone can read — no compliance expertise needed
- PDF download makes it feel like a real deliverable

**Feasibility (15%)**
- OpenSanctions API — free, live right now
- Web search — Serper.dev or Tavily API, free tier
- Claude API — you have it
- PDF generation — jsPDF, trivial
- Core demo buildable in 5-6 hours

**Business Potential (25%)**
- Every bank, fintech, law firm, crypto exchange, real estate agency is legally required to do this
- Manual cost: €80k/year compliance analyst
- Per-check cost with this agent: cents
- Competitors: Refinitiv World-Check (€50k+/year), ComplyAdvantage (€30k+/year)
- Your positioning: same quality, fraction of the cost, instant deployment

---

**The demo script — 5 minutes:**

**Minute 1 — The hook**
*"Every time a bank onboards a customer, a fintech processes a payment, or a law firm takes on a client — someone has to manually check if that person is a sanctioned criminal, a corrupt politician, or a money laundering risk. That person costs €80,000 a year. They take 45 minutes per check. And they make mistakes."*

**Minute 2 — The demo**
Type a name live. Show the agent working in real time — each step completing visually. Use a name that will return interesting results from OpenSanctions (there are many real public figures on these lists).

**Minute 3 — The result**
Show the report. Risk score. Evidence. Sources. Plain language explanation. PDF download. *"8 seconds. Audit-ready. Zero human involvement."*

**Minute 4 — The business case**
*"The global AML compliance market is $4.7B and growing 15% per year. Every regulated business needs this. Our first customer segment: Bulgarian fintechs and law firms who pay €2,000/month to compliance consultants for exactly this service."*

**Minute 5 — The ask / close**
Measurable result slide: checks per second, cost per check, time saved, error rate comparison.

---

**What to build first — priority order:**

**Hour 1-2:** OpenSanctions API integration + basic results display

**Hour 2-3:** Web search adverse media integration + Claude synthesis prompt

**Hour 3-5:** Frontend — input form + real-time progress animation + results dashboard

**Hour 5-6:** PDF report generation + risk scoring logic

**Hour 6-7:** Polish UI + test with multiple real names + edge cases

**Hour 7-8:** Pitch deck + rehearse demo flow

---

**One name to test that will definitely return results:**
Search OpenSanctions for any publicly sanctioned individual — the database has 1.4 million entries including politicians, oligarchs, and sanctioned entities across 200+ lists. You'll have no shortage of dramatic demo subjects.

---

Ready to start mapping the technical architecture in detail, or move straight to the pitch deck structure?