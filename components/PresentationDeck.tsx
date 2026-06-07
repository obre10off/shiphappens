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
import { StreamingText } from '@/components/StreamingText';

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

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 text-xs font-medium text-muted">
      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      {children}
    </div>
  );
}

function Sources({ label, items }: { label: string; items: string[] }) {
  return (
    <p className="mt-12 text-[11px] leading-relaxed text-faint">
      {label} {items.join(' · ')}
    </p>
  );
}

/** Staggered entrance — fades each child up in sequence after the slide mounts. */
function Reveal({
  index,
  base = 350,
  step = 90,
  className = '',
  children,
}: {
  index: number;
  base?: number;
  step?: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`animate-slide-up [animation-fill-mode:both] ${className}`}
      style={{ animationDelay: `${base + index * step}ms` }}
    >
      {children}
    </div>
  );
}

function BigStat({
  value,
  label,
  accent = 'ink',
  index,
}: {
  value: string;
  label: string;
  accent?: 'ink' | 'risk' | 'indigo';
  index: number;
}) {
  const valueColor =
    accent === 'risk' ? 'text-red-500' : accent === 'indigo' ? 'text-accent' : 'text-ink';
  return (
    <Reveal index={index} className="rounded-2xl border border-line bg-surface-alt p-6">
      <div className={`text-4xl font-medium tracking-tight sm:text-5xl ${valueColor}`}>{value}</div>
      <div className="mt-3 text-sm leading-relaxed text-muted">{label}</div>
    </Reveal>
  );
}

const HEADING =
  'max-w-3xl text-4xl font-medium leading-[1.08] tracking-[-0.02em] text-ink sm:text-5xl';

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
          <span className="relative mb-12 inline-block h-20 w-28" aria-hidden>
            <span className="absolute left-0 top-3 h-12 w-12 rounded-full bg-accent sm:h-14 sm:w-14" />
            <span className="absolute left-12 top-3 h-12 w-12 rounded-full bg-ink sm:left-14 sm:h-14 sm:w-14" />
          </span>
          <h1 className="text-8xl font-medium leading-[0.98] tracking-[-0.04em] text-ink sm:text-9xl">
            {t.title.product}
          </h1>
          <StreamingText
            text={t.title.subtitle}
            speed={45}
            startDelay={350}
            className="mt-8 justify-center text-3xl leading-relaxed text-muted sm:text-4xl"
          />
          <Reveal index={0} base={1600} className="mt-14">
            <div className="flex items-center gap-3 text-sm text-faint">
              <span>{t.ui.briefing}</span>
              <span className="h-1 w-1 rounded-full bg-faint/60" />
              <span>{t.ui.year}</span>
            </div>
          </Reveal>
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
          <StreamingText text={t.problem.heading} className={HEADING} />
          <div className="mt-14 grid gap-5 sm:grid-cols-3">
            {t.problem.stats.map((s: Stat, i) => (
              <BigStat key={s.label} value={s.value} label={s.label} index={i} />
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
          <StreamingText text={t.human.heading} className={HEADING} />
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {t.human.items.map((item, i) => (
              <Reveal
                key={item}
                index={i}
                className="flex items-center gap-3.5 rounded-2xl border border-line bg-surface p-5"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
                  <AlertTriangle className="h-[18px] w-[18px] text-red-500" />
                </span>
                <span className="text-base font-medium text-ink">{item}</span>
              </Reveal>
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
          <StreamingText text={t.chain.heading} className={HEADING} />
          <div className="mt-14 flex flex-col gap-3 sm:flex-row sm:items-center">
            {t.chain.steps.map((step, i, arr) => (
              <div key={step} className="flex flex-1 items-center gap-3">
                <Reveal
                  index={i}
                  className="flex flex-1 items-center gap-3.5 rounded-2xl border border-line bg-surface p-5"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">
                    {i + 1}
                  </span>
                  <span className="text-base font-medium text-ink">{step}</span>
                </Reveal>
                {i < arr.length - 1 && (
                  <ChevronRight className="hidden h-5 w-5 shrink-0 text-faint sm:block" />
                )}
              </div>
            ))}
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {t.chain.stats.map((s, i) => (
              <BigStat key={s.label} value={s.value} label={s.label} accent="risk" index={i + 4} />
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
          <StreamingText text={t.stakes.heading} className={HEADING} />
          <div className="mt-14 grid gap-5 sm:grid-cols-3">
            {t.stakes.stats.map((s, i) => (
              <BigStat key={s.label} value={s.value} label={s.label} accent="risk" index={i} />
            ))}
          </div>
          <Reveal index={3} className="mt-10">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-muted">
              {t.stakes.tags.map((tag, i) => {
                const Icon = stakesTagIcons[i] ?? AlertTriangle;
                return (
                  <span key={tag} className="inline-flex items-center gap-2">
                    <Icon className="h-4 w-4 text-ink" /> {tag}
                  </span>
                );
              })}
            </div>
          </Reveal>
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
          <StreamingText text={t.solution.heading} className={HEADING} />
          <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
            {t.solution.steps.map((step, i) => {
              const Icon = solutionIcons[i] ?? Search;
              return (
                <Reveal key={step} index={i} className="bg-canvas p-7">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-alt text-ink">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-xs font-semibold text-faint">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="mt-6 text-lg font-medium text-ink">{step}</h3>
                </Reveal>
              );
            })}
          </div>
          <Reveal index={3} className="mt-8">
            <div className="flex flex-wrap gap-2.5">
              {t.solution.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-surface-alt px-3 py-1.5 text-xs font-medium text-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          </Reveal>
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
          <StreamingText
            text={t.demo.heading}
            className="max-w-2xl justify-center text-4xl font-medium leading-[1.08] tracking-[-0.02em] text-ink sm:text-5xl"
          />
          <Reveal index={0} base={500} className="mt-9 w-full max-w-3xl">
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
          </Reveal>
          <Reveal index={1} base={650}>
            <Link
              href="/screen"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-ink px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              {t.demo.cta}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Reveal>
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
          <StreamingText text={t.speed.heading} className={HEADING} />
          <div className="mt-14 grid gap-5 sm:grid-cols-2">
            <Reveal index={0} className="rounded-2xl border border-line bg-surface p-7">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-faint" />
                <span className="text-sm font-medium text-muted">{t.speed.bad.title}</span>
              </div>
              <div className="mt-4 text-5xl font-medium tracking-tight text-faint line-through decoration-2 sm:text-6xl">
                {t.speed.bad.time}
              </div>
            </Reveal>
            <Reveal index={1} className="rounded-2xl border border-accent/30 bg-accent/[0.04] p-7">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium text-accent">{t.speed.good.title}</span>
              </div>
              <div className="mt-4 text-5xl font-medium tracking-tight text-ink sm:text-6xl">
                {t.speed.good.time}
              </div>
            </Reveal>
          </div>
          <Reveal index={2} className="mt-8">
            <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface-alt px-6 py-4">
              <TrendingUp className="h-5 w-5 shrink-0 text-accent" />
              <span className="text-sm text-ink">
                <span className="font-semibold">{t.speed.highlight.strong}</span>{' '}
                {t.speed.highlight.rest}
              </span>
            </div>
          </Reveal>
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
          <StreamingText text={t.value.heading} className={HEADING} />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {t.value.pillars.map((pillar, i) => {
              const Icon = valueIcons[i] ?? Zap;
              return (
                <Reveal key={pillar} index={i} className="rounded-2xl border border-line bg-surface p-6">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                    <Icon className="h-5 w-5 text-accent" />
                  </span>
                  <h3 className="mt-5 text-lg font-medium text-ink">{pillar}</h3>
                </Reveal>
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
          <StreamingText text={t.market.heading} className={HEADING} />
          <div className="mt-14 grid gap-5 sm:grid-cols-3">
            {t.market.stats.map((s, i) => (
              <BigStat
                key={s.label}
                value={s.value}
                label={s.label}
                accent={i === 0 ? 'ink' : 'indigo'}
                index={i}
              />
            ))}
          </div>
          <Reveal index={3} className="mt-10">
            <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface-alt px-6 py-4">
              <Globe2 className="h-5 w-5 shrink-0 text-accent" />
              <span className="text-sm text-ink">{t.market.note}</span>
            </div>
          </Reveal>
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
          <StreamingText text={t.vision.heading} className={HEADING} />
          <div className="mt-14 grid gap-5 sm:grid-cols-2">
            {t.vision.items.map((item, i) => {
              const Icon = visionIcons[i] ?? Sparkles;
              return (
                <Reveal key={item} index={i} className="rounded-2xl border border-line bg-surface p-8">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                    <Icon className="h-6 w-6 text-accent" />
                  </span>
                  <h3 className="mt-6 text-xl font-medium text-ink">{item}</h3>
                </Reveal>
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
          <StreamingText
            text={`${t.closing.title1}\n${t.closing.title2}`}
            speed={40}
            startDelay={300}
            className="mt-8 max-w-2xl justify-center text-5xl font-medium leading-[1.05] tracking-[-0.02em] text-ink sm:text-6xl"
          />
          <Reveal index={0} base={1400}>
            <Link
              href="/screen"
              className="mt-9 inline-flex items-center gap-2 rounded-lg bg-ink px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              {t.closing.cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
          <Reveal index={1} base={1550}>
            <p className="mt-8 text-sm text-faint">{t.closing.contact}</p>
          </Reveal>
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

  return (
    <main className="relative flex h-screen w-full flex-col overflow-hidden bg-canvas">
      <div className="h-1 w-full bg-line">
        <div
          className="h-full bg-accent transition-all duration-500 ease-out"
          style={{ width: `${((index + 1) / total) * 100}%` }}
        />
      </div>

      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <Link href="/" aria-label="Back to home">
          <Wordmark />
        </Link>
        <div className="flex items-center gap-5">
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

      <section className="flex flex-1 items-center overflow-y-auto px-6 sm:px-10">
        <div key={`${locale}-${slide.id}`} className="mx-auto w-full max-w-5xl py-6">
          {slide.render()}
        </div>
      </section>

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
