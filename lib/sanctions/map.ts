// lib/sanctions/map.ts
// Raw OpenSanctions /match response → SanctionsMatch / SanctionsResult.

import type { SanctionsMatch, SanctionsResult } from '@/lib/contracts/types';

export interface RawEntity {
  id: string;
  caption?: string;
  schema?: string;
  score?: number;
  match?: boolean;
  datasets?: string[];
  topics?: string[];
  properties?: Record<string, string[]>;
}

const startsWithAny = (topics: string[], prefix: string) =>
  topics.some((t) => t === prefix || t.startsWith(prefix));

export function mapEntity(raw: RawEntity): SanctionsMatch {
  // The /match endpoint returns an empty top-level `topics`; the real classification
  // (sanction, role.pep, …) lives under properties.topics. Prefer whichever is populated.
  const topics =
    raw.topics && raw.topics.length ? raw.topics : (raw.properties?.topics ?? []);

  return {
    id: raw.id,
    caption: raw.caption ?? raw.id,
    schema: raw.schema ?? 'Thing',
    score: raw.score ?? 0,
    match: !!raw.match,
    datasets: raw.datasets ?? [],
    topics,
    properties: raw.properties ?? {},
    sourceUrl: `https://www.opensanctions.org/entities/${raw.id}/`,
  };
}

/**
 * Aggregate mapped matches into a SanctionsResult. Only `match === true` results
 * count toward isPep / isSanctioned / totalMatches / datasetsHit; near-misses are
 * kept in `matches` with match=false.
 */
export function aggregate(matches: SanctionsMatch[], scope: string): SanctionsResult {
  const matched = matches.filter((m) => m.match);

  const isSanctioned = matched.some((m) => startsWithAny(m.topics, 'sanction'));
  const isPep = matched.some((m) => startsWithAny(m.topics, 'role.pep'));
  const bestScore = matches.reduce((max, m) => Math.max(max, m.score), 0);

  const datasetsHit = [...new Set(matched.flatMap((m) => m.datasets))];

  return {
    matches,
    totalMatches: matched.length,
    bestScore,
    isPep,
    isSanctioned,
    datasetsHit,
    scope,
  };
}
