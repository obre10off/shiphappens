'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { CategoryScore } from '@/lib/contracts/types';

function barColor(score: number): string {
  if (score >= 60) return '#ef4444';
  if (score >= 25) return '#f59e0b';
  return '#475569';
}

function isUrl(s: string): boolean {
  return /^https?:\/\//i.test(s);
}

function ScoreRow({ c }: { c: CategoryScore }) {
  const color = barColor(c.score);
  return (
    <div className={`py-2.5 ${c.present ? '' : 'opacity-50'}`}>
      <div className="flex items-center gap-3">
        <span className={`flex-1 text-sm ${c.present ? 'text-slate-200 font-medium' : 'text-slate-500'}`}>
          {c.label}
        </span>
        <div className="w-28 h-2 rounded-full bg-white/8 overflow-hidden flex-shrink-0">
          <div
            className="h-full rounded-full"
            style={{ width: `${c.score}%`, background: color, transition: 'width 0.6s ease' }}
          />
        </div>
        <span
          className="text-xs font-bold tabular-nums w-7 text-right flex-shrink-0"
          style={{ color: c.present ? color : '#475569' }}
        >
          {c.score}
        </span>
      </div>
      {c.present && c.evidence.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1.5 pl-0.5">
          {c.evidence.slice(0, 6).map((e, i) =>
            isUrl(e) ? (
              <a
                key={i}
                href={e}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-[#00c9a7] bg-[#00c9a7]/10 border border-[#00c9a7]/20 px-2 py-0.5 rounded hover:bg-[#00c9a7]/20 transition-colors max-w-[220px] truncate"
              >
                {e.replace(/^https?:\/\/(www\.)?/, '')}
              </a>
            ) : (
              <span
                key={i}
                className="text-[11px] text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded"
              >
                {e}
              </span>
            ),
          )}
        </div>
      )}
    </div>
  );
}

export function CategoryScoreList({
  items,
  collapsible = false,
}: {
  items: CategoryScore[];
  /** When true, hide absent rows behind a "show all" toggle. */
  collapsible?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const present = items.filter((c) => c.present);
  const absent = items.filter((c) => !c.present);

  if (!collapsible) {
    return (
      <div className="divide-y divide-white/[0.06]">
        {items.map((c) => (
          <ScoreRow key={c.key} c={c} />
        ))}
      </div>
    );
  }

  const shown = expanded ? items : present;

  return (
    <div>
      <div className="divide-y divide-white/[0.06]">
        {shown.length === 0 ? (
          <p className="text-sm text-slate-500 py-3">No high-risk activities flagged.</p>
        ) : (
          shown.map((c) => <ScoreRow key={c.key} c={c} />)
        )}
      </div>
      {absent.length > 0 && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors focus-teal"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" /> Hide cleared categories
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" /> Show all {items.length} categories
            </>
          )}
        </button>
      )}
    </div>
  );
}
