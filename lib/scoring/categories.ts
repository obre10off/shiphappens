// lib/scoring/categories.ts
// Per-category score builders: one entry per high-risk activity, and a fixed set
// of adverse-media signals. See part-3-scoring-and-report.md §5.

import { HIGH_RISK_ACTIVITIES } from '@/lib/data/highRiskActivities';
import { CATEGORY_PRESENCE_SCORE } from '@/lib/data/weights';
import type {
  AdverseMediaResult,
  CategoryScore,
  SanctionsResult,
} from '@/lib/contracts/types';

/** Stable, url-safe id from a human label. */
export function slug(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * One CategoryScore per string in HIGH_RISK_ACTIVITIES (always 28 entries).
 * Present ones (flagged by the adverse-media LLM) score CATEGORY_PRESENCE_SCORE,
 * absent ones score 0. Evidence is the adverse-media source URLs.
 */
export function buildHighRiskActivityScores(
  adverseMedia: AdverseMediaResult | null,
): CategoryScore[] {
  const flagged = new Set(adverseMedia?.highRiskActivities ?? []);
  const evidence = (adverseMedia?.sources ?? []).map((s) => s.url).filter(Boolean);

  return HIGH_RISK_ACTIVITIES.map((activity) => {
    const present = flagged.has(activity);
    return {
      key: slug(activity),
      label: activity,
      present,
      score: present ? CATEGORY_PRESENCE_SCORE : 0,
      evidence: present ? evidence : [],
    };
  });
}

/**
 * A fixed set of adverse-media signals, each 0..100. These mirror the four
 * weighted inputs the demo cares about plus high-risk involvement.
 */
export function buildAdverseMediaScores(
  sanctions: SanctionsResult | null,
  adverseMedia: AdverseMediaResult | null,
): CategoryScore[] {
  const sourceUrls = (adverseMedia?.sources ?? []).map((s) => s.url).filter(Boolean);
  const datasets = sanctions?.datasetsHit ?? [];

  return [
    {
      key: 'sanctioned',
      label: 'On a sanctions list',
      present: !!sanctions?.isSanctioned,
      score: sanctions?.isSanctioned ? 100 : 0,
      evidence: sanctions?.isSanctioned ? datasets : [],
    },
    {
      key: 'pep',
      label: 'Politically Exposed Person',
      present: !!sanctions?.isPep,
      score: sanctions?.isPep ? 70 : 0,
      evidence: sanctions?.isPep ? datasets : [],
    },
    {
      key: 'bad_press',
      label: 'Adverse media (any time)',
      present: !!adverseMedia?.badPress,
      score: adverseMedia?.badPress ? 60 : 0,
      evidence: adverseMedia?.badPress ? sourceUrls : [],
    },
    {
      key: 'bad_press_recent',
      label: 'Adverse media (last 5 years)',
      present: !!adverseMedia?.badPressLast5Years,
      score: adverseMedia?.badPressLast5Years ? 100 : 0,
      evidence: adverseMedia?.badPressLast5Years ? sourceUrls : [],
    },
    {
      key: 'high_risk_activity',
      label: 'High-risk activity involvement',
      present: !!adverseMedia?.highRiskActivitiesFlag,
      score: adverseMedia?.highRiskActivitiesFlag ? 50 : 0,
      evidence: adverseMedia?.highRiskActivitiesFlag ? sourceUrls : [],
    },
  ];
}
