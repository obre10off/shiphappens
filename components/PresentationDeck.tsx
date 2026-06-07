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
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Locale, PresentationContent, Stat } from '@/lib/presentation/content';
import { DEMO_VIDEO_ID } from '@/lib/presentation/content';

/** Two-dot brand mark + wordmark, echoing the Clavis logo. */
function Wordmark() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="relative inline-block h-5 w-7" aria-hidden>
        <span className="absolute left-0 top-1 h-3 w-3 rounded-full bg-accent" />
        <span className="absolute left-3 top-1 h-3 w-3 rounded-full bg-ink" />
      </span>
      <span className="text-[17px] font-semibold tracking-tight text-ink">Clavis</span>
    </div>
  );
}

/** Small uppercase section label. */
function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 text-xs font-medium text-muted">
      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      {children}
    </div>
  );
}

/** Tiny source footnote shown at the bottom of a stat slide. */
function Sources({ label, items }: { label: string; items: string[] }) {
  return (
    <p className="mt-10 text-[11px] leading-relaxed text-faint">
      {label} {items.join(' · ')}
    </p>
  );
}

function BigStat({
  value,
  label,
  accent = 'ink',
}: {
  value: string;
  label: string;
  accent?: 'ink' | 'risk' | 'indigo';
}) {
  const valueColor =
    accent === 'risk' ? 'text-red-500' : accent === 'indigo' ? 'text-accent' : 'text-ink';
  return (
    <div className="rounded-2xl border border-line bg-surface-alt p-6">
      <div className={`text-4xl font-medium tracking-tight sm:text-5xl ${valueColor}`}>{value}</div>
      <div className="mt-3 text-sm leading-relaxed text-muted">{label}</div>
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
        {bad ? <Clock className="h-4 w-4 text-faint" /> : <Zap className="h-4 w-4 text-accent" />}
        <span className={`text-sm font-medium ${bad ? 'text-muted' : 'text-accent'}`}>{title}</span>
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

const HEADING = 'max-w-3xl text-4xl font-medium leading-[1.08] tracking-[-0.02em] text-ink sm:text-5xl';
const BODY = 'mt-5 max-w-2xl text-lg leading-relaxed text-muted';

// ── Deck ─────────────────────────────────────────────────────────────────────

export default function PresentationDeck({
  content: t,
  locale,
}: {
  content: PresentationContent;
  locale: Locale;
}) {
  const stakesTagIcons: LucideIcon[] = [Scale, AlertTriangle, Banknote];
  const solutionIcons: LucideIcon[] = [Search, ShieldCheck, FileText];
  const valueIcons: LucideIcon[] = [Zap, Brain, Banknote, Scale];
  const visionIcons: LucideIcon[] = [Gauge, Sparkles];

  const slides: { id: string; label: string; render: () => React.ReactNode }[] = [
    // 01 — Title
    {
      id: 'title',
      label: t.title.label,
      render: () => (
        <div className="flex flex-col items-center text-center">
          <span className="relative mb-8 inline-block h-12 w-16" aria-hidden>
            <span className="absolute left-0 top-2 h-7 w-7 rounded-full bg-accent" />
            <span className="absolute left-7 top-2 h-7 w-7 rounded-full bg-ink" />
          </span>
          <h1 className="text-6xl font-medium leading-[1.02] tracking-[-0.03em] text-ink sm:text-7xl">
            {t.title.product}
          </h1>
          <p className="mt-6 max-w-xl text-xl leading-relaxed text-muted">{t.title.subtitle}</p>
          <div className="mt-10 flex items-center gap-3 text-sm text-faint">
            <span>{t.ui.briefing}</span>
            <span className="h-1 w-1 rounded-full bg-faint/60" />
            <span>{t.ui.year}</span>
          </div>
        </div>
      ),
    },

    // 02 — Problem
    {
      id: 'problem',
      label: t.problem.label,
      render: () => (
        <div>
          <Kicker>{t.problem.kicker}</Kicker>
          <h2 className={HEADING}>{t.problem.heading}</h2>
          <p className={BODY}>{t.problem.body}</p>
          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {t.problem.stats.map((s: Stat) => (
              <BigStat key={s.label} value={s.value} label={s.label} />
            ))}
          </div>
          <Sources label={t.ui.sources} items={t.problem.sources} />
        </div>
      ),
    },

    // 03 — Human factor
    {
      id: 'human-factor',
      label: t.human.label,
      render: () => (
        <div>
          <Kicker>{t.human.kicker}</Kicker>
          <h2 className={HEADING}>{t.human.heading}</h2>
          <p className={BODY}>{t.human.body}</p>
          <div className="mt-10 grid gap-x-10 gap-y-5 sm:grid-cols-2">
            {t.human.items.map((x) => (
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

    // 04 — Chain reaction
    {
      id: 'chain-reaction',
      label: t.chain.label,
      render: () => (
        <div>
          <Kicker>{t.chain.kicker}</Kicker>
          <h2 className={HEADING}>{t.chain.heading}</h2>
          <p className={BODY}>{t.chain.body}</p>
          <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-stretch">
            {t.chain.steps.map((s, i, arr) => (
              <div key={s.t} className="flex flex-1 items-center gap-3">
                <div className="flex-1 rounded-2xl border border-line bg-surface p-5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">
                    {i + 1}
                  </div>
                  <div className="mt-3 text-base font-medium text-ink">{s.t}</div>
                  <div className="mt-1 text-sm text-muted">{s.d}</div>
                </div>
                {i < arr.length - 1 && (
                  <ChevronRight className="hidden h-5 w-5 shrink-0 text-faint sm:block" />
                )}
              </div>
            ))}
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {t.chain.stats.map((s) => (
              <BigStat key={s.label} value={s.value} label={s.label} accent="risk" />
            ))}
          </div>
          <Sources label={t.ui.sources} items={t.chain.sources} />
        </div>
      ),
    },

    // 05 — Stakes
    {
      id: 'stakes',
      label: t.stakes.label,
      render: () => (
        <div>
          <Kicker>{t.stakes.kicker}</Kicker>
          <h2 className={HEADING}>{t.stakes.heading}</h2>
          <p className={BODY}>{t.stakes.body}</p>
          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {t.stakes.stats.map((s) => (
              <BigStat key={s.label} value={s.value} label={s.label} accent="risk" />
            ))}
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-muted">
            {t.stakes.tags.map((tag, i) => {
              const Icon = stakesTagIcons[i] ?? AlertTriangle;
              return (
                <span key={tag} className="inline-flex items-center gap-2">
                  <Icon className="h-4 w-4 text-ink" /> {tag}
                </span>
              );
            })}
          </div>
          <Sources label={t.ui.sources} items={t.stakes.sources} />
        </div>
      ),
    },

    // 06 — Solution
    {
      id: 'solution',
      label: t.solution.label,
      render: () => (
        <div>
          <Kicker>{t.solution.kicker}</Kicker>
          <h2 className={HEADING}>{t.solution.heading}</h2>
          <p className={BODY}>{t.solution.body}</p>
          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
            {t.solution.steps.map((s, i) => {
              const Icon = solutionIcons[i] ?? Search;
              return (
                <div key={s.t} className="bg-canvas p-7">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-alt text-ink">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-xs font-semibold text-faint">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-medium text-ink">{s.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{s.d}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-8 flex flex-wrap gap-2.5">
            {t.solution.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-surface-alt px-3 py-1.5 text-xs font-medium text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      ),
    },

    // 07 — Demo
    {
      id: 'demo',
      label: t.demo.label,
      render: () => (
        <div className="flex flex-col items-center text-center">
          <Kicker>{t.demo.kicker}</Kicker>
          <h2 className="max-w-2xl text-4xl font-medium leading-[1.08] tracking-[-0.02em] text-ink sm:text-5xl">
            {t.demo.heading}
          </h2>
          <div className="mt-9 w-full max-w-3xl">
            <div className="overflow-hidden rounded-2xl border border-line bg-black shadow-[0_10px_40px_rgba(10,10,10,0.12)]">
              <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src={`https://www.youtube.com/embed/${DEMO_VIDEO_ID}?rel=0&modestbranding=1`}
                  title="Clavis demo"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
          <Link
            href="/screen"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-ink px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            {t.demo.cta}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      ),
    },

    // 08 — Speed / measurable outcome
    {
      id: 'speed',
      label: t.speed.label,
      render: () => (
        <div>
          <Kicker>{t.speed.kicker}</Kicker>
          <h2 className={HEADING}>{t.speed.heading}</h2>
          <p className={BODY}>{t.speed.body}</p>
          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            <CompareCard tone="bad" title={t.speed.bad.title} time={t.speed.bad.time} note={t.speed.bad.note} />
            <CompareCard tone="good" title={t.speed.good.title} time={t.speed.good.time} note={t.speed.good.note} />
          </div>
          <div className="mt-8 flex items-center gap-3 rounded-2xl border border-line bg-surface-alt px-6 py-4">
            <TrendingUp className="h-5 w-5 shrink-0 text-accent" />
            <span className="text-sm text-ink">
              <span className="font-semibold">{t.speed.highlight.strong}</span> {t.speed.highlight.rest}
            </span>
          </div>
          <Sources label={t.ui.sources} items={t.speed.sources} />
        </div>
      ),
    },

    // 09 — Value
    {
      id: 'value',
      label: t.value.label,
      render: () => (
        <div>
          <Kicker>{t.value.kicker}</Kicker>
          <h2 className={HEADING}>{t.value.heading}</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {t.value.pillars.map((p, i) => {
              const Icon = valueIcons[i] ?? Zap;
              return (
                <div key={p.t} className="rounded-2xl border border-line bg-surface p-6">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                    <Icon className="h-5 w-5 text-accent" />
                  </span>
                  <h3 className="mt-4 text-lg font-medium text-ink">{p.t}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{p.d}</p>
                </div>
              );
            })}
          </div>
        </div>
      ),
    },

    // 10 — Market
    {
      id: 'market',
      label: t.market.label,
      render: () => (
        <div>
          <Kicker>{t.market.kicker}</Kicker>
          <h2 className={HEADING}>{t.market.heading}</h2>
          <p className={BODY}>{t.market.body}</p>
          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {t.market.stats.map((s, i) => (
              <BigStat key={s.label} value={s.value} label={s.label} accent={i === 0 ? 'ink' : 'indigo'} />
            ))}
          </div>
          <div className="mt-10 flex items-center gap-3 rounded-2xl border border-line bg-surface-alt px-6 py-4">
            <Globe2 className="h-5 w-5 shrink-0 text-accent" />
            <span className="text-sm text-ink">{t.market.note}</span>
          </div>
          <Sources label={t.ui.sources} items={t.market.sources} />
        </div>
      ),
    },

    // 11 — Vision
    {
      id: 'vision',
      label: t.vision.label,
      render: () => (
        <div>
          <Kicker>{t.vision.kicker}</Kicker>
          <h2 className={HEADING}>{t.vision.heading}</h2>
          <p className={BODY}>{t.vision.body}</p>
          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {t.vision.items.map((x, i) => {
              const Icon = visionIcons[i] ?? Sparkles;
              return (
                <div key={x.t} className="rounded-2xl border border-line bg-surface p-7">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10">
                    <Icon className="h-5 w-5 text-accent" />
                  </span>
                  <h3 className="mt-5 text-xl font-medium text-ink">{x.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{x.d}</p>
                </div>
              );
            })}
          </div>
        </div>
      ),
    },

    // 12 — Closing
    {
      id: 'closing',
      label: t.closing.label,
      render: () => (
        <div className="flex flex-col items-center text-center">
          <Wordmark />
          <h2 className="mt-8 max-w-2xl text-5xl font-medium leading-[1.05] tracking-[-0.02em] text-ink sm:text-6xl">
            {t.closing.title1}
            <br />
            {t.closing.title2}
          </h2>
          <p className="mx-auto mt-6 max-w-md text-lg text-muted">{t.closing.subtitle}</p>
          <Link
            href="/screen"
            className="mt-9 inline-flex items-center gap-2 rounded-lg bg-ink px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            {t.closing.cta}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-8 text-sm text-faint">{t.closing.contact}</p>
        </div>
      ),
    },
  ];

  const total = slides.length;
  const [index, setIndex] = useState(0);

  const go = useCallback(
    (next: number) => setIndex(() => Math.max(0, Math.min(total - 1, next))),
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
  const otherLocale: Locale = locale === 'en' ? 'bg' : 'en';

  return (
    <main className="relative flex h-screen w-full flex-col overflow-hidden bg-canvas">
      {/* Progress bar */}
      <div className="h-1 w-full bg-line">
        <div
          className="h-full bg-accent transition-all duration-500 ease-out"
          style={{ width: `${((index + 1) / total) * 100}%` }}
        />
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <Link href="/" aria-label="Back to home">
          <Wordmark />
        </Link>
        <div className="flex items-center gap-5">
          {/* Language switcher */}
          <div className="flex items-center gap-1 text-sm">
            <Link
              href="/en/presentation"
              aria-current={locale === 'en' ? 'page' : undefined}
              className={locale === 'en' ? 'font-semibold text-ink' : 'text-faint hover:text-ink'}
            >
              EN
            </Link>
            <span className="text-faint/50">/</span>
            <Link
              href="/bg/presentation"
              aria-current={locale === 'bg' ? 'page' : undefined}
              className={locale === 'bg' ? 'font-semibold text-ink' : 'text-faint hover:text-ink'}
            >
              BG
            </Link>
          </div>
          <div className="text-sm tabular-nums text-faint" aria-live="polite">
            <span className="text-ink">{String(index + 1).padStart(2, '0')}</span> /{' '}
            {String(total).padStart(2, '0')}
          </div>
        </div>
      </header>

      {/* Slide content */}
      <section className="flex flex-1 items-center overflow-y-auto px-6 sm:px-10">
        <div key={`${locale}-${slide.id}`} className="mx-auto w-full max-w-5xl animate-slide-up py-6">
          {slide.render()}
        </div>
      </section>

      {/* Footer / nav */}
      <footer className="flex items-center justify-between px-6 py-5 sm:px-10">
        <button
          onClick={() => go(index - 1)}
          disabled={index === 0}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3.5 py-2 text-sm font-medium text-ink transition-opacity hover:bg-surface-alt disabled:opacity-30"
          aria-label={t.ui.prev}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">{t.ui.prev}</span>
        </button>

        <div className="flex items-center gap-1.5">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => go(i)}
              aria-label={`${t.ui.goToSlide} ${i + 1}: ${s.label}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? 'w-6 bg-accent' : 'w-1.5 bg-line hover:bg-faint'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => go(index + 1)}
          disabled={index === total - 1}
          className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-3.5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-30"
          aria-label={t.ui.next}
        >
          <span className="hidden sm:inline">{t.ui.next}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </footer>
    </main>
  );
}
