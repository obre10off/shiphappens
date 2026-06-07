// lib/scoring/score.ts
// The core risk-scoring engine. Pure function over the raw signal objects.
// See part-3-scoring-and-report.md §4.

import {
  ADVERSE_POINTS,
  BANDS,
  SANCTIONS_POINTS,
  WEIGHTS,
} from '@/lib/data/weights';
import type {
  AdverseMediaResult,
  RiskBand,
  RiskReport,
  SanctionsResult,
  ScreeningInput,
  Source,
  SocialMediaResult,
} from '@/lib/contracts/types';
import { buildAdverseMediaScores, buildHighRiskActivityScores } from './categories';

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

/** Sanctions component, 0..100 (the heaviest signal). */
export function sanctionsComponent(s: SanctionsResult | null): number {
  if (!s || s.error) return 0;
  if (s.isSanctioned) return SANCTIONS_POINTS.sanctioned;
  if (s.isPep) return SANCTIONS_POINTS.pep;
  if (s.bestScore > 0) return Math.round(s.bestScore * 60);
  return 0;
}

/** Adverse-media component, 0..100. */
export function adverseComponent(a: AdverseMediaResult | null): number {
  if (!a || a.error) return 0;
  let score = 0;
  if (a.badPressLast5Years) score = ADVERSE_POINTS.badPressLast5Years;
  else if (a.badPress) score = ADVERSE_POINTS.badPressOlder;
  const activities = a.highRiskActivities?.length ?? 0;
  score += Math.min(activities * 15, ADVERSE_POINTS.highRiskActivity);
  return clamp(score);
}

/** Social component, 0..100 (lowest weight, stretch). */
export function socialComponent(s: SocialMediaResult | null): number {
  if (!s || s.error) return 0;
  const flags = s.flags?.length ?? 0;
  return flags > 0 ? Math.min(flags * 30, 100) : 0;
}

function bandFor(overall: number, isSanctioned: boolean): RiskBand {
  if (isSanctioned) return 'high'; // a sanctions hit is always high risk
  if (overall >= BANDS.high) return 'high';
  if (overall >= BANDS.review) return 'review';
  return 'clear';
}

function buildSummary(
  sanctions: SanctionsResult | null,
  adverseMedia: AdverseMediaResult | null,
): string {
  const parts: string[] = [];

  if (sanctions?.error) {
    parts.push('Sanctions screening could not be completed (degraded result).');
  } else if (sanctions?.isSanctioned || sanctions?.isPep) {
    const flags: string[] = [];
    if (sanctions.isSanctioned) {
      const lists = sanctions.datasetsHit.slice(0, 4).join(', ');
      flags.push(lists ? `listed on sanctions regimes (${lists})` : 'listed on sanctions regimes');
    }
    if (sanctions.isPep) flags.push('confirmed Politically Exposed Person');
    parts.push(`Subject ${flags.join(' and ')}.`);
  }

  if (adverseMedia?.summary) parts.push(adverseMedia.summary);
  else if (adverseMedia?.error) parts.push('Adverse-media screening was degraded.');

  if (parts.length === 0) parts.push('No material risk signals were identified.');
  // Blank line between the sanctions prefix and the adverse-media markdown so the
  // renderer treats them as separate blocks.
  return parts.join('\n\n');
}

function recommendationFor(band: RiskBand, reasons: string[]): string {
  switch (band) {
    case 'high':
      return (
        'Decline the prospective relationship and escalate to compliance / the MLRO. Do not accept ' +
        'funds or proceed with the investment. Consider filing a Suspicious Activity Report (SAR) if a ' +
        'relationship or transaction was already initiated, and retain the full evidence trail. ' +
        (reasons.length ? `Drivers: ${reasons.join('; ')}.` : '')
      ).trim();
    case 'review':
      return (
        'Do not proceed yet — conduct enhanced due diligence (EDD) before any decision. Verify ' +
        'identity and establish source of wealth and source of funds. ' +
        (reasons.length ? `Review reasons: ${reasons.join('; ')}.` : 'Resolve the flagged signals before clearing.')
      ).trim();
    case 'clear':
    default:
      return 'Cleared to proceed under standard due diligence. Document the file and schedule periodic re-screening every 12 months.';
  }
}

export function scoreReport(args: {
  input: ScreeningInput;
  sanctions: SanctionsResult | null;
  adverseMedia: AdverseMediaResult | null;
  social: SocialMediaResult | null;
  durationMs: number;
  generatedAt?: string;
}): RiskReport {
  const { input, sanctions, adverseMedia, social, durationMs } = args;

  const sScore = sanctionsComponent(sanctions);
  const aScore = adverseComponent(adverseMedia);
  const socScore = socialComponent(social);

  // Renormalize weights when social is absent so a missing stretch signal
  // doesn't deflate the overall score.
  let weights = { ...WEIGHTS };
  if (social == null) {
    const denom = WEIGHTS.sanctions + WEIGHTS.adverseMedia;
    weights = {
      sanctions: WEIGHTS.sanctions / denom,
      adverseMedia: WEIGHTS.adverseMedia / denom,
      social: 0,
    };
  }

  const overallScore = clamp(
    Math.round(
      sScore * weights.sanctions + aScore * weights.adverseMedia + socScore * weights.social,
    ),
  );

  const band = bandFor(overallScore, !!sanctions?.isSanctioned);

  const highRiskActivityScores = buildHighRiskActivityScores(adverseMedia);
  const adverseMediaScores = buildAdverseMediaScores(sanctions, adverseMedia);

  // Reasons that drove a non-clear band, for the recommendation text.
  const reasons = adverseMediaScores.filter((c) => c.present).map((c) => c.label);

  const summary = buildSummary(sanctions, adverseMedia);
  const recommendation = recommendationFor(band, reasons);

  // Union of all evidence sources, deduped by URL.
  const sourceMap = new Map<string, Source>();
  for (const s of adverseMedia?.sources ?? []) sourceMap.set(s.url, s);
  for (const m of sanctions?.matches ?? []) {
    if (m.match && m.sourceUrl) {
      sourceMap.set(m.sourceUrl, { url: m.sourceUrl, note: `OpenSanctions: ${m.caption}` });
    }
  }
  for (const p of social?.profiles ?? []) {
    if (p.url) sourceMap.set(p.url, { url: p.url, note: p.note ?? p.platform });
  }

  return {
    input,
    band,
    overallScore,
    weights,
    sanctions,
    adverseMedia,
    social,
    highRiskActivityScores,
    adverseMediaScores,
    summary,
    recommendation,
    sources: [...sourceMap.values()],
    generatedAt: args.generatedAt ?? new Date().toISOString(),
    durationMs,
  };
}
