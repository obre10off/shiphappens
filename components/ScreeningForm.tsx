'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle,
  FileText,
  Info,
  Shield,
  User,
  Zap,
} from 'lucide-react';
import type { ScreeningInput } from '@/lib/contracts/types';
import { CountryAutocomplete } from '@/components/CountryAutocomplete';

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

const DEMO_HIGH_RISK: ScreeningInput = {
  name: 'Viktor Yanukovych',
  dateOfBirth: '1950-07-09',
  country: 'Ukraine',
  freeText: 'Former head of state; flagged during onboarding.',
};

const DEMO_CLEAR: ScreeningInput = {
  name: 'Maria Kovacheva',
  dateOfBirth: '1987-03-14',
  country: 'Bulgaria',
};

const empty: ScreeningInput = { name: '', country: '', dateOfBirth: '', company: '', freeText: '' };

function Label({ children, required, tip }: { children: React.ReactNode; required?: boolean; tip?: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      <label className="text-sm font-semibold text-ink">
        {children}
        {required && <span className="text-accent ml-0.5">*</span>}
      </label>
      {tip && (
        <span className="text-xs text-faint flex items-center gap-0.5">
          <Info className="w-3 h-3" />
          {tip}
        </span>
      )}
    </div>
  );
}

export function ScreeningForm({ onSubmit }: { onSubmit: (input: ScreeningInput) => void }) {
  const [form, setForm] = useState<ScreeningInput>(empty);
  const set = (k: keyof ScreeningInput, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const canSubmit = form.name.trim() !== '' && form.country !== '';

  const submit = () => {
    if (!canSubmit) return;
    onSubmit({
      name: form.name.trim(),
      country: form.country,
      dateOfBirth: form.dateOfBirth || undefined,
      company: form.company?.trim() || undefined,
      freeText: form.freeText?.trim() || undefined,
    });
  };

  return (
    <div className="relative animate-slide-up">
      {/* Ambient accent glow so the white card lifts off the white canvas. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-10 -top-12 h-48 bg-accent/10 blur-3xl rounded-full"
      />

      <div className="relative bg-surface border border-line rounded-card shadow-raised overflow-hidden">
        {/* Accent hairline along the top edge */}
        <div className="h-1 w-full bg-gradient-to-r from-accent via-accent to-accent/40" />

        <div className="p-6 sm:p-9 space-y-6">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-accent/10 border border-accent/15 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-accent" strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-ink tracking-tight">Screen a subject</h2>
              <p className="text-muted text-sm mt-0.5">
                Sanctions + PEP, adverse media, and a risk-scored report.
              </p>
            </div>
          </div>

          {/* Demo prefills */}
          <div className="flex items-center gap-2.5 flex-wrap rounded-xl bg-surface-alt border border-line px-3.5 py-3">
            <span className="text-xs font-medium text-muted flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-accent" /> Quick demo:
            </span>
            <button
              type="button"
              onClick={() => setForm({ ...empty, ...DEMO_HIGH_RISK })}
              className="flex items-center gap-1.5 text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-full hover:bg-red-500/15 transition-colors focus-teal"
            >
              <AlertTriangle className="w-3 h-3" /> Yanukovych — HIGH RISK
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...empty, ...DEMO_CLEAR })}
              className="flex items-center gap-1.5 text-xs font-semibold text-risk-clear bg-risk-clear/10 border border-risk-clear/20 px-3 py-1.5 rounded-full hover:bg-risk-clear/15 transition-colors focus-teal"
            >
              <CheckCircle className="w-3 h-3" /> Kovacheva — CLEAR
            </button>
          </div>

          <div>
            <Label required>Full legal name</Label>
            <div className="field-wrap">
              <span className="field-lead" aria-hidden>
                <User className="w-4 h-4" />
              </span>
              <input
                className="field field-has-lead"
                placeholder="e.g. Viktor Yanukovych"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label required>Country</Label>
              <CountryAutocomplete
                countries={COUNTRIES}
                value={form.country}
                onChange={(v) => set('country', v)}
              />
            </div>
            <div>
              <Label tip="Disambiguates common names">Date of birth</Label>
              <div className="field-wrap">
                <span className="field-lead" aria-hidden>
                  <Calendar className="w-4 h-4" />
                </span>
                <input
                  type="date"
                  className="field field-has-lead"
                  value={form.dateOfBirth}
                  onChange={(e) => set('dateOfBirth', e.target.value)}
                  style={{ colorScheme: 'light' }}
                />
              </div>
            </div>
          </div>

          <div>
            <Label tip="Screened as a linked entity">Company</Label>
            <div className="field-wrap">
              <span className="field-lead" aria-hidden>
                <Building2 className="w-4 h-4" />
              </span>
              <input
                className="field field-has-lead"
                placeholder="e.g. Acme Holdings Ltd."
                value={form.company}
                onChange={(e) => set('company', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label tip="Claims, known associates, etc.">Case context</Label>
            <div className="field-wrap">
              <span className="field-lead items-start pt-3.5 !top-0 !translate-y-0" aria-hidden>
                <FileText className="w-4 h-4" />
              </span>
              <textarea
                className="field field-has-lead min-h-[88px] resize-y"
                placeholder="Any case-specific context that helps ground the search…"
                value={form.freeText}
                onChange={(e) => set('freeText', e.target.value)}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            className={`w-full flex items-center justify-center gap-2 font-bold text-sm py-3.5 px-6 rounded-xl transition-all focus-teal
              ${
                canSubmit
                  ? 'bg-accent text-cream hover:bg-accent-hover shadow-[0_8px_24px_rgba(82,81,250,0.28)]'
                  : 'bg-surface-alt text-faint cursor-not-allowed'
              }`}
          >
            <Shield className="w-4 h-4" />
            Run screening
          </button>
        </div>
      </div>
    </div>
  );
}
