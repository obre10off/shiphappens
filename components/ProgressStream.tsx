'use client';

import { AlertTriangle, CheckCircle, Loader, RotateCcw } from 'lucide-react';
import type { Phase, PhaseState } from '@/lib/client/useScreening';

const LABELS: Record<Phase, string> = {
  sanctions: 'Checking OpenSanctions (sanctions + PEP)…',
  adverse_media: 'Scanning adverse media (web + AI)…',
  social: 'Checking social media…',
  synthesis: 'AI synthesis & risk scoring…',
};

const DONE_LABELS: Record<Phase, string> = {
  sanctions: 'OpenSanctions (sanctions + PEP)',
  adverse_media: 'Adverse media (web + AI)',
  social: 'Social media',
  synthesis: 'AI synthesis & risk scoring',
};

export function ProgressStream({
  phases,
  subject,
  error,
  onRetry,
}: {
  phases: PhaseState[];
  subject: string;
  error?: string | null;
  onRetry?: () => void;
}) {
  return (
    <div className="space-y-2.5">
      <p className="text-slate-400 text-sm mb-4">Screening {subject || 'subject'} across all databases…</p>

      {phases.map((p) => {
        const running = p.status === 'running';
        const done = p.status === 'done';
        const hasMatches = done && p.phase !== 'synthesis' && (p.matches ?? 0) > 0;

        return (
          <div
            key={p.phase}
            className={`rounded-xl border px-4 py-3 flex items-center gap-3 transition-all
              ${
                done
                  ? hasMatches
                    ? 'border-red-500/30 bg-red-500/5'
                    : 'border-[#4f8a6d]/20 bg-[#4f8a6d]/5'
                  : running
                    ? 'border-[#5b7ba6]/40 bg-[#5b7ba6]/8'
                    : 'border-white/[0.06] bg-white/[0.02]'
              }`}
          >
            <div className="flex-shrink-0">
              {running ? (
                <Loader className="w-4 h-4 text-[#5b7ba6] animate-spin" />
              ) : done ? (
                hasMatches ? (
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-[#4f8a6d]" />
                )
              ) : (
                <div className="w-4 h-4 rounded-full border border-white/15" />
              )}
            </div>
            <span
              className={`flex-1 text-sm font-medium ${
                running ? 'text-[#5b7ba6]' : done ? 'text-white' : 'text-slate-600'
              }`}
            >
              {done ? DONE_LABELS[p.phase] : LABELS[p.phase]}
            </span>
            {done && p.phase !== 'synthesis' && (
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  (p.matches ?? 0) > 0 ? 'bg-red-500/15 text-red-400' : 'bg-[#4f8a6d]/15 text-[#4f8a6d]'
                }`}
              >
                {(p.matches ?? 0) > 0 ? `${p.matches} hit${p.matches !== 1 ? 's' : ''}` : 'clear'}
              </span>
            )}
          </div>
        );
      })}

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-4 mt-4">
          <div className="flex items-center gap-2 text-red-400 font-semibold text-sm mb-1.5">
            <AlertTriangle className="w-4 h-4" />
            Screening failed
          </div>
          <p className="text-sm text-slate-400 mb-3">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-1.5 text-sm font-semibold text-[#5b7ba6] hover:text-[#7a97bd] transition-colors focus-teal"
            >
              <RotateCcw className="w-4 h-4" />
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  );
}
