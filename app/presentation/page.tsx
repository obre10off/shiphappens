'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Banknote,
  Brain,
  ChevronRight,
  Clock,
  FileText,
  Gauge,
  Globe2,
  Play,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// DEMO VIDEO
// Paste the YouTube video ID below (the part after `watch?v=` or `youtu.be/`).
// e.g. for https://www.youtube.com/watch?v=dQw4w9WgXcQ  →  'dQw4w9WgXcQ'
// Leave as '' to show the styled placeholder until the link is ready.
const YOUTUBE_VIDEO_ID = '';
// ─────────────────────────────────────────────────────────────────────────────

/** Two-dot brand mark + wordmark, echoing the Clavis logo. */
function Wordmark({ onDark = false }: { onDark?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="relative inline-block h-5 w-7" aria-hidden>
        <span className="absolute left-0 top-1 h-3 w-3 rounded-full bg-accent" />
        <span
          className={`absolute left-3 top-1 h-3 w-3 rounded-full ${onDark ? 'bg-white' : 'bg-ink'}`}
        />
      </span>
      <span
        className={`text-[17px] font-semibold tracking-tight ${onDark ? 'text-white' : 'text-ink'}`}
      >
        Clavis
      </span>
    </div>
  );
}

/** Small uppercase section label. */
function Kicker({ children, onDark = false }: { children: React.ReactNode; onDark?: boolean }) {
  return (
    <div
      className={`mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${
        onDark ? 'border-white/15 text-white/70' : 'border-line text-muted'
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      {children}
    </div>
  );
}

/** Tiny source footnote shown at the bottom of a stat slide. */
function Sources({ items, onDark = false }: { items: string[]; onDark?: boolean }) {
  return (
    <p
      className={`mt-10 text-[11px] leading-relaxed ${onDark ? 'text-white/35' : 'text-faint'}`}
    >
      Sources: {items.join(' · ')}
    </p>
  );
}

type Slide = {
  id: string;
  label: string;
  theme: 'light' | 'dark';
  render: () => React.ReactNode;
};

// ── Slides ───────────────────────────────────────────────────────────────────

const slides: Slide[] = [
  // 01 — Title
  {
    id: 'title',
    label: 'Clavis',
    theme: 'dark',
    render: () => (
      <div className="flex flex-col items-center text-center">
        <span className="relative mb-8 inline-block h-12 w-16" aria-hidden>
          <span className="absolute left-0 top-2 h-7 w-7 rounded-full bg-accent" />
          <span className="absolute left-7 top-2 h-7 w-7 rounded-full bg-white" />
        </span>
        <h1 className="text-6xl font-medium leading-[1.02] tracking-[-0.03em] text-white sm:text-7xl">
          Clavis
        </h1>
        <p className="mt-6 max-w-xl text-xl leading-relaxed text-white/70">
          The AI compliance analyst. Screen anyone for sanctions, PEP status, and adverse
          media in seconds — with an audit-ready evidence trail.
        </p>
        <div className="mt-10 flex items-center gap-3 text-sm text-white/40">
          <span>Investor &amp; demo briefing</span>
          <span className="h-1 w-1 rounded-full bg-white/30" />
          <span>2026</span>
        </div>
      </div>
    ),
  },

  // 02 — The problem
  {
    id: 'problem',
    label: 'The problem',
    theme: 'light',
    render: () => (
      <div>
        <Kicker>The problem</Kicker>
        <h2 className="max-w-3xl text-4xl font-medium leading-[1.08] tracking-[-0.02em] text-ink sm:text-5xl">
          Compliance still runs on humans copy-pasting names.
        </h2>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
          KYC/AML screening is the gate every bank, fintech and investor must pass before
          taking on a client — and most of it is still done by hand, one analyst at a time.
        </p>

        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          <BigStat value="31–60%" label="of KYC review tasks are still done manually" />
          <BigStat value="$206B" label="spent on financial-crime compliance every year, worldwide" />
          <BigStat
            value="$2,000+"
            label="cost to complete a single corporate client's KYC review"
          />
        </div>

        <Sources
          items={[
            'LexisNexis Risk Solutions, True Cost of Financial Crime Compliance (2023)',
            'Fenergo / The Fintech Times (2024)',
            'Statista, KYC review cost in corporate banking (2024)',
          ]}
        />
      </div>
    ),
  },

  // 03 — The human factor
  {
    id: 'human-factor',
    label: 'Why it breaks',
    theme: 'light',
    render: () => (
      <div>
        <Kicker>Why it breaks</Kicker>
        <h2 className="max-w-3xl text-4xl font-medium leading-[1.08] tracking-[-0.02em] text-ink sm:text-5xl">
          The weakest link in screening is the human in the loop.
        </h2>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
          Manual review introduces error at every step — and a single mistake cascades into
          hours of wasted work or an undetected risk.
        </p>

        <div className="mt-10 grid gap-x-10 gap-y-5 sm:grid-cols-2">
          {[
            {
              t: 'Data-entry errors',
              d: 'A mistyped name or date of birth silently mismatches the customer — or fires a false alert.',
            },
            {
              t: 'Document misidentification',
              d: 'Altered or forged documents and signs of tampering get overlooked under time pressure.',
            },
            {
              t: 'Confirmation bias',
              d: 'Analysts skip standard checks for clients they already “trust” or recognise.',
            },
            {
              t: 'Improper risk assessment',
              d: 'Profiles are misclassified from shallow research or out-of-date rules.',
            },
            {
              t: 'Failure to update records',
              d: 'Ongoing monitoring and periodic file refreshes get neglected.',
            },
            {
              t: 'Inconsistency',
              d: 'Two analysts reach two different verdicts on the same subject.',
            },
          ].map((x) => (
            <div key={x.t} className="flex gap-3.5">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </span>
              <div>
                <div className="text-base font-medium text-ink">{x.t}</div>
                <div className="mt-0.5 text-sm leading-relaxed text-muted">{x.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },

  // 04 — The chain reaction
  {
    id: 'chain-reaction',
    label: 'The chain reaction',
    theme: 'dark',
    render: () => (
      <div>
        <Kicker onDark>The chain reaction</Kicker>
        <h2 className="max-w-3xl text-4xl font-medium leading-[1.08] tracking-[-0.02em] text-white sm:text-5xl">
          One typo triggers hours of phantom work.
        </h2>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/65">
          Misspell a name and it false-matches a global watchlist. Now a compliance team has
          to manually clear an alert that should never have existed.
        </p>

        <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-stretch">
          {[
            { n: '1', t: 'Human error', d: 'A name or DOB is entered wrong.' },
            { n: '2', t: 'False match', d: 'It hits a sanctions / watchlist entry.' },
            { n: '3', t: 'Alert fires', d: 'A case is opened automatically.' },
            { n: '4', t: 'Hours lost', d: 'Analysts manually clear a non-issue.' },
          ].map((s, i, arr) => (
            <div key={s.n} className="flex flex-1 items-center gap-3">
              <div className="flex-1 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">
                  {s.n}
                </div>
                <div className="mt-3 text-base font-medium text-white">{s.t}</div>
                <div className="mt-1 text-sm text-white/55">{s.d}</div>
              </div>
              {i < arr.length - 1 && (
                <ChevronRight className="hidden h-5 w-5 shrink-0 text-white/30 sm:block" />
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          <BigStat
            onDark
            value="90–95%"
            label="of screening alerts are false positives — pure noise"
            accent="risk"
          />
          <BigStat
            onDark
            value="up to 90%"
            label="of analysts' alert-investigation time is spent dismissing them"
            accent="risk"
          />
        </div>

        <Sources
          onDark
          items={[
            'FACCTUM, AML False Positive Report (2026)',
            'sanctions.io; Sardine AI — industry benchmarks',
          ]}
        />
      </div>
    ),
  },

  // 05 — The cost of getting it wrong
  {
    id: 'cost',
    label: 'The stakes',
    theme: 'light',
    render: () => (
      <div>
        <Kicker>The stakes</Kicker>
        <h2 className="max-w-3xl text-4xl font-medium leading-[1.08] tracking-[-0.02em] text-ink sm:text-5xl">
          Getting it wrong is no longer survivable.
        </h2>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
          Regulators are escalating fast — and the heaviest enforcement is landing on exactly
          the digital-asset and fintech firms moving quickest.
        </p>

        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          <BigStat value="~$4B" label="in global AML/KYC fines in 2025" accent="risk" />
          <BigStat
            value="$1B+"
            label="of that on crypto alone — OKX $500M, KuCoin $297M, BitMEX $100M"
            accent="risk"
          />
          <BigStat
            value="90%"
            label="of banks say human error directly impacts their risk decisions"
            accent="risk"
          />
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-muted">
          <span className="inline-flex items-center gap-2">
            <Scale className="h-4 w-4 text-ink" /> Regulatory & legal exposure
          </span>
          <span className="inline-flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-ink" /> Reputational damage
          </span>
          <span className="inline-flex items-center gap-2">
            <Banknote className="h-4 w-4 text-ink" /> Onboarding the wrong counterparty
          </span>
        </div>

        <Sources
          items={[
            'ComplyAdvantage; Mayer Brown; FinCEN enforcement actions (2025)',
            'Industry survey data, 2024–25',
          ]}
        />
      </div>
    ),
  },

  // 06 — The solution
  {
    id: 'solution',
    label: 'The solution',
    theme: 'light',
    render: () => (
      <div>
        <Kicker>The solution</Kicker>
        <h2 className="max-w-3xl text-4xl font-medium leading-[1.08] tracking-[-0.02em] text-ink sm:text-5xl">
          Clavis is an AI analyst that does the whole screening — in seconds.
        </h2>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
          One agent runs the exact workflow a human analyst would, then hands back a
          defensible decision with every source attached.
        </p>

        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
          {[
            {
              icon: Search,
              n: '01',
              t: 'Enter the subject',
              d: 'Name, date of birth, country, optional company or case context. That is all it needs.',
            },
            {
              icon: ShieldCheck,
              n: '02',
              t: 'The agent screens',
              d: 'Checks 200+ sanctions & PEP lists on OpenSanctions, then scans the live web for adverse media.',
            },
            {
              icon: FileText,
              n: '03',
              t: 'Audit-ready report',
              d: 'A weighted risk band & score, per-signal evidence, a timeline, cited sources and a PDF.',
            },
          ].map(({ icon: Icon, n, t, d }) => (
            <div key={t} className="bg-canvas p-7">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-alt text-ink">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-xs font-semibold text-faint">{n}</span>
              </div>
              <h3 className="mt-5 text-lg font-medium text-ink">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{d}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-2.5">
          {['200+ watchlists', '1.4M sanctions entries', 'Live adverse-media web search', 'Cited evidence trail', 'Downloadable PDF'].map(
            (tag) => (
              <span
                key={tag}
                className="rounded-full bg-surface-alt px-3 py-1.5 text-xs font-medium text-muted"
              >
                {tag}
              </span>
            ),
          )}
        </div>
      </div>
    ),
  },

  // 07 — Live demo
  {
    id: 'demo',
    label: 'Live demo',
    theme: 'dark',
    render: () => (
      <div className="flex flex-col items-center text-center">
        <Kicker onDark>See it run</Kicker>
        <h2 className="max-w-2xl text-4xl font-medium leading-[1.08] tracking-[-0.02em] text-white sm:text-5xl">
          From a name to a defensible decision.
        </h2>
        <div className="mt-9 w-full max-w-3xl">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_20px_80px_rgba(0,0,0,0.5)]">
            <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
              {YOUTUBE_VIDEO_ID ? (
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?rel=0&modestbranding=1`}
                  title="Clavis demo"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-night-alt">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent">
                    <Play className="ml-0.5 h-7 w-7 text-white" fill="currentColor" />
                  </span>
                  <span className="text-sm text-white/50">Demo video — ~20 seconds</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <Link
          href="/screen"
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-medium text-ink transition-opacity hover:opacity-90"
        >
          Or try a live screening yourself
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    ),
  },

  // 08 — Measurable outcome (speed)
  {
    id: 'speed',
    label: 'Measurable outcome',
    theme: 'light',
    render: () => (
      <div>
        <Kicker>Measurable outcome</Kicker>
        <h2 className="max-w-3xl text-4xl font-medium leading-[1.08] tracking-[-0.02em] text-ink sm:text-5xl">
          Hours of work, compressed into seconds.
        </h2>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
          The same screening, done faster and more consistently — every time, with the
          evidence already attached.
        </p>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          <CompareCard
            tone="bad"
            title="Manual adverse-media check"
            time="60–90 min"
            note="per single generic case — and a different verdict each time."
          />
          <CompareCard
            tone="good"
            title="Clavis"
            time="< 2 min"
            note="real-time web search + synthesis. A full sanctions/PEP screen lands in ~8s."
          />
        </div>

        <div className="mt-8 flex items-center gap-3 rounded-2xl border border-line bg-surface-alt px-6 py-4">
          <TrendingUp className="h-5 w-5 text-accent" />
          <span className="text-sm text-ink">
            <span className="font-semibold">~97% less time</span> on adverse media, with a
            consistent, reproducible result on every run.
          </span>
        </div>

        <Sources items={['Manual baseline: industry benchmark, 60–90 min/case', 'Clavis: measured end-to-end runtime']} />
      </div>
    ),
  },

  // 09 — The value (four pillars)
  {
    id: 'value',
    label: 'Why it matters',
    theme: 'light',
    render: () => (
      <div>
        <Kicker>Why it matters</Kicker>
        <h2 className="max-w-3xl text-4xl font-medium leading-[1.08] tracking-[-0.02em] text-ink sm:text-5xl">
          Four ways Clavis pays for itself.
        </h2>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {[
            {
              icon: Zap,
              t: 'Faster, more reliable screening',
              d: 'Decisions in seconds instead of hours — and the same answer every time, not analyst-by-analyst variance.',
            },
            {
              icon: Brain,
              t: 'No human bias',
              d: 'No data-entry typos, no document misidentification, no confirmation bias, no improper risk assessment.',
            },
            {
              icon: Banknote,
              t: 'Significant cost savings',
              d: 'A ~$35–42/hr analyst hour and a $2,000+ corporate review collapse to pennies of compute per screen.',
            },
            {
              icon: Scale,
              t: 'Protection from reputational & legal risk',
              d: 'A cited, audit-ready trail on every subject — the defensible record regulators expect.',
            },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="rounded-2xl border border-line bg-surface p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                <Icon className="h-5 w-5 text-accent" />
              </span>
              <h3 className="mt-4 text-lg font-medium text-ink">{t}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{d}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },

  // 10 — Market
  {
    id: 'market',
    label: 'The market',
    theme: 'dark',
    render: () => (
      <div>
        <Kicker onDark>The market</Kicker>
        <h2 className="max-w-3xl text-4xl font-medium leading-[1.08] tracking-[-0.02em] text-white sm:text-5xl">
          A growing, mandatory spend.
        </h2>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/65">
          Screening is not discretionary — it is a regulatory requirement for every regulated
          institution on earth. The tooling market is compounding.
        </p>

        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          <BigStat onDark value="$206B" label="spent on financial-crime compliance each year (SAM)" />
          <BigStat onDark value="~$22B" label="RegTech market today (2025) — our serviceable wedge" accent="indigo" />
          <BigStat onDark value="~$85B" label="projected RegTech market by 2035, at ~21% CAGR" accent="indigo" />
        </div>

        <div className="mt-10 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4">
          <Globe2 className="h-5 w-5 text-accent" />
          <span className="text-sm text-white/80">
            Every fintech, bank, payment firm, crypto exchange and investment fund is a buyer —
            because the law makes them one.
          </span>
        </div>

        <Sources
          onDark
          items={[
            'Precedence Research, RegTech Market (2025)',
            'LexisNexis Risk Solutions (2023)',
          ]}
        />
      </div>
    ),
  },

  // 11 — Where we're going
  {
    id: 'vision',
    label: 'Where we go next',
    theme: 'light',
    render: () => (
      <div>
        <Kicker>Where we go next</Kicker>
        <h2 className="max-w-3xl text-4xl font-medium leading-[1.08] tracking-[-0.02em] text-ink sm:text-5xl">
          From one-time screening to always-on assurance.
        </h2>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
          Onboarding is the wedge. The same agent extends naturally into the rest of the
          compliance lifecycle.
        </p>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {[
            {
              icon: Gauge,
              t: 'Ongoing counterparty monitoring',
              d: 'Continuously re-screen every relationship and alert the moment a subject’s risk changes — closing the “failure to update records” gap for good.',
            },
            {
              icon: Sparkles,
              t: 'Deeper research',
              d: 'Richer entity resolution, network/UBO analysis and broader source coverage for high-risk enhanced due diligence.',
            },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="rounded-2xl border border-line bg-surface p-7">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10">
                <Icon className="h-5 w-5 text-accent" />
              </span>
              <h3 className="mt-5 text-xl font-medium text-ink">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{d}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },

  // 12 — Closing
  {
    id: 'closing',
    label: 'Closing',
    theme: 'dark',
    render: () => (
      <div className="flex flex-col items-center text-center">
        <Wordmark onDark />
        <h2 className="mt-8 max-w-2xl text-5xl font-medium leading-[1.05] tracking-[-0.02em] text-white sm:text-6xl">
          Stop manual screening.
          <br />
          Start deciding.
        </h2>
        <p className="mx-auto mt-6 max-w-md text-lg text-white/60">
          Replace a 45-minute manual check with an audit-ready report in seconds — with no
          human error and the evidence attached.
        </p>
        <Link
          href="/screen"
          className="mt-9 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-medium text-ink transition-opacity hover:opacity-90"
        >
          Try Clavis live
          <ArrowRight className="h-4 w-4" />
        </Link>
        <p className="mt-8 text-sm text-white/35">clavis.ai · hello@clavis.ai</p>
      </div>
    ),
  },
];

// ── Reusable visual bits ─────────────────────────────────────────────────────

function BigStat({
  value,
  label,
  onDark = false,
  accent = 'ink',
}: {
  value: string;
  label: string;
  onDark?: boolean;
  accent?: 'ink' | 'risk' | 'indigo';
}) {
  const valueColor =
    accent === 'risk'
      ? 'text-red-500'
      : accent === 'indigo'
        ? 'text-accent'
        : onDark
          ? 'text-white'
          : 'text-ink';
  return (
    <div
      className={`rounded-2xl border p-6 ${
        onDark ? 'border-white/10 bg-white/[0.04]' : 'border-line bg-surface-alt'
      }`}
    >
      <div className={`text-4xl font-medium tracking-tight sm:text-5xl ${valueColor}`}>
        {value}
      </div>
      <div className={`mt-3 text-sm leading-relaxed ${onDark ? 'text-white/60' : 'text-muted'}`}>
        {label}
      </div>
    </div>
  );
}

function CompareCard({
  tone,
  title,
  time,
  note,
}: {
  tone: 'bad' | 'good';
  title: string;
  time: string;
  note: string;
}) {
  const bad = tone === 'bad';
  return (
    <div
      className={`rounded-2xl border p-7 ${
        bad ? 'border-line bg-surface' : 'border-accent/30 bg-accent/[0.04]'
      }`}
    >
      <div className="flex items-center gap-2">
        {bad ? (
          <Clock className="h-4 w-4 text-faint" />
        ) : (
          <Zap className="h-4 w-4 text-accent" />
        )}
        <span className={`text-sm font-medium ${bad ? 'text-muted' : 'text-accent'}`}>
          {title}
        </span>
      </div>
      <div
        className={`mt-4 text-5xl font-medium tracking-tight sm:text-6xl ${
          bad ? 'text-faint line-through decoration-2' : 'text-ink'
        }`}
      >
        {time}
      </div>
      <p className="mt-4 text-sm leading-relaxed text-muted">{note}</p>
    </div>
  );
}

// ── Deck shell + navigation ──────────────────────────────────────────────────

export default function PresentationPage() {
  const [index, setIndex] = useState(0);
  const total = slides.length;

  const go = useCallback(
    (next: number) => {
      setIndex((cur) => Math.max(0, Math.min(total - 1, next)));
    },
    [total],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      switch (e.key) {
        case 'ArrowRight':
        case 'PageDown':
        case ' ':
          e.preventDefault();
          setIndex((c) => Math.min(total - 1, c + 1));
          break;
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault();
          setIndex((c) => Math.max(0, c - 1));
          break;
        case 'Home':
          e.preventDefault();
          setIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setIndex(total - 1);
          break;
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [total]);

  const slide = slides[index];
  const dark = slide.theme === 'dark';

  return (
    <main
      className={`relative flex h-screen w-full flex-col overflow-hidden transition-colors duration-500 ${
        dark ? 'bg-night' : 'bg-canvas'
      }`}
    >
      {/* Progress bar */}
      <div className={`h-1 w-full ${dark ? 'bg-white/10' : 'bg-line'}`}>
        <div
          className="h-full bg-accent transition-all duration-500 ease-out"
          style={{ width: `${((index + 1) / total) * 100}%` }}
        />
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <Link href="/" aria-label="Back to home">
          <Wordmark onDark={dark} />
        </Link>
        <div
          className={`text-sm tabular-nums ${dark ? 'text-white/45' : 'text-faint'}`}
          aria-live="polite"
        >
          <span className={dark ? 'text-white' : 'text-ink'}>
            {String(index + 1).padStart(2, '0')}
          </span>{' '}
          / {String(total).padStart(2, '0')}
        </div>
      </header>

      {/* Slide content */}
      <section className="flex flex-1 items-center overflow-y-auto px-6 sm:px-10">
        <div key={slide.id} className="mx-auto w-full max-w-5xl animate-slide-up py-6">
          {slide.render()}
        </div>
      </section>

      {/* Footer / nav */}
      <footer className="flex items-center justify-between px-6 py-5 sm:px-10">
        <button
          onClick={() => go(index - 1)}
          disabled={index === 0}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm font-medium transition-opacity disabled:opacity-30 ${
            dark
              ? 'border-white/15 text-white hover:bg-white/5'
              : 'border-line text-ink hover:bg-surface-alt'
          }`}
          aria-label="Previous slide"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Dots */}
        <div className="flex items-center gap-1.5">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => go(i)}
              aria-label={`Go to slide ${i + 1}: ${s.label}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index
                  ? 'w-6 bg-accent'
                  : dark
                    ? 'w-1.5 bg-white/25 hover:bg-white/50'
                    : 'w-1.5 bg-line hover:bg-faint'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => go(index + 1)}
          disabled={index === total - 1}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-opacity disabled:opacity-30 ${
            dark ? 'bg-white text-ink hover:opacity-90' : 'bg-ink text-white hover:opacity-90'
          }`}
          aria-label="Next slide"
        >
          <span className="hidden sm:inline">Next</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </footer>
    </main>
  );
}
