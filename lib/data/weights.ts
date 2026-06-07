// lib/data/weights.ts
// All weighting + thresholds in one place so they're easy to tune live during the demo.

export const WEIGHTS = { sanctions: 0.6, adverseMedia: 0.3, social: 0.1 };

// Component sub-scores → 0..100, then weighted sum → overall.
export const SANCTIONS_POINTS = {
  sanctioned: 100, // any matched sanction topic
  pep: 70, // PEP but not sanctioned
  // otherwise graded by bestScore (see score.ts)
};

export const ADVERSE_POINTS = {
  badPressLast5Years: 100,
  badPressOlder: 60,
  highRiskActivity: 40, // per-presence contribution, capped
};

export const BANDS = {
  // overall 0..100 → band
  high: 60, // >= 60 → high
  review: 25, // >= 25 → review, else clear
};

// Per-category presence score for the explicit per-activity / per-signal breakdown.
export const CATEGORY_PRESENCE_SCORE = 80;
