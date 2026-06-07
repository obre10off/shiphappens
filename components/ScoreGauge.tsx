'use client';

import { bandColor as BAND_COLOR, neutral, type RiskBand } from '@/lib/theme';

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
          <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(43,42,40,0.10)" strokeWidth="10" />
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
          <span className="text-[10px] text-faint font-medium">/ 100</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="text-xs font-semibold text-faint uppercase tracking-widest">
          Weighted score
        </div>
        <WeightRow label="Sanctions + PEP" value={weights.sanctions} color={neutral[400]} />
        <WeightRow label="Adverse media" value={weights.adverseMedia} color={neutral[500]} />
        <WeightRow label="Social" value={weights.social} color={neutral[600]} />
      </div>
    </div>
  );
}

function WeightRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      <span className="text-muted w-28">{label}</span>
      <span className="text-ink font-semibold tabular-nums">
        {Math.round(value * 100)}%
      </span>
    </div>
  );
}
