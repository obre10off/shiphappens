// lib/scoring/categories.ts
// Per-category score builders: one entry per high-risk activity, and a fixed set
// of adverse-media signals. See part-3-scoring-and-report.md §5.

import { HIGH_RISK_ACTIVITIES } from '@/lib/data/highRiskActivities';
import { CATEGORY_PRESENCE_SCORE } from '@/lib/data/weights';
import { isEnrichmentDataset, isSanctionsDataset } from '@/lib/data/datasets';
import type {
  AdverseMediaResult,
  CategoryScore,
  EuSanctionsResult,
  SanctionsResult,
} from '@/lib/contracts/types';

const uniq = (xs: string[]) => [...new Set(xs.filter(Boolean))];

/** Human-meaningful PEP context: the public positions held (e.g. "Prime Minister of Bulgaria"). */
function pepPositions(sanctions: SanctionsResult | null): string[] {
  const matched = (sanctions?.matches ?? []).filter((m) => m.match);
  const positions = uniq(matched.flatMap((m) => m.properties?.position ?? [])).slice(0, 4);
  return positions.length ? positions : ['Senior public / political figure (PEP)'];
}

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

  return HIGH_RISK_ACTIVITIES.map((activity) => {
    const present = flagged.has(activity);
    return {
      key: slug(activity),
      label: activity,
      present,
      score: present ? CATEGORY_PRESENCE_SCORE : 0,
      // Supporting articles are cited inline in the summary + listed in Sources,
      // so we don't repeat the full URL list on every activity row.
      evidence: [],
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
  euSanctions: EuSanctionsResult | null = null,
): CategoryScore[] {
  const datasets = sanctions?.datasetsHit ?? [];
  // The sanctions row shows only real enforcement lists; PEP/enrichment codes
  // (wikidata, everypolitician, …) are filtered out so the tags stay meaningful.
  const sanctionLists = uniq(datasets.filter(isSanctionsDataset).filter((d) => !isEnrichmentDataset(d)));

  const euListed = !!euSanctions?.isListed && !euSanctions.error;
  const sanctioned = !!sanctions?.isSanctioned || euListed;
  // Prefer the OpenSanctions enforcement-list codes; fall back to the EU regime
  // label when only the EU Sanctions Tracker corroborated the listing.
  const euEvidence = euListed && euSanctions?.matches[0]
    ? [`EU Sanctions Tracker — ${euSanctions.matches[0].regime} regime`]
    : [];
  const sanctionedEvidence = sanctionLists.length ? sanctionLists : euEvidence;

  return [
    {
      key: 'sanctioned',
      label: 'On a sanctions list',
      present: sanctioned,
      score: sanctioned ? 100 : 0,
      evidence: sanctioned ? sanctionedEvidence : [],
    },
    {
      key: 'pep',
      label: 'Politically Exposed Person',
      present: !!sanctions?.isPep,
      score: sanctions?.isPep ? 70 : 0,
      // Show the actual public positions held — far more meaningful than dataset codes.
      evidence: sanctions?.isPep ? pepPositions(sanctions) : [],
    },
    {
      key: 'bad_press',
      label: 'Adverse media (any time)',
      present: !!adverseMedia?.badPress,
      score: adverseMedia?.badPress ? 60 : 0,
      evidence: [],
    },
    {
      key: 'bad_press_recent',
      label: 'Adverse media (last 5 years)',
      present: !!adverseMedia?.badPressLast5Years,
      score: adverseMedia?.badPressLast5Years ? 100 : 0,
      evidence: [],
    },
    {
      key: 'high_risk_activity',
      label: 'High-risk activity involvement',
      present: !!adverseMedia?.highRiskActivitiesFlag,
      score: adverseMedia?.highRiskActivitiesFlag ? 50 : 0,
      evidence: [],
    },
  ];
}
