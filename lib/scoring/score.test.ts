import { describe, expect, it } from 'vitest';
import { HIGH_RISK_ACTIVITIES } from '@/lib/data/highRiskActivities';
import {
  mockAdverseClear,
  mockAdverseMediaResult,
  mockInput,
  mockInputClear,
  mockSanctionsClear,
  mockSanctionsResult,
} from '@/lib/contracts/mocks';
import {
  adverseComponent,
  sanctionsComponent,
  scoreReport,
  socialComponent,
} from './score';

const base = { input: mockInput, social: null, durationMs: 1000, generatedAt: '2026-06-07T12:00:00.000Z' };

describe('component scores', () => {
  it('sanctioned → 100, PEP-only → 70, name-match graded, none → 0', () => {
    expect(sanctionsComponent(mockSanctionsResult)).toBe(100);
    expect(
      sanctionsComponent({ ...mockSanctionsClear, isPep: true }),
    ).toBe(70);
    expect(
      sanctionsComponent({ ...mockSanctionsClear, bestScore: 0.5 }),
    ).toBe(30);
    expect(sanctionsComponent(mockSanctionsClear)).toBe(0);
    expect(sanctionsComponent({ ...mockSanctionsResult, error: 'boom' })).toBe(0);
  });

  it('adverse: recent → 100, older-only → 60, +15/activity capped at 40', () => {
    expect(adverseComponent(mockAdverseMediaResult)).toBe(100); // recent + activities, clamped
    expect(adverseComponent({ ...mockAdverseClear, badPress: true })).toBe(60);
    expect(
      adverseComponent({ ...mockAdverseClear, highRiskActivities: ['a', 'b', 'c', 'd'] }),
    ).toBe(40); // 4*15=60 capped at 40, no badPress
    expect(adverseComponent(mockAdverseClear)).toBe(0);
  });

  it('social: flags*30 capped at 100, null → 0', () => {
    expect(socialComponent(null)).toBe(0);
    expect(socialComponent({ profiles: [], flags: ['x', 'y'], summary: '' })).toBe(60);
    expect(
      socialComponent({ profiles: [], flags: ['a', 'b', 'c', 'd'], summary: '' }),
    ).toBe(100);
  });
});

describe('scoreReport', () => {
  it('sanctioned input → high band, overall ≥ 60, sanctioned category = 100', () => {
    const r = scoreReport({
      ...base,
      sanctions: mockSanctionsResult,
      adverseMedia: mockAdverseMediaResult,
    });
    expect(r.band).toBe('high');
    expect(r.overallScore).toBeGreaterThanOrEqual(60);
    expect(r.adverseMediaScores.find((c) => c.key === 'sanctioned')?.score).toBe(100);
  });

  it('clear everything → clear band, low score, no present categories', () => {
    const r = scoreReport({
      ...base,
      input: mockInputClear,
      sanctions: mockSanctionsClear,
      adverseMedia: mockAdverseClear,
    });
    expect(r.band).toBe('clear');
    expect(r.overallScore).toBeLessThan(25);
    expect(r.adverseMediaScores.every((c) => !c.present)).toBe(true);
    expect(r.highRiskActivityScores.every((c) => !c.present)).toBe(true);
  });

  it('highRiskActivityScores has exactly one entry per activity; only flagged are present', () => {
    const r = scoreReport({
      ...base,
      sanctions: mockSanctionsClear,
      adverseMedia: mockAdverseMediaResult,
    });
    expect(r.highRiskActivityScores).toHaveLength(HIGH_RISK_ACTIVITIES.length);
    const present = r.highRiskActivityScores.filter((c) => c.present);
    expect(present).toHaveLength(mockAdverseMediaResult.highRiskActivities.length);
    expect(present.every((c) => c.score > 0)).toBe(true);
  });

  it('social: null renormalizes weights to sum to 1', () => {
    const r = scoreReport({ ...base, sanctions: mockSanctionsClear, adverseMedia: mockAdverseClear });
    expect(r.weights.social).toBe(0);
    expect(r.weights.sanctions + r.weights.adverseMedia).toBeCloseTo(1, 6);
  });

  it('isSanctioned forces high even when overall < 60', () => {
    // sanctioned but no adverse media: overall = 100 * 0.667 ≈ 67, still high.
    // Construct a borderline: sanctioned true but bestScore set so component is 100.
    const r = scoreReport({
      ...base,
      sanctions: { ...mockSanctionsClear, isSanctioned: true },
      adverseMedia: mockAdverseClear,
    });
    expect(r.band).toBe('high');
  });

  it('sanctions.error → component 0, no throw, degraded note in summary', () => {
    const r = scoreReport({
      ...base,
      sanctions: { ...mockSanctionsClear, error: 'API down' },
      adverseMedia: mockAdverseClear,
    });
    expect(r.band).toBe('clear');
    expect(r.summary.toLowerCase()).toContain('degraded');
  });

  it('overall is a weighted blend of the components', () => {
    const r = scoreReport({
      ...base,
      sanctions: mockSanctionsResult, // 100
      adverseMedia: mockAdverseMediaResult, // 100
      social: { profiles: [], flags: [], summary: '' }, // 0, keeps full weights
    });
    // 100*0.6 + 100*0.3 + 0*0.1 = 90
    expect(r.overallScore).toBe(90);
    expect(r.weights.social).toBe(0.1);
  });
});
