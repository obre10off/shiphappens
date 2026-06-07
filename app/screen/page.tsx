'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Shield,
  User,
  Building2,
  Anchor,
  PlaneTakeoff,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader,
  FileDown,
  RotateCcw,
  Info,
  Zap,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type EntityType = 'individual' | 'company' | 'vessel' | 'aircraft';
type RiskThreshold = 'strict' | 'standard' | 'broad';

interface FormData {
  entityType: EntityType | '';
  fullName: string;
  country: string;
  dateOfBirth: string;
  aliases: string;
  idNumber: string;
  nationality: string;
  registeredCountry: string;
  registrationNumber: string;
  industry: string;
  ubo: string;
  purpose: string;
  riskThreshold: RiskThreshold;
  yourJurisdiction: string;
}

type ScreeningPhase = 0 | 1 | 2 | 3 | 4 | 5;

interface StepResult {
  label: string;
  matches: number;
  detail: string;
  sources: string[];
}

interface ScreeningResult {
  risk: 'high' | 'review' | 'clear';
  riskLabel: string;
  summary: string;
  recommendation: string;
  steps: StepResult[];
  checkDuration: number;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Armenia', 'Australia', 'Austria',
  'Azerbaijan', 'Bahrain', 'Belarus', 'Belgium', 'Brazil', 'Bulgaria', 'Canada', 'China',
  'Colombia', 'Croatia', 'Cyprus', 'Czech Republic', 'Denmark', 'Egypt', 'Estonia',
  'Finland', 'France', 'Georgia', 'Germany', 'Greece', 'Hungary', 'India', 'Indonesia',
  'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Japan', 'Jordan', 'Kazakhstan',
  'Kuwait', 'Latvia', 'Lebanon', 'Lithuania', 'Luxembourg', 'Malta', 'Mexico', 'Moldova',
  'Netherlands', 'New Zealand', 'Nigeria', 'North Korea', 'Norway', 'Pakistan', 'Poland',
  'Portugal', 'Qatar', 'Romania', 'Russia', 'Saudi Arabia', 'Serbia', 'Singapore',
  'Slovakia', 'Slovenia', 'South Africa', 'South Korea', 'Spain', 'Sweden', 'Switzerland',
  'Syria', 'Turkey', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States',
  'Uzbekistan', 'Venezuela', 'Vietnam',
];

const JURISDICTIONS = [
  'European Union', 'United States', 'United Kingdom', 'Australia', 'Canada',
  'Switzerland', 'Singapore', 'Bulgaria', 'Romania', 'Poland', 'Germany',
  'France', 'Netherlands', 'Other',
];

const INDUSTRIES = [
  'Banking & Finance', 'Cryptocurrency / Digital Assets', 'Real Estate',
  'Legal Services', 'Accounting & Auditing', 'Import / Export',
  'Arms & Defence', 'Energy & Natural Resources', 'Technology', 'Other',
];

const defaultForm: FormData = {
  entityType: '',
  fullName: '',
  country: '',
  dateOfBirth: '',
  aliases: '',
  idNumber: '',
  nationality: '',
  registeredCountry: '',
  registrationNumber: '',
  industry: '',
  ubo: '',
  purpose: '',
  riskThreshold: 'standard',
  yourJurisdiction: '',
};

const DEMO_HIGH_RISK: Partial<FormData> = {
  entityType: 'individual',
  fullName: 'Viktor Yanukovych',
  country: 'Ukraine',
  dateOfBirth: '1950-07-09',
  aliases: 'Viktor Yanukovych, Янукович Віктор',
  nationality: 'Ukraine',
  purpose: 'client_onboarding',
  riskThreshold: 'standard',
};

const DEMO_CLEAR: Partial<FormData> = {
  entityType: 'individual',
  fullName: 'Maria Kovacheva',
  country: 'Bulgaria',
  dateOfBirth: '1987-03-14',
  nationality: 'Bulgaria',
  purpose: 'client_onboarding',
  riskThreshold: 'standard',
};

// ─── Result generators ────────────────────────────────────────────────────────

function getResult(form: FormData): ScreeningResult {
  const name = form.fullName.toLowerCase();
  const isYanukovych = name.includes('yanukovych') || name.includes('янукович');

  if (isYanukovych) {
    return {
      risk: 'high',
      riskLabel: 'HIGH RISK',
      summary:
        'Subject is listed on four major international sanctions regimes and confirmed as a Tier 1 PEP. Extensive adverse media coverage across 47 credible sources. Do not onboard.',
      recommendation:
        'Reject onboarding. File a Suspicious Activity Report (SAR) if contact was initiated. Retain documentation for regulatory audit trail.',
      checkDuration: 6.8,
      steps: [
        {
          label: 'Sanctions check',
          matches: 4,
          detail: '4 active designations across OFAC SDN List, EU Consolidated List (Reg. 269/2014), UN Security Council List, and UK OFSI.',
          sources: ['OFAC SDN', 'EU Reg. 269/2014', 'UN Security Council', 'UK OFSI'],
        },
        {
          label: 'PEP screening',
          matches: 1,
          detail: 'Confirmed PEP Tier 1 — Former President of Ukraine (2010–2014). Fled to Russia following 2014 Maidan revolution. Subject of international arrest warrant.',
          sources: ['OpenSanctions PEP Database', 'Ukrainian State Registry'],
        },
        {
          label: 'Adverse media',
          matches: 47,
          detail: '47 credible adverse media articles. Topics: embezzlement of state funds (~$70B), bribery, abuse of office, money laundering through shell companies in Cyprus and Latvia.',
          sources: ['Reuters', 'BBC', 'OCCRP', 'Transparency International', '+43 sources'],
        },
        {
          label: 'AI synthesis',
          matches: 0,
          detail: 'High confidence result. Subject identity confirmed via date of birth, nationality, and cross-referencing across all three data sources. No false positive risk.',
          sources: ['Claude AI'],
        },
      ],
    };
  }

  return {
    risk: 'clear',
    riskLabel: 'CLEAR',
    summary:
      'No matches found across all checked databases. Subject is not listed on any sanctions list, is not a politically exposed person, and has no adverse media coverage.',
    recommendation:
      'Proceed with onboarding under standard due diligence procedures. Recommend scheduling periodic re-screening every 12 months.',
    checkDuration: 7.2,
    steps: [
      {
        label: 'Sanctions check',
        matches: 0,
        detail: 'No matches found across 200+ international and regional sanctions lists.',
        sources: ['OpenSanctions — 200+ lists checked'],
      },
      {
        label: 'PEP screening',
        matches: 0,
        detail: 'Subject is not listed in any PEP database. No political exposure identified.',
        sources: ['OpenSanctions PEP Database'],
      },
      {
        label: 'Adverse media',
        matches: 0,
        detail: 'No adverse media coverage found. Web search returned no relevant results for fraud, corruption, money laundering, or criminal activity.',
        sources: ['Web search — news, legal records, regulatory databases'],
      },
      {
        label: 'AI synthesis',
        matches: 0,
        detail: 'Clear result with high confidence. Common name checked carefully — date of birth and nationality used to narrow results. No ambiguous matches requiring further review.',
        sources: ['Claude AI'],
      },
    ],
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  const labels = ['Entity Type', 'Identifiers', 'More Details', 'Context', 'Results'];
  return (
    <div className="flex items-center gap-0">
      {labels.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                  ${done ? 'bg-[#00c9a7] text-[#0d1b2a]' : active ? 'bg-[#00c9a7]/20 border-2 border-[#00c9a7] text-[#00c9a7]' : 'bg-white/5 border border-white/10 text-slate-500'}`}
              >
                {done ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <span
                className={`text-[10px] font-medium hidden sm:block transition-colors ${active ? 'text-[#00c9a7]' : done ? 'text-slate-400' : 'text-slate-600'}`}
              >
                {label}
              </span>
            </div>
            {i < labels.length - 1 && (
              <div
                className={`w-8 sm:w-14 h-px mx-1 mb-4 transition-colors ${i < current ? 'bg-[#00c9a7]/60' : 'bg-white/10'}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function FieldLabel({
  label,
  required,
  tip,
}: {
  label: string;
  required?: boolean;
  tip?: string;
}) {
  return (
    <div className="flex items-center gap-1.5 mb-1.5">
      <label className="text-sm font-medium text-slate-300">
        {label}
        {required && <span className="text-[#00c9a7] ml-0.5">*</span>}
      </label>
      {tip && (
        <span className="text-xs text-slate-500 flex items-center gap-0.5">
          <Info className="w-3 h-3" />
          {tip}
        </span>
      )}
    </div>
  );
}

// ─── Step components ──────────────────────────────────────────────────────────

function EntityTypeStep({
  value,
  onChange,
}: {
  value: EntityType | '';
  onChange: (v: EntityType) => void;
}) {
  const options: { type: EntityType; icon: React.ReactNode; title: string; desc: string }[] = [
    {
      type: 'individual',
      icon: <User className="w-7 h-7" />,
      title: 'Individual',
      desc: 'Natural person — client, director, beneficial owner',
    },
    {
      type: 'company',
      icon: <Building2 className="w-7 h-7" />,
      title: 'Company',
      desc: 'Legal entity — corporation, LLC, foundation',
    },
    {
      type: 'vessel',
      icon: <Anchor className="w-7 h-7" />,
      title: 'Vessel',
      desc: 'Maritime ship — cargo, tanker, yacht',
    },
    {
      type: 'aircraft',
      icon: <PlaneTakeoff className="w-7 h-7" />,
      title: 'Aircraft',
      desc: 'Airplane, private jet, helicopter',
    },
  ];

  return (
    <div className="animate-slide-up">
      <h2 className="text-2xl font-bold text-white mb-1">What are you screening?</h2>
      <p className="text-slate-400 text-sm mb-8">
        The entity type determines which databases and logic we apply.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {options.map(({ type, icon, title, desc }) => {
          const active = value === type;
          return (
            <button
              key={type}
              onClick={() => onChange(type)}
              className={`group text-left p-5 rounded-2xl border-2 transition-all focus-teal
                ${active
                  ? 'border-[#00c9a7] bg-[#00c9a7]/10'
                  : 'border-white/8 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]'
                }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all
                  ${active ? 'bg-[#00c9a7] text-[#0d1b2a]' : 'bg-white/5 text-slate-400 group-hover:text-white'}`}
              >
                {icon}
              </div>
              <div className={`font-bold text-base mb-1 ${active ? 'text-white' : 'text-slate-300'}`}>
                {title}
              </div>
              <div className="text-xs text-slate-500 leading-relaxed">{desc}</div>
              {active && (
                <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-[#00c9a7]">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Selected
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CoreIdentifiersStep({
  form,
  onChange,
  isCompany,
}: {
  form: FormData;
  onChange: (k: keyof FormData, v: string) => void;
  isCompany: boolean;
}) {
  return (
    <div className="animate-slide-up space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">
          {isCompany ? 'Company details' : 'Person details'}
        </h2>
        <p className="text-slate-400 text-sm">Required to run any screening.</p>
      </div>

      <div>
        <FieldLabel label={isCompany ? 'Registered company name' : 'Full legal name'} required />
        <input
          className="field"
          placeholder={isCompany ? 'e.g. Acme Holdings Ltd.' : 'e.g. Viktor Yanukovych'}
          value={form.fullName}
          onChange={(e) => onChange('fullName', e.target.value)}
        />
      </div>

      <div>
        <FieldLabel
          label={isCompany ? 'Country of incorporation' : 'Country of residence'}
          required
        />
        <select
          className="field"
          value={form.country}
          onChange={(e) => onChange('country', e.target.value)}
        >
          <option value="">Select country…</option>
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <FieldLabel
          label={isCompany ? 'Incorporation date' : 'Date of birth'}
          tip="Strongly recommended — eliminates most false positives"
        />
        <input
          type="date"
          className="field"
          value={form.dateOfBirth}
          onChange={(e) => onChange('dateOfBirth', e.target.value)}
          style={{ colorScheme: 'dark' }}
        />
      </div>

      {isCompany && (
        <div>
          <FieldLabel label="Registration / VAT number" tip="Eliminates ambiguity completely" />
          <input
            className="field"
            placeholder="e.g. BG123456789"
            value={form.registrationNumber}
            onChange={(e) => onChange('registrationNumber', e.target.value)}
          />
        </div>
      )}
    </div>
  );
}

function AdditionalIdentifiersStep({
  form,
  onChange,
  isCompany,
}: {
  form: FormData;
  onChange: (k: keyof FormData, v: string) => void;
  isCompany: boolean;
}) {
  return (
    <div className="animate-slide-up space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Additional details</h2>
        <p className="text-slate-400 text-sm">
          Optional — but each field significantly improves accuracy.
        </p>
      </div>

      <div>
        <FieldLabel
          label="Aliases / AKA"
          tip="Catches transliterations and nickname variants"
        />
        <input
          className="field"
          placeholder="e.g. Yanukovich, Янукович Віктор"
          value={form.aliases}
          onChange={(e) => onChange('aliases', e.target.value)}
        />
      </div>

      {!isCompany && (
        <>
          <div>
            <FieldLabel
              label="Passport or national ID number"
              tip="Unique identifier — eliminates false positives entirely"
            />
            <input
              className="field"
              placeholder="e.g. AB1234567"
              value={form.idNumber}
              onChange={(e) => onChange('idNumber', e.target.value)}
            />
          </div>
          <div>
            <FieldLabel
              label="Nationality"
              tip="May differ from country of residence"
            />
            <select
              className="field"
              value={form.nationality}
              onChange={(e) => onChange('nationality', e.target.value)}
            >
              <option value="">Select nationality…</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      {isCompany && (
        <>
          <div>
            <FieldLabel label="Industry / Sector" tip="Higher-risk sectors flagged accordingly" />
            <select
              className="field"
              value={form.industry}
              onChange={(e) => onChange('industry', e.target.value)}
            >
              <option value="">Select industry…</option>
              {INDUSTRIES.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>
          <div>
            <FieldLabel
              label="Ultimate Beneficial Owner (UBO)"
              tip="Who actually controls the company"
            />
            <input
              className="field"
              placeholder="Full name of the UBO"
              value={form.ubo}
              onChange={(e) => onChange('ubo', e.target.value)}
            />
            <p className="text-xs text-slate-500 mt-1.5">
              If provided, the UBO will be screened as a separate individual automatically.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function ContextStep({
  form,
  onChange,
}: {
  form: FormData;
  onChange: (k: keyof FormData, v: string) => void;
}) {
  const purposes = [
    { value: 'client_onboarding', label: 'Client onboarding' },
    { value: 'transaction_approval', label: 'Transaction approval' },
    { value: 'vendor_due_diligence', label: 'Vendor due diligence' },
    { value: 'employee_background', label: 'Employee background check' },
    { value: 'ongoing_monitoring', label: 'Ongoing monitoring' },
  ];

  const thresholds: { value: RiskThreshold; label: string; desc: string }[] = [
    { value: 'strict', label: 'Strict', desc: 'Exact matches only' },
    { value: 'standard', label: 'Standard', desc: 'Close matches flagged' },
    { value: 'broad', label: 'Broad', desc: 'Any connection flagged' },
  ];

  return (
    <div className="animate-slide-up space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Screening context</h2>
        <p className="text-slate-400 text-sm">
          Optional — helps calibrate the output and recommended actions.
        </p>
      </div>

      <div>
        <FieldLabel label="Purpose of screening" />
        <select
          className="field"
          value={form.purpose}
          onChange={(e) => onChange('purpose', e.target.value)}
        >
          <option value="">Select purpose…</option>
          {purposes.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <FieldLabel
          label="Match threshold"
          tip="How strict should fuzzy name matching be?"
        />
        <div className="grid grid-cols-3 gap-3 mt-1">
          {thresholds.map(({ value, label, desc }) => {
            const active = form.riskThreshold === value;
            return (
              <button
                key={value}
                onClick={() => onChange('riskThreshold', value)}
                className={`p-3.5 rounded-xl border-2 text-left transition-all focus-teal
                  ${active
                    ? 'border-[#00c9a7] bg-[#00c9a7]/10'
                    : 'border-white/8 bg-white/[0.03] hover:border-white/20'
                  }`}
              >
                <div className={`font-semibold text-sm ${active ? 'text-[#00c9a7]' : 'text-slate-300'}`}>
                  {label}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <FieldLabel
          label="Your jurisdiction"
          tip="Determines which lists are legally mandatory for you"
        />
        <select
          className="field"
          value={form.yourJurisdiction}
          onChange={(e) => onChange('yourJurisdiction', e.target.value)}
        >
          <option value="">Select jurisdiction…</option>
          {JURISDICTIONS.map((j) => (
            <option key={j} value={j}>
              {j}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function ResultsStep({
  form,
  phase,
  result,
}: {
  form: FormData;
  phase: ScreeningPhase;
  result: ScreeningResult | null;
}) {
  const stepLabels = [
    'Checking 200+ sanctions lists…',
    'Screening PEP database…',
    'Scanning adverse media…',
    'AI synthesis & risk scoring…',
  ];

  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">
          {phase < 5 ? 'Running screening…' : 'Screening complete'}
        </h2>
        <p className="text-slate-400 text-sm">
          {phase < 5
            ? `Checking ${form.fullName || 'subject'} across all databases`
            : `${form.fullName || 'Subject'} · ${form.country} · ${result?.checkDuration.toFixed(1)}s`}
        </p>
      </div>

      {/* Progress steps */}
      <div className="space-y-2.5 mb-6">
        {stepLabels.map((label, i) => {
          const stepNum = i + 1;
          const isDone = phase > stepNum;
          const isRunning = phase === stepNum;
          const isPending = phase < stepNum;
          const stepResult = result?.steps[i];
          const hasMatches = stepResult && i < 3 && stepResult.matches > 0;

          return (
            <div
              key={i}
              className={`rounded-xl border transition-all overflow-hidden
                ${isDone
                  ? hasMatches
                    ? 'border-red-500/30 bg-red-500/5'
                    : 'border-[#00c9a7]/20 bg-[#00c9a7]/5'
                  : isRunning
                  ? 'border-[#00c9a7]/40 bg-[#00c9a7]/8'
                  : 'border-white/[0.06] bg-white/[0.02]'
                }`}
            >
              <button
                className="w-full flex items-center gap-3 px-4 py-3 text-left"
                onClick={() => isDone && setExpandedStep(expandedStep === i ? null : i)}
                disabled={!isDone}
              >
                <div className="flex-shrink-0">
                  {isRunning ? (
                    <Loader className="w-4 h-4 text-[#00c9a7] animate-spin" />
                  ) : isDone ? (
                    hasMatches ? (
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-[#00c9a7]" />
                    )
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-white/15" />
                  )}
                </div>
                <span
                  className={`flex-1 text-sm font-medium ${isRunning ? 'text-[#00c9a7]' : isDone ? 'text-white' : 'text-slate-600'}`}
                >
                  {isDone && stepResult ? stepResult.label : label}
                </span>
                {isDone && stepResult && i < 3 && (
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      stepResult.matches > 0
                        ? 'bg-red-500/15 text-red-400'
                        : 'bg-[#00c9a7]/15 text-[#00c9a7]'
                    }`}
                  >
                    {stepResult.matches > 0 ? `${stepResult.matches} match${stepResult.matches !== 1 ? 'es' : ''}` : 'No matches'}
                  </span>
                )}
                {isDone && (
                  expandedStep === i ? (
                    <ChevronUp className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  )
                )}
              </button>

              {/* Expanded detail */}
              {isDone && expandedStep === i && stepResult && (
                <div className="px-4 pb-3 pt-0 border-t border-white/[0.06]">
                  <p className="text-sm text-slate-300 leading-relaxed mb-2.5">{stepResult.detail}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {stepResult.sources.map((s) => (
                      <span
                        key={s}
                        className="text-xs bg-[#00c9a7]/10 border border-[#00c9a7]/20 text-[#00c9a7] px-2 py-0.5 rounded font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Full report */}
      {phase === 5 && result && (
        <div className="animate-fade-in space-y-4">
          {/* Risk badge */}
          <div
            className={`rounded-2xl p-5 border-2 ${
              result.risk === 'high'
                ? 'border-red-500/50 bg-red-500/8'
                : result.risk === 'review'
                ? 'border-amber-500/50 bg-amber-500/8'
                : 'border-[#00c9a7]/50 bg-[#00c9a7]/8'
            }`}
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  {result.risk === 'high' ? (
                    <XCircle className="w-6 h-6 text-red-400" />
                  ) : result.risk === 'review' ? (
                    <AlertTriangle className="w-6 h-6 text-amber-400" />
                  ) : (
                    <CheckCircle className="w-6 h-6 text-[#00c9a7]" />
                  )}
                  <span
                    className={`text-xl font-black tracking-tight ${
                      result.risk === 'high'
                        ? 'text-red-400'
                        : result.risk === 'review'
                        ? 'text-amber-400'
                        : 'text-[#00c9a7]'
                    }`}
                  >
                    {result.riskLabel}
                  </span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed max-w-xl">{result.summary}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-2xl font-black text-white">{result.checkDuration.toFixed(1)}s</div>
                <div className="text-xs text-slate-500">check duration</div>
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
              Recommended Action
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">{result.recommendation}</p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 bg-[#00c9a7] text-[#0d1b2a] font-bold py-3 px-5 rounded-xl hover:bg-[#00e5c0] transition-colors">
              <FileDown className="w-4 h-4" />
              Download PDF report
            </button>
            <Link
              href="/screen"
              className="flex items-center justify-center gap-2 border border-white/10 text-slate-300 font-medium py-3 px-5 rounded-xl hover:bg-white/5 transition-colors text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              New screening
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────

function ScreeningWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [phase, setPhase] = useState<ScreeningPhase>(0);
  const [result, setResult] = useState<ScreeningResult | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Apply demo scenario from URL param
  useEffect(() => {
    const demo = searchParams.get('demo');
    if (demo === 'high-risk') {
      setForm({ ...defaultForm, ...DEMO_HIGH_RISK });
      setStep(0);
    } else if (demo === 'clear') {
      setForm({ ...defaultForm, ...DEMO_CLEAR });
      setStep(0);
    }
  }, [searchParams]);

  const update = useCallback((key: keyof FormData, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
  }, []);

  const loadDemo = (scenario: 'high-risk' | 'clear') => {
    const data = scenario === 'high-risk' ? DEMO_HIGH_RISK : DEMO_CLEAR;
    setForm({ ...defaultForm, ...data });
    setStep(1);
    setPhase(0);
    setResult(null);
  };

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const runScreening = async () => {
    setStep(4);
    setPhase(1);
    await sleep(1800);
    setPhase(2);
    await sleep(1600);
    setPhase(3);
    await sleep(2000);
    setPhase(4);
    await sleep(1800);
    setPhase(5);
    setResult(getResult(form));
  };

  const isCompany = form.entityType === 'company';
  const canProceedStep0 = form.entityType !== '';
  const canProceedStep1 = form.fullName.trim() !== '' && form.country !== '';

  const steps = [
    <EntityTypeStep
      key="entity"
      value={form.entityType}
      onChange={(v) => update('entityType', v)}
    />,
    <CoreIdentifiersStep key="core" form={form} onChange={update} isCompany={isCompany} />,
    <AdditionalIdentifiersStep key="add" form={form} onChange={update} isCompany={isCompany} />,
    <ContextStep key="ctx" form={form} onChange={update} />,
    <ResultsStep key="results" form={form} phase={phase} result={result} />,
  ];

  const canNext = step === 0 ? canProceedStep0 : step === 1 ? canProceedStep1 : true;

  return (
    <div className="min-h-screen bg-[#0d1b2a] flex flex-col">
      {/* Header */}
      <header className="border-b border-white/5 px-5 py-3.5">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-[#00c9a7] flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-[#0d1b2a]" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-sm tracking-tight hidden sm:block">
              Ship<span className="text-[#00c9a7]">Happens</span>
            </span>
          </Link>

          <StepIndicator current={step} total={5} />

          <div className="w-24 flex-shrink-0" />
        </div>
      </header>

      {/* Demo bar */}
      {step < 4 && (
        <div className="border-b border-white/5 bg-white/[0.02] px-5 py-2.5">
          <div className="max-w-3xl mx-auto flex items-center gap-3 flex-wrap">
            <span className="text-xs text-slate-500 flex items-center gap-1.5 flex-shrink-0">
              <Zap className="w-3.5 h-3.5 text-[#00c9a7]" />
              Quick demo:
            </span>
            <button
              onClick={() => loadDemo('high-risk')}
              className="flex items-center gap-1.5 text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-full hover:bg-red-500/15 transition-colors"
            >
              <AlertTriangle className="w-3 h-3" />
              Yanukovych — HIGH RISK
            </button>
            <button
              onClick={() => loadDemo('clear')}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#00c9a7] bg-[#00c9a7]/10 border border-[#00c9a7]/20 px-3 py-1.5 rounded-full hover:bg-[#00c9a7]/15 transition-colors"
            >
              <CheckCircle className="w-3 h-3" />
              Kovacheva — CLEAR
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 px-5 py-8 sm:py-10">
        <div className="max-w-3xl mx-auto">
          <div className="max-w-xl">{steps[step]}</div>
        </div>
      </main>

      {/* Bottom navigation */}
      {step < 4 && (
        <div className="border-t border-white/5 px-5 py-4">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
            {step > 0 ? (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-1.5 text-slate-400 hover:text-white font-medium text-sm transition-colors focus-teal"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            ) : (
              <Link
                href="/"
                className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 font-medium text-sm transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Home
              </Link>
            )}

            <div className="flex items-center gap-3">
              {step === 2 && (
                <button
                  onClick={() => setStep(3)}
                  className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Skip
                </button>
              )}
              {step < 3 ? (
                <button
                  onClick={() => setStep((s) => s + 1)}
                  disabled={!canNext}
                  className={`flex items-center gap-2 font-semibold text-sm px-5 py-2.5 rounded-xl transition-all focus-teal
                    ${canNext
                      ? 'bg-[#00c9a7] text-[#0d1b2a] hover:bg-[#00e5c0]'
                      : 'bg-white/5 text-slate-600 cursor-not-allowed'
                    }`}
                >
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={runScreening}
                  className="flex items-center gap-2 bg-[#00c9a7] text-[#0d1b2a] font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-[#00e5c0] transition-all shadow-[0_0_24px_rgba(0,201,167,0.25)] focus-teal"
                >
                  <Shield className="w-4 h-4" />
                  Run screening
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ScreenPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0d1b2a] flex items-center justify-center">
        <Loader className="w-6 h-6 text-[#00c9a7] animate-spin" />
      </div>
    }>
      <ScreeningWizard />
    </Suspense>
  );
}
