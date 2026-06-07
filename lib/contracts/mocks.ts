// lib/contracts/mocks.ts
// Realistic fixtures so every part can build/test in isolation. These double as
// golden values for contract tests (DEV_PLAN.md §6, §8).

import type {
  AdverseMediaResult,
  EuSanctionsResult,
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

// ── EU Sanctions Tracker ─────────────────────────────────────────────────────
export const mockEuSanctionsResult: EuSanctionsResult = {
  matches: [
    {
      id: '14098',
      name: 'Viktor Fedorovych YANUKOVYCH',
      matchedName: 'Viktor Fedorovych YANUKOVYCH',
      aliases: ['Viktor Yanukovych'],
      score: 0.97,
      regime: 'UKRAINE',
      reference: '2014/119/CFSP (OJ L66)',
      types: 'F',
      dob: '1950-07-09',
      sourceUrl: 'https://data.europa.eu/apps/eusanctionstracker/subjects/14098',
    },
  ],
  totalMatches: 1,
  bestScore: 0.97,
  isListed: true,
  source: 'EU Sanctions Tracker (data.europa.eu) — consolidated EU financial sanctions + travel bans',
  snapshotDate: '2026-06-07T10:00:59.944+00:00',
};

export const mockEuSanctionsClear: EuSanctionsResult = {
  matches: [],
  totalMatches: 0,
  bestScore: 0,
  isListed: false,
  source: 'EU Sanctions Tracker (data.europa.eu) — consolidated EU financial sanctions + travel bans',
  snapshotDate: '2026-06-07T10:00:59.944+00:00',
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
    { date: '2002', event: 'Appointed Prime Minister of Ukraine.' },
    { date: '2004', event: 'Disputed presidential run triggers the Orange Revolution.' },
    { date: '2010', event: 'Elected President of Ukraine.' },
    { date: '2014-02-22', event: 'Removed from office; fled the country.' },
    { date: '2017', event: 'EU and US asset freezes remain in force.' },
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
  euSanctions: mockEuSanctionsResult,
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
    {
      url: 'https://data.europa.eu/apps/eusanctionstracker/subjects/14098',
      note: 'EU Sanctions Tracker: Viktor Fedorovych YANUKOVYCH',
    },
  ],
  generatedAt: '2026-06-07T12:00:00.000Z',
  durationMs: 6800,
};

// ── Review-band fixture (Oleg Nevzorov) ──────────────────────────────────────
// Captured from a real run; drives the `?mock=1` demo for a "review" verdict.
export const mockInputReview: ScreeningInput = {
  name: 'Oleg Nevzorov',
  country: 'Bulgaria',
};

export const mockSanctionsReview: SanctionsResult = {
  matches: [],
  totalMatches: 0,
  bestScore: 0,
  isPep: false,
  isSanctioned: false,
  datasetsHit: [],
  scope: 'default',
};

export const mockEuSanctionsReview: EuSanctionsResult = {
  matches: [],
  totalMatches: 0,
  bestScore: 0,
  isListed: false,
  source: 'EU Sanctions Tracker (data.europa.eu) — consolidated EU financial sanctions + travel bans',
  snapshotDate: '2026-06-07T10:00:59.944+00:00',
};

const NEVZOROV_SUMMARY = [
  '**Overview**',
  '',
  "Oleg Nevzorov is a Ukrainian national from Odesa, founder and head of KYB Corporation (also referred to as KUB/Cube Corporation), active in large-scale real estate development in Bulgaria and Ukraine. He is the central figure in what Bulgarian authorities have described as the country's biggest scandal of the year: the alleged illegal construction of 104 buildings in the protected Baba Alino locality near Varna.",
  '',
  '**Key Findings**',
  '',
  '- **Illegal construction / "Illegal City"**: In late May 2026, Bulgarian authorities exposed a complex of 104 structures built without permits on approximately 10 hectares inside a Natura 2000 forest zone near Golden Sands, Varna. The project was marketed as "Forest Club" and sold to Ukrainian and Bulgarian buyers [1][3].',
  '',
  '- **29 detentions**: During investigative operations on 28 May 2026, 29 Ukrainian and Moldovan nationals were detained in connection with the Baba Alino complex [2][4].',
  '',
  '- **Money laundering and organised crime probe**: Bulgaria\'s Interior Minister Ivan Demerdzhiev confirmed that the General Directorate for Combating Organized Crime (GDBOP) is investigating the case alongside economic police, with data pointing to money laundering. The minister described the construction as "only the tip of the iceberg" [3][8][12].',
  '',
  '- **Intelligence investigation**: Bulgarian intelligence (DANS) was reportedly investigating Nevzorov for money laundering, connections to Russian intelligence services, and allegations of human trafficking and drug trafficking, according to court documents [1].',
  '',
  "- **Russian shadow fleet / money laundering**: BNT sources alleged money laundering linked to proceeds from illicit trade conducted through Russia's so-called shadow fleet [7].",
  '',
  '- **Deportation order reversed**: DANS head Denyo Denev signed a deportation order and ten-year entry ban against Nevzorov on 3 July 2025; the order was unexpectedly revoked on 17 July 2025, reportedly following intervention by Ukraine\'s ambassador Olesya Ilashchuk and, according to some Bulgarian media, at the request of GERB leader Boyko Borisov [4][7][13].',
  '',
  '- **Political protection allegations**: Bulgarian authorities are investigating whether the reversal of the deportation order was made at the political level, and whether municipal and state officials facilitated illegal construction activities [8][9][13].',
  '',
  '- **Fled Bulgaria**: After searches on 28 May 2026, Nevzorov disappeared from Varna. He reportedly crossed into Romania via a northern Bulgarian border crossing and then travelled to Turkey. MP Boyko Rashkov stated Nevzorov may be evading military mobilisation in Ukraine [3][11].',
  '',
  '- **Ukrainian criminal history**: Multiple criminal cases have been filed against Nevzorov in Ukraine, including charges of falsifying financial statements and documents to obtain bank loans illegally, alleged tax evasion of approximately 23 million hryvnias, asset freezes dating to 2018, and allegations of double-selling apartments in Odesa construction projects [1][5][6].',
  '',
  '- **Illegal firearms**: An investigation is underway in Ukraine for alleged illegal possession of firearms [5][6].',
  '',
  "- **Political connections in Ukraine**: Nevzorov is accused of close ties to Gennady Trukhanov, long-time mayor of Odesa, whose political circle allegedly provided institutional protection for KYB Corporation's large-scale projects despite ongoing criminal cases [5][6].",
  '',
  '- **Pro-Russian political financing**: Nevzorov allegedly financially supported a pro-Russian Ukrainian political party in 2020 [10].',
  '',
  '- **Father implicated**: His father Vladimir Nevzorov is also under investigation in Ukraine for document fraud and embezzlement through fake bank loans [5][6].',
  '',
  '**Risk Drivers**',
  '',
  '- Active investigations in both Bulgaria and Ukraine across multiple serious offences (money laundering, fraud, illegal construction, possible organised crime links).',
  '- Alleged political protection at high levels in Bulgaria and Ukraine, including possible foreign diplomatic interference.',
  '- Subject of DANS deportation order (subsequently reversed under disputed circumstances).',
  '- Currently a fugitive: located outside Bulgaria (Turkey) and evading authorities.',
  '- Connections alleged to Russian intelligence services and Russia-linked financial networks.',
].join('\n');

export const mockAdverseMediaReview: AdverseMediaResult = {
  name: 'Oleg Nevzorov',
  badPress: true,
  badPressLast5Years: true,
  highRiskActivitiesFlag: true,
  highRiskActivities: ['Hospitality and leisure sector'],
  summary: NEVZOROV_SUMMARY,
  sources: [
    {
      url: 'https://www.novinite.com/articles/238829/The+Ukrainian+Investor%2C+the+Illegal+City%2C+and+the+Political+Cover%3A+Bulgaria%27s+Biggest+Scandal+of+the+Year',
      note: 'Background on Nevzorov, KYB Corporation, illegal construction, Bulgarian intelligence investigation, and Ukrainian adverse history',
    },
    {
      url: 'https://antikor.info/en/articles/841818-delo_baba_alino_v_bolgarii_zaderhali_29_ukraintsev_i_moldavan_iz-za_nezakonnogo_megaproekta_moshennika_olega_nevzorova',
      note: 'Baba Alino case: 29 detentions, overview of Nevzorov\'s legal troubles in Bulgaria',
    },
    {
      url: 'https://www.novinite.com/articles/238882/Baba+Alino+Update%3A+Nevzorov+in+Turkey%2C+Money+Laundering+Probe+Widens%2C+KYB+Pushes+Back',
      note: 'Nevzorov located in Turkey; money laundering probe widened; GDBOP involvement confirmed; deportation order background',
    },
    {
      url: 'https://rozsliduvach.info/news/254084-the_baba_alino_syndicate_how_odesa_developer_oleh_nevzorov_illegally_built_104_houses_in_bulgaria_and_fled_in_a_vehicle_linked_to_the_ukrainian_embajay/print',
      note: 'Details on deportation order signed July 2025, reversal on 17 July 2025, Ukrainian ambassador intervention, vehicle seen at Ukrainian embassy',
    },
    {
      url: 'https://fakti.bg/en/amp/razsledvania/1058153-a-long-time-mayor-of-odessa-and-a-gas-monopolist-were-among-the-patrons-of-the-kub-group',
      note: 'Ukrainian criminal cases: falsified financial documents, bank loan fraud, firearms, political connections to Trukhanov and Odessagaz',
    },
    {
      url: 'https://fakti.bg/en/razsledvania/1058153-a-long-time-mayor-of-odessa-and-a-gas-monopolist-were-among-the-patrons-of-the-kub-group',
      note: 'KYB/KUB Corporation criminal background in Ukraine, father Vladimir Nevzorov also under investigation',
    },
    {
      url: 'https://bntnews.bg/news/the-alleged-illegal-town-near-varna-who-is-oleg-nevzorov-and-what-is-known-about-his-business-interests-1396228news.html',
      note: 'Deportation order dates (3 July and 17 July 2025); money laundering linked to Russian shadow fleet',
    },
    {
      url: 'https://bntnews.bg/news/minister-of-interior-authorities-have-information-on-oleg-nevzorov%E2%80%99s-movements-1397034news.html',
      note: 'Interior Minister Demerdzhiev: GDBOP involvement, political interference indications, thousands of documents seized',
    },
    {
      url: 'https://fakti.bg/en/bulgaria/1059164-ivan-demerdjiev-ukrainskiat-poslanik-u-nas-se-e-namesil-v-sluchaa-s-oleg-nevzorov',
      note: 'Interior Minister confirms Ukrainian ambassador intervention; investigation into political and municipal connections',
    },
    {
      url: 'https://www.bta.bg/en/news/bulgaria/1139346-media-review-june-3',
      note: 'Nevzorov allegedly financed pro-Russian Ukrainian political party in 2020; BNT security sources on Russian-linked money laundering',
    },
    {
      url: 'https://www.bta.bg/en/news/bulgaria/1139372-owner-of-ukrainian-corporation-kyb-currently-in-turkiye-mp-rashkov-says',
      note: 'MP Rashkov confirms Nevzorov in Turkey, likely evading military mobilisation',
    },
    {
      url: 'https://bnrnews.bg/en/post/484168/nationwide-checks-launched-into-illegal-construction-projects',
      note: 'Nationwide inspections launched; Interior Ministry searching for Nevzorov; political interference and money laundering indications',
    },
    {
      url: 'https://fakti.bg/en/razsledvania/1057789-ukrainian-media-construction-scandal-in-varna-may-escalate-into-political-confrontation-between-sofia-and-kiev',
      note: 'Ukrainian media: deportation reversal allegedly linked to GERB leader Borisov; ambassador described as hidden accomplice',
    },
    {
      url: 'https://eualive.net/did-the-bulgarian-authorities-allow-an-illegal-town-to-rise-near-varna',
      note: 'Three documents giving Nevzorov carte blanche for construction; DANS persona non grata order and reversal',
    },
  ],
  timeline: [
    { date: '2018', event: 'Asset freezes against Oleg Nevzorov initiated in Ukraine, linked to alleged financial fraud and property schemes in Odesa.' },
    { date: '2020', event: 'Nevzorov reportedly financially supported a pro-Russian Ukrainian political party.' },
    { date: '2021', event: 'Nevzorov included in list of most influential Odesa residents by Odesa Media rating (also listed in 2020).' },
    { date: '2022-02', event: 'Russia invades Ukraine; Nevzorov relocates to Bulgaria weeks later and registers multiple companies under the KYB Corporation brand in Varna.' },
    { date: '2023', event: 'Bulgarian authorities first receive signals about possible illegal construction at Baba Alino near Varna; project reportedly continues expanding despite signals.' },
    { date: '2025-07-03', event: 'DANS acting head Denyo Denev signs order deporting Nevzorov from Bulgaria and banning him from entry for ten years.' },
    { date: '2025-07-17', event: "Deportation order unexpectedly revoked by Denev, reportedly following intervention by Ukraine's ambassador Olesya Ilashchuk and allegedly at the request of GERB leader Boyko Borisov." },
    { date: '2026-05-28', event: 'Bulgarian authorities conduct mass searches of all KYB/Baba Alino premises; 29 Ukrainian and Moldovan nationals detained. Nevzorov disappears from Varna.' },
    { date: '2026-05', event: "Interior Minister Demerdzhiev confirms GDBOP is investigating the case for money laundering and organised crime; describes construction as 'only the tip of the iceberg'." },
    { date: '2026-06', event: 'MP Boyko Rashkov states Nevzorov is in Turkey, having crossed into Romania via a northern Bulgarian border checkpoint; Nevzorov reportedly evading Ukrainian military mobilisation. Interior Minister confirms authorities have information on his movements.' },
  ],
};

const NEVZOROV_HIGH_RISK_KEYS: { key: string; label: string }[] = [
  { key: 'mining-and-mineral-extraction-e-g-diamonds-precious-metals', label: 'Mining and mineral extraction (e.g. diamonds, precious metals)' },
  { key: 'oil-gas-and-energy', label: 'Oil, gas and energy' },
  { key: 'weapons-and-dual-use-goods', label: 'Weapons and dual-use goods' },
  { key: 'trading-in-valuable-goods-art-antiques-coinage-jewelry-yachts-planes-fur-industry-textile-clothing-leather-shoe-industry-livestock', label: 'Trading in valuable goods (art, antiques, coinage, jewelry, yachts, planes, fur industry, textile, clothing, leather, shoe industry, livestock)' },
  { key: 'crypto-products-non-fungible-tokens-nfts-or-other-products-with-unusual-complexity', label: 'Crypto products, non-fungible tokens (NFTs) or other products with unusual complexity' },
  { key: 'crowdfunding', label: 'Crowdfunding' },
  { key: 'gambling', label: 'Gambling' },
  { key: 'real-estate-e-g-large-scale-development-construction-company-ownership', label: 'Real estate (e.g. large-scale development, construction company ownership)' },
  { key: 'coffeeshops-and-growshops', label: 'Coffeeshops and growshops' },
  { key: 'professional-sports', label: 'Professional sports' },
  { key: 'charities-and-religious-institutions', label: 'Charities and religious institutions' },
  { key: 'transport-and-shipping', label: 'Transport and shipping' },
  { key: 'advisory-and-consultancy-services-when-underlying-activity-is-high-risk', label: 'Advisory and consultancy services (when underlying activity is high-risk)' },
  { key: 'private-banking', label: 'Private banking' },
  { key: 'intellectual-property-patents-and-royalties', label: 'Intellectual property, patents and royalties' },
  { key: 'cash-intensive-sectors', label: 'Cash-intensive sectors' },
  { key: 'scrap-trade-and-car-dealers', label: 'Scrap-trade and car dealers' },
  { key: 'online-shops', label: 'Online shops' },
  { key: 'telecommunications', label: 'Telecommunications' },
  { key: 'hospitality-and-leisure-sector', label: 'Hospitality and leisure sector' },
  { key: 'waste-processing-and-hazardous-substances', label: 'Waste processing and hazardous substances' },
  { key: 'forestry', label: 'Forestry' },
  { key: 'electronics', label: 'Electronics' },
  { key: 'employment-agencies', label: 'Employment agencies' },
  { key: 'tobacco-and-tobacco-related-products', label: 'Tobacco and tobacco-related products' },
  { key: 'pharmaceuticals', label: 'Pharmaceuticals' },
  { key: 'genetic-manipulation', label: 'Genetic manipulation' },
];

export const mockRiskReportReview: RiskReport = {
  input: mockInputReview,
  band: 'review',
  overallScore: 33,
  weights: {
    sanctions: 0.6666666666666667,
    adverseMedia: 0.33333333333333337,
    social: 0,
  },
  sanctions: mockSanctionsReview,
  euSanctions: mockEuSanctionsReview,
  adverseMedia: mockAdverseMediaReview,
  social: null,
  highRiskActivityScores: NEVZOROV_HIGH_RISK_KEYS.map(({ key, label }) => ({
    key,
    label,
    present: false,
    score: 0,
    evidence: [],
  })),
  adverseMediaScores: [
    { key: 'sanctioned', label: 'On a sanctions list', present: false, score: 0, evidence: [] },
    { key: 'pep', label: 'Politically Exposed Person', present: false, score: 0, evidence: [] },
    { key: 'bad_press', label: 'Adverse media (any time)', present: true, score: 60, evidence: [] },
    { key: 'bad_press_recent', label: 'Adverse media (last 5 years)', present: true, score: 100, evidence: [] },
    { key: 'high_risk_activity', label: 'High-risk activity involvement', present: true, score: 50, evidence: [] },
  ],
  summary: NEVZOROV_SUMMARY,
  recommendation:
    'Do not proceed yet — conduct enhanced due diligence (EDD) before any decision. Verify identity and ' +
    'establish source of wealth and source of funds. Review reasons: Adverse media (any time); Adverse media ' +
    '(last 5 years); High-risk activity involvement.',
  sources: mockAdverseMediaReview.sources.slice(0, 13),
  generatedAt: '2026-06-07T13:40:44.173Z',
  durationMs: 121379,
};

export const mockRiskReportClear: RiskReport = {
  input: mockInputClear,
  band: 'clear',
  overallScore: 0,
  weights: { sanctions: 0.667, adverseMedia: 0.333, social: 0 },
  sanctions: mockSanctionsClear,
  euSanctions: mockEuSanctionsClear,
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
