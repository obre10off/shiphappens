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
export type ToolName = 'searchSanctions' | 'searchGoogle';

export type ScreenEvent =
  | {
      type: 'phase';
      phase: 'sanctions' | 'adverse_media' | 'social' | 'synthesis';
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
  | { type: 'partial'; sanctions?: SanctionsResult; adverseMedia?: AdverseMediaResult }
  | { type: 'report'; report: RiskReport } // terminal success
  | { type: 'error'; message: string }; // terminal failure
