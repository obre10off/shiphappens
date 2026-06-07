'use client';

import { useState } from 'react';
import { AlertTriangle, ChevronRight, Loader, Terminal, Wrench } from 'lucide-react';
import type { ToolCallState } from '@/lib/client/useScreening';
import type { ToolName } from '@/lib/contracts/types';

const TOOL_META: Record<ToolName, { label: string; source: string }> = {
  searchSanctions: { label: 'searchSanctions', source: 'OpenSanctions /match' },
  searchGoogle: { label: 'searchGoogle', source: 'Tavily web search → AI flagging' },
};

/** Compact single-line preview of the args, e.g. name="Jane Doe", country="DE". */
function argPreview(args?: Record<string, unknown>): string {
  if (!args) return '';
  return Object.entries(args)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
    .join(', ');
}

function ToolCard({ call }: { call: ToolCallState }) {
  const [open, setOpen] = useState(false);
  const meta = TOOL_META[call.tool];
  const running = call.status === 'running';
  const failed = call.status === 'done' && call.ok === false;
  const preview = argPreview(call.args);

  return (
    <div
      className={`rounded-xl border overflow-hidden transition-all ${
        failed
          ? 'border-amber-500/30 bg-amber-500/5'
          : running
            ? 'border-accent/40 bg-accent/8'
            : 'border-line bg-surface'
      }`}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full px-3.5 py-2.5 flex items-center gap-2.5 text-left focus-teal"
      >
        <ChevronRight
          className={`w-3.5 h-3.5 flex-shrink-0 text-faint transition-transform ${open ? 'rotate-90' : ''}`}
        />
        <Wrench className="w-3.5 h-3.5 flex-shrink-0 text-accent" />
        <code className="text-[13px] font-semibold text-ink">
          {meta.label}
          <span className="text-faint">(</span>
          <span className="text-muted font-normal">{preview ? '…' : ''}</span>
          <span className="text-faint">)</span>
        </code>
        <span className="ml-auto flex-shrink-0">
          {running ? (
            <Loader className="w-3.5 h-3.5 text-accent animate-spin" />
          ) : failed ? (
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <span className="text-[11px] font-mono text-accent">✓ 200</span>
          )}
        </span>
      </button>

      {open && (
        <div className="px-3.5 pb-3 pt-0.5 space-y-2 border-t border-line">
          <div className="text-[10px] uppercase tracking-wider text-faint mt-2">Source</div>
          <div className="text-xs text-muted">{meta.source}</div>

          <div className="text-[10px] uppercase tracking-wider text-faint">Arguments</div>
          <pre className="text-[11px] leading-relaxed font-mono text-muted bg-surface-alt/50 rounded-lg p-2.5 overflow-x-auto">
            {JSON.stringify(call.args ?? {}, null, 2)}
          </pre>

          {call.summary && (
            <>
              <div className="text-[10px] uppercase tracking-wider text-faint">Result</div>
              <div className={`text-xs font-medium ${failed ? 'text-amber-400' : 'text-accent'}`}>
                {call.summary}
              </div>
            </>
          )}
        </div>
      )}

      {/* Collapsed result line so the outcome is visible without expanding. */}
      {!open && call.summary && (
        <div className="px-3.5 pb-2.5 -mt-1 pl-[2.4rem]">
          <span className={`text-[11px] ${failed ? 'text-amber-400/90' : 'text-muted'}`}>
            → {call.summary}
          </span>
        </div>
      )}
    </div>
  );
}

export function ToolCallStream({ calls }: { calls: ToolCallState[] }) {
  if (calls.length === 0) return null;

  return (
    <div className="mt-5">
      <div className="flex items-center gap-2 mb-2.5">
        <Terminal className="w-3.5 h-3.5 text-faint" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-faint">
          Agent tool calls
        </h3>
      </div>
      <div className="space-y-2">
        {calls.map((c) => (
          <ToolCard key={c.tool} call={c} />
        ))}
      </div>
    </div>
  );
}
