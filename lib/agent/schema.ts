// lib/agent/schema.ts
// Zod schema for the structured AdverseMediaResult (AI SDK generateObject).
// Mirrors the contract in lib/contracts/types.ts.

import { z } from 'zod';
import { HIGH_RISK_ACTIVITIES } from '@/lib/data/highRiskActivities';
import type { AdverseMediaResult, Source } from '@/lib/contracts/types';

export const adverseMediaSchema = z.object({
  name: z.string(),
  badPress: z.boolean(),
  badPressLast5Years: z.boolean(),
  highRiskActivitiesFlag: z.boolean(),
  highRiskActivities: z.array(z.string()),
  summary: z.string(),
  // The model cites search results by their 1-based [n] index, not by URL —
  // LLMs collapse/hallucinate long URLs. We resolve refs to real URLs below.
  sources: z.array(z.object({ ref: z.number().int(), note: z.string().optional() })),
  timeline: z.array(z.object({ date: z.string(), event: z.string() })),
});

export type AdverseMediaObject = z.infer<typeof adverseMediaSchema>;

const VALID = new Set(HIGH_RISK_ACTIVITIES);

/** Minimal shape of a search hit needed to resolve a source ref to a real URL. */
interface ResolvableHit {
  link: string;
  title?: string;
}

/**
 * Map the model's ref-based sources back to the exact deep URLs from the search
 * hits (1-based refs). Invalid/hallucinated refs are dropped; results are deduped
 * by URL. This guarantees every source links to a real article, not a root domain.
 */
function resolveSources(
  refs: AdverseMediaObject['sources'],
  hits: ResolvableHit[],
): Source[] {
  const byUrl = new Map<string, Source>();
  for (const { ref, note } of refs) {
    const hit = hits[ref - 1];
    if (!hit?.link) continue;
    if (!byUrl.has(hit.link)) byUrl.set(hit.link, { url: hit.link, note: note || hit.title });
  }
  return [...byUrl.values()];
}

/**
 * Drop any highRiskActivities string that isn't an exact HIGH_RISK_ACTIVITIES
 * entry (the scoring engine keys off exact strings), reconcile the flag, and
 * resolve ref-based sources to the real search-hit URLs.
 */
export function sanitizeAdverseMedia(
  obj: AdverseMediaObject,
  hits: ResolvableHit[] = [],
): AdverseMediaResult {
  const highRiskActivities = (obj.highRiskActivities ?? []).filter((a) => VALID.has(a));
  return {
    ...obj,
    highRiskActivities,
    highRiskActivitiesFlag: highRiskActivities.length > 0 ? true : obj.highRiskActivitiesFlag,
    sources: resolveSources(obj.sources ?? [], hits),
  };
}
