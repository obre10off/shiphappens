'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { CategoryScore } from '@/lib/contracts/types';
import { neutral, scoreColor } from '@/lib/theme';

function isUrl(s: string): boolean {
  return /^https?:\/\//i.test(s);
}

function ScoreRow({ c }: { c: CategoryScore }) {
  const color = scoreColor(c.score);
  return (
    <div className={`py-2.5 ${c.present ? '' : 'opacity-50'}`}>
      <div className="flex items-center gap-3">
        <span className={`flex-1 text-sm ${c.present ? 'text-ink font-medium' : 'text-faint'}`}>
          {c.label}
        </span>
        <div className="w-28 h-2 rounded-full bg-surface-alt overflow-hidden flex-shrink-0">
          <div
            className="h-full rounded-full"
            style={{ width: `${c.score}%`, background: color, transition: 'width 0.6s ease' }}
          />
        </div>
        <span
          className="text-xs font-bold tabular-nums w-7 text-right flex-shrink-0"
          style={{ color: c.present ? color : neutral[400] }}
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
                className="text-[11px] text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded hover:bg-accent/20 transition-colors max-w-[220px] truncate"
              >
                {e.replace(/^https?:\/\/(www\.)?/, '')}
              </a>
            ) : (
              <span
                key={i}
                className="text-[11px] text-muted bg-surface-alt border border-line px-2 py-0.5 rounded"
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
      <div className="divide-y divide-line">
        {items.map((c) => (
          <ScoreRow key={c.key} c={c} />
        ))}
      </div>
    );
  }

  const shown = expanded ? items : present;

  return (
    <div>
      <div className="divide-y divide-line">
        {shown.length === 0 ? (
          <p className="text-sm text-faint py-3">No high-risk activities flagged.</p>
        ) : (
          shown.map((c) => <ScoreRow key={c.key} c={c} />)
        )}
      </div>
      {absent.length > 0 && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink transition-colors focus-teal"
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
