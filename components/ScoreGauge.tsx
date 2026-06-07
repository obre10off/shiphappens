'use client';

import { bandColor as BAND_COLOR, overallTo10, type RiskBand } from '@/lib/theme';

export function ScoreGauge({ score, band }: { score: number; band: RiskBand }) {
  const color = BAND_COLOR[band];
  const r = 52;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const dash = circ * pct;

  return (
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
          {overallTo10(score)}
        </span>
        <span className="text-[10px] text-faint font-medium">/ 10</span>
      </div>
    </div>
  );
}
