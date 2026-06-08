'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Banknote,
  Brain,
  CheckCircle2,
  ChevronRight,
  Clock,
  Eye,
  FileSearch,
  FileText,
  Gauge,
  History,
  Keyboard,
  Megaphone,
  Plug,
  Scale,
  Search,
  ShieldCheck,
  Split,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Locale, PresentationContent, Stat } from '@/lib/presentation/content';
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

/**
 * Small brand logo icon with graceful fallback. Tries `/logos/<slug>.png` (drop
 * real assets there); if it 404s, it simply hides — the company name next to it
 * always shows, so the slide is never broken.
 */
function LogoIcon({ slug, name }: { slug: string; name: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/logos/${slug}.png`}
      alt={name}
      onError={() => setFailed(true)}
      className="h-6 w-6 shrink-0 rounded-[4px] object-contain"
    />
  );
}

/**
 * A positioned competitor marker on the 2×2 matrix. Renders the brand logo in a
 * white chip (Clavis gets the accent treatment); falls back to the name text if
 * the logo is missing — never a broken image.
 */
function CompetitorLogo({ slug, name, us }: { slug: string; name: string; us?: boolean }) {
  const [failed, setFailed] = useState(false);
  if (us) {
    return (
      <div className="flex items-center gap-2.5 rounded-2xl border-2 border-accent bg-accent px-5 py-3 shadow-lg ring-4 ring-accent/20">
        <span className="h-3 w-3 rounded-full bg-white" />
        <span className="whitespace-nowrap text-2xl font-bold text-white">{name}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center rounded-2xl border border-line bg-white px-4 py-3 shadow-md">
      {failed ? (
        <span className="whitespace-nowrap text-base font-semibold text-ink">{name}</span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/logos/${slug}.png`}
          alt={name}
          onError={() => setFailed(true)}
          className="h-11 w-auto max-w-[180px] object-contain"
        />
      )}
    </div>
  );
}

/**
 * Team headshot with graceful fallback. Tries `/team/<slug>.jpg` (drop real
 * photos there); falls back to an initials avatar so the slot always looks
 * intentional.
 */
function Avatar({ slug, name }: { slug: string; name: string }) {
  const [failed, setFailed] = useState(false);
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);
  if (failed) {
    return (
      <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-2xl font-semibold text-accent">
        {initials}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/team/${slug}.jpg`}
      alt={name}
      onError={() => setFailed(true)}
      className="h-24 w-24 shrink-0 rounded-2xl object-cover ring-1 ring-line"
    />
  );
}

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-line px-4 py-1.5 text-base font-medium text-muted">
      <span className="h-2 w-2 rounded-full bg-accent" />
      {children}
    </div>
  );
}

function Sources({ label, items }: { label: string; items: string[] }) {
  return (
    <p className="mt-10 text-sm leading-relaxed text-faint">
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
      <div className={`text-5xl font-medium tracking-tight sm:text-6xl ${valueColor}`}>{value}</div>
      <div className="mt-3 text-lg leading-relaxed text-muted">{label}</div>
    </Reveal>
  );
}

const HEADING =
  'max-w-4xl text-5xl font-medium leading-[1.06] tracking-[-0.02em] text-ink sm:text-6xl';

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
  // Slide 03 — one distinct icon per human-error mode (was all AlertTriangle).
  const humanIcons: LucideIcon[] = [Keyboard, FileSearch, Eye, Gauge, History, Split];
  const gtmIcons: LucideIcon[] = [Users, Plug, Megaphone];

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
            {t.human.items.map((item, i) => {
              const Icon = humanIcons[i] ?? AlertTriangle;
              return (
                <Reveal
                  key={item}
                  index={i}
                  className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-6"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-500/10">
                    <Icon className="h-6 w-6 text-red-500" />
                  </span>
                  <span className="text-xl font-medium text-ink">{item}</span>
                </Reveal>
              );
            })}
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
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-base font-semibold text-white">
                    {i + 1}
                  </span>
                  <span className="text-lg font-medium text-ink">{step}</span>
                </Reveal>
                {i < arr.length - 1 && (
                  <ChevronRight className="hidden h-6 w-6 shrink-0 text-faint sm:block" />
                )}
              </div>
            ))}
          </div>
          <Reveal index={4} className="mt-8 rounded-2xl border border-line bg-surface-alt p-7">
            <div className="flex items-baseline gap-4">
              <span className="text-5xl font-medium tracking-tight text-red-500 sm:text-6xl">
                {t.chain.stat.value}
              </span>
              <span className="text-lg leading-snug text-muted">{t.chain.stat.label}</span>
            </div>
          </Reveal>
          <Reveal index={5} className="mt-4">
            <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-6 py-5">
              <TrendingUp className="h-6 w-6 shrink-0 text-red-500" />
              <span className="text-lg text-ink">
                <span className="font-semibold">{t.chain.takeaway.strong}</span>
                {t.chain.takeaway.rest}
              </span>
            </div>
          </Reveal>
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
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-lg text-muted">
              {t.stakes.tags.map((tag, i) => {
                const Icon = stakesTagIcons[i] ?? AlertTriangle;
                return (
                  <span key={tag} className="inline-flex items-center gap-2.5">
                    <Icon className="h-5 w-5 text-ink" /> {tag}
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
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-alt text-ink">
                      <Icon className="h-6 w-6" />
                    </span>
                    <span className="text-sm font-semibold text-faint">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="mt-6 text-2xl font-medium text-ink">{step}</h3>
                </Reveal>
              );
            })}
          </div>
          <Reveal index={3} className="mt-8">
            <div className="flex flex-wrap gap-3">
              {t.solution.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-surface-alt px-4 py-2 text-base font-medium text-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      ),
    },

    // 07 — Speed / measurable outcome
    {
      id: 'speed',
      label: t.speed.label,
      render: () => (
        <div>
          <Kicker>{t.speed.kicker}</Kicker>
          <StreamingText text={t.speed.heading} className={HEADING} />
          <Reveal index={0} className="mt-10">
            <div className="flex flex-wrap items-center gap-2.5">
              {t.speed.scenario.map((s) => (
                <span
                  key={s.label}
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-base"
                >
                  <span className="text-faint">{s.label}</span>
                  <span className="font-semibold text-ink">{s.value}</span>
                </span>
              ))}
            </div>
          </Reveal>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Reveal index={1} className="rounded-2xl border border-line bg-surface p-7">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-faint" />
                <span className="text-base font-medium text-muted">{t.speed.bad.title}</span>
              </div>
              <dl className="mt-5 space-y-3">
                {t.speed.bad.rows.map((r) => (
                  <div key={r.label} className="flex items-baseline justify-between gap-4">
                    <dt className="text-base text-muted">{r.label}</dt>
                    <dd className="shrink-0 text-base font-semibold text-ink">{r.value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-5 border-t border-line pt-4">
                <div className="text-sm font-medium text-faint">{t.speed.bad.totalLabel}</div>
                <div className="mt-1 text-5xl font-medium tracking-tight text-faint line-through decoration-2 sm:text-6xl">
                  {t.speed.bad.total}
                </div>
              </div>
            </Reveal>
            <Reveal index={2} className="rounded-2xl border border-accent/30 bg-accent/[0.04] p-7">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-accent" />
                <span className="text-base font-medium text-accent">{t.speed.good.title}</span>
              </div>
              <dl className="mt-5 space-y-3">
                {t.speed.good.rows.map((r) => (
                  <div key={r.label} className="flex items-baseline justify-between gap-4">
                    <dt className="text-base text-muted">{r.label}</dt>
                    <dd className="shrink-0 text-base font-semibold text-ink">{r.value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-5 border-t border-accent/20 pt-4">
                <div className="text-sm font-medium text-accent">{t.speed.good.totalLabel}</div>
                <div className="mt-1 text-5xl font-medium tracking-tight text-ink sm:text-6xl">
                  {t.speed.good.total}
                </div>
              </div>
            </Reveal>
          </div>
          <Reveal index={3} className="mt-5">
            <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface-alt px-6 py-5">
              <TrendingUp className="h-6 w-6 shrink-0 text-accent" />
              <span className="text-lg text-ink">
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
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                    <Icon className="h-6 w-6 text-accent" />
                  </span>
                  <h3 className="mt-5 text-xl font-medium text-ink">{pillar}</h3>
                </Reveal>
              );
            })}
          </div>
        </div>
      ),
    },

    // 10 — Market (TAM / SAM / SOM)
    {
      id: 'market',
      label: t.market.label,
      render: () => (
        <div>
          <Kicker>{t.market.kicker}</Kicker>
          <StreamingText text={t.market.heading} className={HEADING} />
          <div className="mt-12 grid items-center gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            {/* Concentric TAM / SAM / SOM rings */}
            <Reveal index={0} className="flex justify-center">
              <div className="relative flex h-64 w-64 items-end justify-center">
                <div className="absolute inset-0 flex items-start justify-center rounded-full border border-accent/20 bg-accent/[0.04]">
                  <span className="mt-3 text-base font-semibold tracking-wide text-accent">TAM</span>
                </div>
                <div className="absolute bottom-0 h-[68%] w-[68%] flex items-start justify-center rounded-full border border-accent/30 bg-accent/[0.07]">
                  <span className="mt-3 text-base font-semibold tracking-wide text-accent">SAM</span>
                </div>
                <div className="absolute bottom-0 h-[34%] w-[34%] flex items-center justify-center rounded-full border border-accent/50 bg-accent/20">
                  <span className="text-sm font-semibold tracking-wide text-accent">SOM</span>
                </div>
              </div>
            </Reveal>
            <div className="grid gap-3">
              {t.market.layers.map((layer, i) => (
                <Reveal
                  key={layer.tier}
                  index={i + 1}
                  className="flex items-baseline gap-5 rounded-2xl border border-line bg-surface px-6 py-5"
                >
                  <span className="w-14 shrink-0 text-base font-semibold tracking-wide text-accent">
                    {layer.tier}
                  </span>
                  <span className="w-36 shrink-0 text-4xl font-medium tracking-tight text-ink">
                    {layer.value}
                  </span>
                  <span className="text-base leading-snug text-muted">{layer.label}</span>
                </Reveal>
              ))}
            </div>
          </div>
          <Reveal index={4} className="mt-6">
            <div className="flex items-center gap-3 rounded-2xl border border-accent/30 bg-accent/[0.04] px-6 py-5">
              <Target className="h-6 w-6 shrink-0 text-accent" />
              <span className="text-lg font-medium text-ink">{t.market.note}</span>
            </div>
          </Reveal>
          <Sources label={t.ui.sources} items={t.market.sources} />
        </div>
      ),
    },

    // 11 — Competitors (X/Y positioning matrix)
    {
      id: 'competitors',
      label: t.competitors.label,
      render: () => (
        <div>
          <Kicker>{t.competitors.kicker}</Kicker>
          <StreamingText text={t.competitors.heading} className={HEADING} />
          <Reveal index={0} className="mt-6">
            <div className="flex gap-4">
              {/* Y-axis criterion (rotated) */}
              <div className="relative w-7 shrink-0">
                <span className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 -rotate-90 items-center gap-2 whitespace-nowrap text-base font-semibold uppercase tracking-wide text-ink">
                  {t.competitors.yAxis.low}
                  <span className="text-faint">←</span>
                  <span className="text-accent">{t.competitors.yAxis.label}</span>
                  <span className="text-faint">→</span>
                  {t.competitors.yAxis.high}
                </span>
              </div>
              {/* Plot */}
              <div className="flex-1">
                <div className="relative h-[340px] w-full rounded-2xl border border-line bg-surface">
                  {/* quadrant gridlines */}
                  <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-line" />
                  <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-line" />
                  {/* ideal / destination zone (top-right) */}
                  <div className="absolute right-0 top-0 flex h-1/2 w-1/2 items-start justify-end rounded-tr-2xl border-l border-b border-dashed border-accent/40 bg-accent/[0.05] p-3">
                    <span className="max-w-[150px] text-right text-sm font-semibold leading-tight text-accent/80">
                      {t.competitors.ideal}
                    </span>
                  </div>
                  {/* players */}
                  {t.competitors.players.map((p) => (
                    <div
                      key={p.slug}
                      className={`absolute -translate-x-1/2 translate-y-1/2 ${p.us ? 'z-10' : ''}`}
                      style={{ left: `${p.x}%`, bottom: `${p.y}%` }}
                    >
                      <CompetitorLogo slug={p.slug} name={p.name} us={p.us} />
                    </div>
                  ))}
                </div>
                {/* X-axis criterion */}
                <div className="mt-3 flex items-center justify-center gap-2 text-base font-semibold uppercase tracking-wide text-ink">
                  {t.competitors.xAxis.low}
                  <span className="text-faint">←</span>
                  <span className="text-accent">{t.competitors.xAxis.label}</span>
                  <span className="text-faint">→</span>
                  {t.competitors.xAxis.high}
                </div>
              </div>
            </div>
          </Reveal>
          <Reveal index={1} className="mt-5">
            <div className="flex items-center gap-3 rounded-2xl border border-accent/30 bg-accent/[0.04] px-6 py-5">
              <ShieldCheck className="h-6 w-6 shrink-0 text-accent" />
              <span className="text-lg font-medium text-ink">{t.competitors.insight}</span>
            </div>
          </Reveal>
        </div>
      ),
    },

    // 11 — Business model
    {
      id: 'business',
      label: t.business.label,
      render: () => (
        <div>
          <Kicker>{t.business.kicker}</Kicker>
          <StreamingText text={t.business.heading} className={HEADING} />
          <div className="mt-14 grid gap-5 sm:grid-cols-3">
            {t.business.tiers.map((tier, i) => (
              <Reveal
                key={tier.name}
                index={i}
                className={`rounded-2xl border p-7 ${
                  tier.highlight
                    ? 'border-accent/40 bg-accent/[0.04]'
                    : 'border-line bg-surface'
                }`}
              >
                <div className="text-lg font-medium text-muted">{tier.name}</div>
                <div
                  className={`mt-3 text-5xl font-medium tracking-tight ${
                    tier.highlight ? 'text-accent' : 'text-ink'
                  }`}
                >
                  {tier.price}
                </div>
                <div className="mt-4 text-base leading-relaxed text-muted">{tier.detail}</div>
              </Reveal>
            ))}
          </div>
          <Reveal index={3} className="mt-6">
            <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface-alt px-6 py-5">
              <TrendingUp className="h-6 w-6 shrink-0 text-accent" />
              <span className="text-lg text-ink">{t.business.note}</span>
            </div>
          </Reveal>
        </div>
      ),
    },

    // 12 — Go-to-market
    {
      id: 'gtm',
      label: t.gtm.label,
      render: () => (
        <div>
          <Kicker>{t.gtm.kicker}</Kicker>
          <StreamingText text={t.gtm.heading} className={HEADING} />
          <div className="mt-14 grid gap-5 sm:grid-cols-3">
            {t.gtm.phases.map((phase, i) => {
              const Icon = gtmIcons[i] ?? Users;
              return (
                <Reveal
                  key={phase.tag}
                  index={i}
                  className="rounded-2xl border border-line bg-surface p-6"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                      <Icon className="h-6 w-6 text-accent" />
                    </span>
                    <span className="text-sm font-semibold uppercase tracking-wide text-faint">
                      {phase.tag}
                    </span>
                  </div>
                  <h3 className="mt-5 text-2xl font-medium text-ink">{phase.title}</h3>
                  <ul className="mt-4 space-y-3">
                    {phase.points.map((point) => (
                      <li key={point} className="flex gap-2.5 text-lg leading-snug text-muted">
                        <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-accent" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              );
            })}
          </div>
        </div>
      ),
    },

    // 13 — Why us / team
    {
      id: 'team',
      label: t.team.label,
      render: () => (
        <div>
          <Kicker>{t.team.kicker}</Kicker>
          <StreamingText text={t.team.heading} className={HEADING} />
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {t.team.members.map((member, i) => (
              <Reveal
                key={member.name}
                index={i}
                className="flex items-center gap-5 rounded-2xl border border-line bg-surface p-6"
              >
                <Avatar slug={member.slug} name={member.name} />
                <div className="min-w-0">
                  <div className="text-xl font-semibold text-ink">{member.name}</div>
                  <div className="mt-1.5 text-base leading-snug text-muted">{member.role}</div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {member.companies.map((c) => (
                      <span
                        key={c.slug}
                        className="inline-flex items-center gap-2 rounded-lg bg-surface-alt px-2.5 py-1.5 text-sm font-medium text-muted"
                      >
                        <LogoIcon slug={c.slug} name={c.name} />
                        {c.name}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal index={4} className="mt-5">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-line bg-surface-alt px-6 py-5">
              <span className="inline-flex items-center gap-2 text-base text-ink">
                <Users className="h-5 w-5 shrink-0 text-accent" /> {t.team.note}
              </span>
              {t.team.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-2 text-base text-muted">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" /> {tag}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      ),
    },

    // 14 — The ask
    {
      id: 'ask',
      label: t.ask.label,
      render: () => (
        <div>
          <Kicker>{t.ask.kicker}</Kicker>
          <StreamingText text={t.ask.heading} className={HEADING} />
          <div className="mt-8 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
            <Reveal
              index={0}
              className="flex flex-col justify-center rounded-2xl border border-accent/30 bg-accent/[0.04] p-7"
            >
              <div className="flex items-center gap-2 text-base font-medium text-accent">
                <Target className="h-5 w-5" /> {t.ask.label}
              </div>
              <div className="mt-3 text-7xl font-medium tracking-tight text-ink">{t.ask.raise}</div>
              <div className="mt-3 text-base text-muted">{t.ask.raiseLabel}</div>
            </Reveal>
            <div className="grid gap-3">
              {t.ask.allocation.map((item, i) => (
                <Reveal
                  key={item.label}
                  index={i + 1}
                  className="flex items-center gap-4 rounded-2xl border border-line bg-surface px-6 py-4"
                >
                  <span className="w-20 shrink-0 text-3xl font-medium tracking-tight text-accent">
                    {item.value}
                  </span>
                  <span className="text-base leading-snug text-muted">{item.label}</span>
                </Reveal>
              ))}
            </div>
          </div>
          <Reveal index={5} className="mt-5">
            <p className="text-lg leading-relaxed text-muted">{t.ask.detail}</p>
          </Reveal>
          <Reveal index={6} className="mt-4">
            <div className="flex items-center gap-3 rounded-2xl border border-accent/30 bg-accent/[0.04] px-6 py-5">
              <CheckCircle2 className="h-6 w-6 shrink-0 text-accent" />
              <span className="text-lg font-medium text-ink">{t.ask.milestone}</span>
            </div>
          </Reveal>
        </div>
      ),
    },

    // 16 — Closing
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
              className="mt-9 inline-flex items-center gap-2 rounded-lg bg-ink px-7 py-3.5 text-lg font-medium text-white transition-opacity hover:opacity-90"
            >
              {t.closing.cta}
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Reveal>
          <Reveal index={1} base={1550}>
            <p className="mt-8 text-base text-faint">{t.closing.contact}</p>
          </Reveal>
        </div>
      ),
    },

    // A1 — Appendix · Defensibility / moat (held for jury Q&A)
    {
      id: 'appendix-moat',
      label: t.appendix.label,
      render: () => (
        <div>
          <Kicker>{t.appendix.moat.kicker}</Kicker>
          <StreamingText text={t.appendix.moat.heading} className={HEADING} />
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {t.appendix.moat.points.map((point, i) => (
              <Reveal
                key={point}
                index={i}
                className="flex gap-3.5 rounded-2xl border border-line bg-surface p-6"
              >
                <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-accent" />
                <span className="text-lg leading-snug text-ink">{point}</span>
              </Reveal>
            ))}
          </div>
        </div>
      ),
    },

    // A2 — Appendix · Trust & accuracy (held for jury Q&A)
    {
      id: 'appendix-trust',
      label: t.appendix.label,
      render: () => (
        <div>
          <Kicker>{t.appendix.trust.kicker}</Kicker>
          <StreamingText text={t.appendix.trust.heading} className={HEADING} />
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {t.appendix.trust.points.map((point, i) => (
              <Reveal
                key={point}
                index={i}
                className="flex gap-3.5 rounded-2xl border border-line bg-surface p-6"
              >
                <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-accent" />
                <span className="text-lg leading-snug text-ink">{point}</span>
              </Reveal>
            ))}
          </div>
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

      <section className="grid flex-1 place-items-center overflow-y-auto px-6 sm:px-10">
        <div
          key={`${locale}-${slide.id}`}
          className="mx-auto w-full max-w-6xl py-6 [zoom:1.15]"
        >
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
