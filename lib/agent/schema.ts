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
 * Build the final ordered source list and rewrite the summary's inline citations.
 *
 * The model cites SEARCH RESULTS by their 1-based hit index — both in the
 * `sources[]` array and inline in the summary as `[n]`. We:
 *   1. resolve `sources[]` refs to real URLs (in order, deduped),
 *   2. append any hit cited inline in the summary that wasn't already listed,
 *   3. rewrite each `[n]` in the summary from the hit index to that source's
 *      1-based position in the final list (so `[2]` always points at source #2),
 *      dropping citations to invalid/hallucinated hits.
 */
function resolveSourcesAndCitations(
  refs: AdverseMediaObject['sources'],
  summary: string,
  hits: ResolvableHit[],
): { sources: Source[]; summary: string } {
  const sources: Source[] = [];
  const posByHit = new Map<number, number>(); // hit index (1-based) → source position
  const posByUrl = new Map<string, number>();

  const add = (hitIndex: number, note?: string) => {
    const hit = hits[hitIndex - 1];
    if (!hit?.link) return;
    const existing = posByUrl.get(hit.link);
    if (existing) {
      posByHit.set(hitIndex, existing);
      return;
    }
    sources.push({ url: hit.link, note: note || hit.title });
    const pos = sources.length;
    posByUrl.set(hit.link, pos);
    posByHit.set(hitIndex, pos);
  };

  for (const { ref, note } of refs ?? []) add(ref, note);
  for (const m of summary.matchAll(/\[(\d+)\]/g)) add(Number(m[1]));

  const rewritten = summary
    .replace(/\[(\d+)\]/g, (_full, d: string) => {
      const pos = posByHit.get(Number(d));
      return pos ? `[${pos}]` : '';
    })
    .replace(/[ \t]+([.,;:)])/g, '$1') // tidy space left before punctuation by a dropped citation
    .replace(/[ \t]{2,}/g, ' ');

  return { sources, summary: rewritten };
}

/**
 * Drop any highRiskActivities string that isn't an exact HIGH_RISK_ACTIVITIES
 * entry (the scoring engine keys off exact strings), reconcile the flag, and
 * resolve ref-based sources to real URLs while renumbering the summary's
 * inline `[n]` citations to match the final source list.
 */
export function sanitizeAdverseMedia(
  obj: AdverseMediaObject,
  hits: ResolvableHit[] = [],
): AdverseMediaResult {
  const highRiskActivities = (obj.highRiskActivities ?? []).filter((a) => VALID.has(a));
  const { sources, summary } = resolveSourcesAndCitations(obj.sources ?? [], obj.summary ?? '', hits);
  return {
    ...obj,
    summary,
    highRiskActivities,
    highRiskActivitiesFlag: highRiskActivities.length > 0 ? true : obj.highRiskActivitiesFlag,
    sources,
  };
}
