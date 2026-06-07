// lib/agent/schema.ts
// Zod schema for the structured AdverseMediaResult (AI SDK generateObject).
// Mirrors the contract in lib/contracts/types.ts.

import { z } from 'zod';
import { HIGH_RISK_ACTIVITIES } from '@/lib/data/highRiskActivities';
import type { AdverseMediaResult } from '@/lib/contracts/types';

export const adverseMediaSchema = z.object({
  name: z.string(),
  badPress: z.boolean(),
  badPressLast5Years: z.boolean(),
  highRiskActivitiesFlag: z.boolean(),
  highRiskActivities: z.array(z.string()),
  summary: z.string(),
  sources: z.array(z.object({ url: z.string(), note: z.string().optional() })),
  timeline: z.array(z.object({ date: z.string(), event: z.string() })),
});

export type AdverseMediaObject = z.infer<typeof adverseMediaSchema>;

const VALID = new Set(HIGH_RISK_ACTIVITIES);

/**
 * Drop any highRiskActivities string that isn't an exact HIGH_RISK_ACTIVITIES
 * entry (the scoring engine keys off exact strings) and reconcile the flag.
 */
export function sanitizeAdverseMedia(obj: AdverseMediaObject): AdverseMediaResult {
  const highRiskActivities = (obj.highRiskActivities ?? []).filter((a) => VALID.has(a));
  return {
    ...obj,
    highRiskActivities,
    highRiskActivitiesFlag: highRiskActivities.length > 0 ? true : obj.highRiskActivitiesFlag,
  };
}
