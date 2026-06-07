// lib/contracts/types.ts
// Shared contracts for the whole app. Frozen for the hackathon — see DEV_PLAN.md §4.

export interface ScreeningInput {
  name: string;
  dateOfBirth?: string; // ISO YYYY-MM-DD
  country: string; // ISO-2 or display name
  company?: string;
  freeText?: string;
  caseId?: string;
}

// ── Part 1: OpenSanctions ──────────────────────────────────────────────
export interface SanctionsMatch {
  id: string; // OpenSanctions entity id
  caption: string; // display name
  schema: string; // Person | Organization | ...
  score: number; // 0..1 from /match
  match: boolean; // above match threshold
  datasets: string[]; // lists the entity is on
  topics: string[]; // e.g. sanction, role.pep, crime
  properties: Record<string, string[]>;
  sourceUrl: string; // https://www.opensanctions.org/entities/<id>/
}

export interface SanctionsResult {
  matches: SanctionsMatch[];
  totalMatches: number;
  bestScore: number; // 0..1
  isPep: boolean;
  isSanctioned: boolean;
  datasetsHit: string[];
  scope: string; // dataset queried
  error?: string; // set if the call failed (degrade gracefully)
}

// ── EU Sanctions Tracker (corroborating secondary source) ──────────────
// Local snapshot of the EU consolidated list (data.europa.eu sanctions tracker).
// Runs right after the primary OpenSanctions check to corroborate / catch gaps.
export interface EuSanctionsMatch {
  id: string; // EU subject id
  name: string; // primary listed name
  matchedName: string; // the name/alias that matched the query
  aliases: string[];
  score: number; // 0..1 name-match confidence
  regime: string; // EU sanctions regime (e.g. "IRAN")
  reference: string; // Official Journal reference
  types: string; // 'F' (asset freeze) | 'T' (travel ban) | 'F+T'
  dob?: string; // listed date of birth, if any
  sourceUrl: string; // EU sanctions tracker subject page
}

export interface EuSanctionsResult {
  matches: EuSanctionsMatch[];
  totalMatches: number;
  bestScore: number; // 0..1
  isListed: boolean; // high-confidence hit — strong enough to corroborate/escalate
  source: string; // human label of the dataset
  snapshotDate: string; // when the local snapshot was last refreshed (ISO)
  error?: string;
}

// ── Part 2: Adverse media (LLM) + social ───────────────────────────────
export interface Source {
  url: string;
  note?: string;
}
export interface TimelineItem {
  date: string;
  event: string;
} // date: ISO | year | ""

export interface AdverseMediaResult {
  name: string;
  badPress: boolean;
  badPressLast5Years: boolean; // true only if after 2021-01-01
  highRiskActivitiesFlag: boolean;
  highRiskActivities: string[]; // subset of HIGH_RISK_ACTIVITIES (exact strings)
  summary: string; // plain text, no markdown
  sources: Source[];
  timeline: TimelineItem[];
  error?: string;
}

export interface SocialMediaResult {
  // stretch — may be null
  profiles: { platform: string; url: string; note?: string }[];
  flags: string[];
  summary: string;
  error?: string;
}

// ── Part 3: scoring + report ───────────────────────────────────────────
export type RiskBand = 'clear' | 'review' | 'high';

export interface CategoryScore {
  key: string; // stable id
  label: string; // human label
  score: number; // 0..100
  present: boolean;
  evidence: string[]; // urls / short notes
}

export interface RiskReport {
  input: ScreeningInput;
  band: RiskBand;
  overallScore: number; // 0..100 weighted
  weights: { sanctions: number; adverseMedia: number; social: number };
  sanctions: SanctionsResult | null;
  euSanctions: EuSanctionsResult | null;
  adverseMedia: AdverseMediaResult | null;
  social: SocialMediaResult | null;
  highRiskActivityScores: CategoryScore[]; // one per HIGH_RISK_ACTIVITIES
  adverseMediaScores: CategoryScore[]; // bad press / recent / PEP / sanctioned
  summary: string;
  recommendation: string;
  sources: Source[];
  generatedAt: string; // ISO
  durationMs: number;
}

// ── Streaming protocol (Part 2 → Part 4 over SSE / NDJSON) ──────────────
export type ToolName = 'searchSanctions' | 'searchEuSanctions' | 'searchGoogle';

export type ScreenEvent =
  | {
      type: 'phase';
      phase: 'sanctions' | 'eu_sanctions' | 'adverse_media' | 'social' | 'synthesis';
      status: 'start' | 'done';
      detail?: string;
      matches?: number;
    }
  | {
      // A concrete agent tool invocation — surfaced for the tool-calling UI.
      type: 'tool';
      tool: ToolName;
      status: 'call' | 'result';
      args?: Record<string, unknown>; // present on 'call'
      summary?: string; // present on 'result' — one-line outcome
      ok?: boolean; // present on 'result' — false if the tool degraded
    }
  | {
      type: 'partial';
      sanctions?: SanctionsResult;
      euSanctions?: EuSanctionsResult;
      adverseMedia?: AdverseMediaResult;
    }
  | { type: 'report'; report: RiskReport } // terminal success
  | { type: 'error'; message: string }; // terminal failure
