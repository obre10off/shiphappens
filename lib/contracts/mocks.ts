// lib/contracts/mocks.ts
// Realistic fixtures so every part can build/test in isolation. These double as
// golden values for contract tests (DEV_PLAN.md §6, §8).

import type {
  AdverseMediaResult,
  RiskReport,
  SanctionsResult,
  ScreeningInput,
  SocialMediaResult,
} from './types';

export const mockInput: ScreeningInput = {
  name: 'Viktor Yanukovych',
  dateOfBirth: '1950-07-09',
  country: 'Ukraine',
  freeText: 'Former head of state; flagged during onboarding.',
  caseId: 'CASE-DEMO-001',
};

export const mockInputClear: ScreeningInput = {
  name: 'Maria Kovacheva',
  dateOfBirth: '1987-03-14',
  country: 'Bulgaria',
};

// ── Sanctions ────────────────────────────────────────────────────────────────
export const mockSanctionsResult: SanctionsResult = {
  matches: [
    {
      id: 'Q1090',
      caption: 'Viktor Yanukovych',
      schema: 'Person',
      score: 0.97,
      match: true,
      datasets: ['us_ofac_sdn', 'eu_fsf', 'un_sc_sanctions', 'gb_hmt_sanctions'],
      topics: ['sanction', 'role.pep', 'crime'],
      properties: {
        birthDate: ['1950-07-09'],
        country: ['ua'],
        position: ['President of Ukraine'],
      },
      sourceUrl: 'https://www.opensanctions.org/entities/Q1090/',
    },
  ],
  totalMatches: 1,
  bestScore: 0.97,
  isPep: true,
  isSanctioned: true,
  datasetsHit: ['us_ofac_sdn', 'eu_fsf', 'un_sc_sanctions', 'gb_hmt_sanctions'],
  scope: 'default',
};

export const mockSanctionsClear: SanctionsResult = {
  matches: [],
  totalMatches: 0,
  bestScore: 0,
  isPep: false,
  isSanctioned: false,
  datasetsHit: [],
  scope: 'default',
};

// ── Adverse media ────────────────────────────────────────────────────────────
export const mockAdverseMediaResult: AdverseMediaResult = {
  name: 'Viktor Yanukovych',
  badPress: true,
  badPressLast5Years: true,
  highRiskActivitiesFlag: true,
  highRiskActivities: [
    'Real estate (e.g. large-scale development, construction company ownership)',
    'Oil, gas and energy',
  ],
  summary:
    'Extensive adverse media linking the subject to large-scale embezzlement of state funds, ' +
    'corruption, and money laundering through offshore vehicles. Subject of an international ' +
    'arrest warrant. Coverage spans major outlets including Reuters, BBC and OCCRP, with ' +
    'reporting continuing into the last five years.',
  sources: [
    { url: 'https://www.reuters.com/example-yanukovych', note: 'Embezzlement coverage' },
    { url: 'https://www.bbc.com/news/example-yanukovych', note: 'Background and arrest warrant' },
    { url: 'https://www.occrp.org/example-yanukovych', note: 'Offshore money-laundering investigation' },
  ],
  timeline: [
    { date: '2010', event: 'Elected President of Ukraine.' },
    { date: '2014-02-22', event: 'Removed from office; fled the country.' },
    { date: '2019-01-24', event: 'Convicted in absentia of high treason.' },
  ],
};

export const mockAdverseClear: AdverseMediaResult = {
  name: 'Maria Kovacheva',
  badPress: false,
  badPressLast5Years: false,
  highRiskActivitiesFlag: false,
  highRiskActivities: [],
  summary: 'No adverse media was identified for the subject across the searched sources.',
  sources: [],
  timeline: [],
};

// ── Social (stretch) ─────────────────────────────────────────────────────────
export const mockSocialResult: SocialMediaResult = {
  profiles: [
    { platform: 'x.com', url: 'https://x.com/example', note: 'Verified-looking account' },
  ],
  flags: [],
  summary: 'A small public social footprint with no adverse signals.',
};

// ── Full report (HIGH) ───────────────────────────────────────────────────────
// Part 4 builds the entire dashboard off this. Kept consistent with scoreReport().
export const mockRiskReport: RiskReport = {
  input: mockInput,
  band: 'high',
  overallScore: 92,
  weights: { sanctions: 0.66, adverseMedia: 0.33, social: 0.01 },
  sanctions: mockSanctionsResult,
  adverseMedia: mockAdverseMediaResult,
  social: null,
  highRiskActivityScores: [
    {
      key: 'real-estate-e-g-large-scale-development-construction-company-ownership',
      label: 'Real estate (e.g. large-scale development, construction company ownership)',
      score: 80,
      present: true,
      evidence: ['https://www.occrp.org/example-yanukovych'],
    },
    {
      key: 'oil-gas-and-energy',
      label: 'Oil, gas and energy',
      score: 80,
      present: true,
      evidence: ['https://www.reuters.com/example-yanukovych'],
    },
  ],
  adverseMediaScores: [
    { key: 'sanctioned', label: 'On a sanctions list', score: 100, present: true, evidence: ['us_ofac_sdn', 'eu_fsf', 'un_sc_sanctions', 'gb_hmt_sanctions'] },
    { key: 'pep', label: 'Politically Exposed Person', score: 70, present: true, evidence: ['President of Ukraine'] },
    { key: 'bad_press', label: 'Adverse media (any time)', score: 60, present: true, evidence: [] },
    { key: 'bad_press_recent', label: 'Adverse media (last 5 years)', score: 100, present: true, evidence: [] },
    { key: 'high_risk_activity', label: 'High-risk activity involvement', score: 50, present: true, evidence: [] },
  ],
  summary: [
    '**Overview**',
    'Listed on OFAC, EU, UN and UK sanctions regimes and a confirmed Politically Exposed Person. Extensive, ongoing adverse media — the relationship is not advisable.',
    '',
    '**Key findings**',
    '- Active **sanctions designations** across four major regimes (OFAC, EU, UN, UK).',
    '- Confirmed **Politically Exposed Person** (former head of state).',
    '- Adverse media on **embezzlement, corruption and money laundering** [1], continuing into the last five years [2].',
    '- Subject of an **international arrest warrant** [2].',
    '',
    '**Risk drivers**',
    '- Offshore vehicles used to move state funds [3].',
  ].join('\n'),
  recommendation:
    'Decline the prospective relationship and escalate to compliance / the MLRO. Do not accept funds ' +
    'or proceed with the investment. Consider filing a Suspicious Activity Report (SAR) if a relationship ' +
    'or transaction was already initiated, and retain the full evidence trail.',
  sources: [
    ...mockAdverseMediaResult.sources,
    { url: 'https://www.opensanctions.org/entities/Q1090/', note: 'OpenSanctions entity' },
  ],
  generatedAt: '2026-06-07T12:00:00.000Z',
  durationMs: 6800,
};

export const mockRiskReportClear: RiskReport = {
  input: mockInputClear,
  band: 'clear',
  overallScore: 0,
  weights: { sanctions: 0.667, adverseMedia: 0.333, social: 0 },
  sanctions: mockSanctionsClear,
  adverseMedia: mockAdverseClear,
  social: null,
  highRiskActivityScores: [],
  adverseMediaScores: [
    { key: 'sanctioned', label: 'On a sanctions list', score: 0, present: false, evidence: [] },
    { key: 'pep', label: 'Politically Exposed Person', score: 0, present: false, evidence: [] },
    { key: 'bad_press', label: 'Adverse media (any time)', score: 0, present: false, evidence: [] },
    { key: 'bad_press_recent', label: 'Adverse media (last 5 years)', score: 0, present: false, evidence: [] },
    { key: 'high_risk_activity', label: 'High-risk activity involvement', score: 0, present: false, evidence: [] },
  ],
  summary: 'No adverse media was identified for the subject across the searched sources.',
  recommendation:
    'Cleared to proceed under standard due diligence. Document the file and schedule periodic re-screening every 12 months.',
  sources: [],
  generatedAt: '2026-06-07T12:00:00.000Z',
  durationMs: 7200,
};
