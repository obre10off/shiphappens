'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle, Info, Shield, Zap } from 'lucide-react';
import type { ScreeningInput } from '@/lib/contracts/types';

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
    <div className="flex items-center gap-1.5 mb-1.5">
      <label className="text-sm font-medium text-slate-300">
        {children}
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
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Screen a subject</h2>
        <p className="text-slate-400 text-sm">Sanctions + PEP, adverse media, and a risk-scored report.</p>
      </div>

      {/* Demo prefills */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs text-slate-500 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-[#00c9a7]" /> Quick demo:
        </span>
        <button
          onClick={() => setForm(DEMO_HIGH_RISK)}
          className="flex items-center gap-1.5 text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-full hover:bg-red-500/15 transition-colors"
        >
          <AlertTriangle className="w-3 h-3" /> Yanukovych — HIGH RISK
        </button>
        <button
          onClick={() => setForm(DEMO_CLEAR)}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#00c9a7] bg-[#00c9a7]/10 border border-[#00c9a7]/20 px-3 py-1.5 rounded-full hover:bg-[#00c9a7]/15 transition-colors"
        >
          <CheckCircle className="w-3 h-3" /> Kovacheva — CLEAR
        </button>
      </div>

      <div>
        <Label required>Full legal name</Label>
        <input
          className="field"
          placeholder="e.g. Viktor Yanukovych"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label required>Country</Label>
          <select className="field" value={form.country} onChange={(e) => set('country', e.target.value)}>
            <option value="">Select country…</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label tip="Disambiguates common names">Date of birth</Label>
          <input
            type="date"
            className="field"
            value={form.dateOfBirth}
            onChange={(e) => set('dateOfBirth', e.target.value)}
            style={{ colorScheme: 'dark' }}
          />
        </div>
      </div>

      <div>
        <Label tip="Screened as a linked entity">Company</Label>
        <input
          className="field"
          placeholder="e.g. Acme Holdings Ltd."
          value={form.company}
          onChange={(e) => set('company', e.target.value)}
        />
      </div>

      <div>
        <Label tip="Claims, known associates, etc.">Case context</Label>
        <textarea
          className="field min-h-[88px] resize-y"
          placeholder="Any case-specific context that helps ground the search…"
          value={form.freeText}
          onChange={(e) => set('freeText', e.target.value)}
        />
      </div>

      <button
        onClick={submit}
        disabled={!canSubmit}
        className={`w-full flex items-center justify-center gap-2 font-bold text-sm py-3 px-6 rounded-xl transition-all focus-teal
          ${
            canSubmit
              ? 'bg-[#00c9a7] text-[#0d1b2a] hover:bg-[#00e5c0] shadow-[0_0_24px_rgba(0,201,167,0.25)]'
              : 'bg-white/5 text-slate-600 cursor-not-allowed'
          }`}
      >
        <Shield className="w-4 h-4" />
        Run screening
      </button>
    </div>
  );
}
