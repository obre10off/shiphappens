import { afterEach, describe, expect, it, vi } from 'vitest';
import { sanitizeAdverseMedia } from './schema';

// Mock the AI SDK so generateText resolves WITHOUT calling any tool — this exercises
// the agent's deterministic fallback path (the most important guarantee).
vi.mock('ai', async (importActual) => {
  const actual = await importActual<typeof import('ai')>();
  return { ...actual, generateText: vi.fn().mockResolvedValue({ text: 'ok', steps: [] }) };
});

// Mock the underlying signal functions so we don't hit the network.
vi.mock('@/lib/sanctions/match', () => ({
  searchSanctions: vi.fn().mockResolvedValue({
    matches: [], totalMatches: 1, bestScore: 0.95, isPep: true, isSanctioned: true,
    datasetsHit: ['us_ofac_sdn'], scope: 'default',
  }),
}));
vi.mock('@/lib/google/tool', () => ({
  analyzeAdverseMedia: vi.fn().mockResolvedValue({
    name: 'X', badPress: true, badPressLast5Years: true, highRiskActivitiesFlag: false,
    highRiskActivities: [], summary: 'bad', sources: [{ url: 'https://e.com' }], timeline: [],
  }),
}));

import { runScreening } from './agent';
import type { ScreenEvent } from '@/lib/contracts/types';

afterEach(() => vi.clearAllMocks());

describe('sanitizeAdverseMedia', () => {
  it('drops highRiskActivities strings not in the canonical list', () => {
    const out = sanitizeAdverseMedia({
      name: 'X', badPress: true, badPressLast5Years: false, highRiskActivitiesFlag: true,
      highRiskActivities: ['Gambling', 'Not A Real Category'],
      summary: '', sources: [], timeline: [],
    });
    expect(out.highRiskActivities).toEqual(['Gambling']);
    expect(out.highRiskActivitiesFlag).toBe(true);
  });

  it('keeps the flag false when nothing valid remains', () => {
    const out = sanitizeAdverseMedia({
      name: 'X', badPress: false, badPressLast5Years: false, highRiskActivitiesFlag: false,
      highRiskActivities: ['bogus'], summary: '', sources: [], timeline: [],
    });
    expect(out.highRiskActivities).toEqual([]);
    expect(out.highRiskActivitiesFlag).toBe(false);
  });
});

describe('runScreening', () => {
  it('produces both signals and emits phases in order sanctions → adverse_media', async () => {
    const events: ScreenEvent[] = [];
    const bundle = await runScreening(
      { name: 'Viktor Yanukovych', country: 'Ukraine' },
      (e) => events.push(e),
    );

    expect(bundle.sanctions?.isSanctioned).toBe(true);
    expect(bundle.adverseMedia?.badPress).toBe(true);

    const phases = events
      .filter((e): e is Extract<ScreenEvent, { type: 'phase' }> => e.type === 'phase')
      .map((e) => `${e.phase}:${e.status}`);
    expect(phases).toEqual([
      'sanctions:start',
      'sanctions:done',
      'adverse_media:start',
      'adverse_media:done',
    ]);
  });
});
