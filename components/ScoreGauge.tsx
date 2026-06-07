'use client';

import type { RiskBand } from '@/lib/contracts/types';

const BAND_COLOR: Record<RiskBand, string> = {
  high: '#ef4444',
  review: '#f59e0b',
  clear: '#00c9a7',
};

export function ScoreGauge({
  score,
  band,
  weights,
}: {
  score: number;
  band: RiskBand;
  weights: { sanctions: number; adverseMedia: number; social: number };
}) {
  const color = BAND_COLOR[band];
  const r = 52;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const dash = circ * pct;

  return (
    <div className="flex items-center gap-5">
      <div className="relative w-32 h-32 flex-shrink-0">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            style={{ transition: 'stroke-dasharray 0.8s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black" style={{ color }}>
            {Math.round(score)}
          </span>
          <span className="text-[10px] text-slate-500 font-medium">/ 100</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
          Weighted score
        </div>
        <WeightRow label="Sanctions + PEP" value={weights.sanctions} color="#ef4444" />
        <WeightRow label="Adverse media" value={weights.adverseMedia} color="#f59e0b" />
        <WeightRow label="Social" value={weights.social} color="#00c9a7" />
      </div>
    </div>
  );
}

function WeightRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      <span className="text-slate-400 w-28">{label}</span>
      <span className="text-slate-300 font-semibold tabular-nums">
        {Math.round(value * 100)}%
      </span>
    </div>
  );
}
