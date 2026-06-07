'use client';

// lib/client/useScreening.ts
// POSTs /api/screen, parses the NDJSON ScreenEvent stream, and exposes phase state
// + the final report. The line-splitting logic is a pure function so it's testable.

import { useCallback, useRef, useState } from 'react';
import type {
  AdverseMediaResult,
  RiskReport,
  SanctionsResult,
  ScreeningInput,
  ScreenEvent,
  ToolName,
} from '@/lib/contracts/types';

export type Phase = 'sanctions' | 'adverse_media' | 'social' | 'synthesis';
export type PhaseStatus = 'pending' | 'running' | 'done';

export interface PhaseState {
  phase: Phase;
  status: PhaseStatus;
  detail?: string;
  matches?: number;
}

export interface ToolCallState {
  tool: ToolName;
  status: 'running' | 'done';
  args?: Record<string, unknown>;
  summary?: string;
  ok?: boolean;
}

export const PHASE_ORDER: Phase[] = ['sanctions', 'adverse_media', 'synthesis'];

function initialPhases(): PhaseState[] {
  return PHASE_ORDER.map((phase) => ({ phase, status: 'pending' as PhaseStatus }));
}

/** Split a growing buffer into complete lines; returns parsed events + the remainder. */
export function parseChunk(buffer: string): { events: ScreenEvent[]; rest: string } {
  const parts = buffer.split('\n');
  const rest = parts.pop() ?? '';
  const events: ScreenEvent[] = [];
  for (const line of parts) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      events.push(JSON.parse(trimmed) as ScreenEvent);
    } catch {
      // ignore malformed lines (partial / keep-alive)
    }
  }
  return { events, rest };
}

export function useScreening() {
  const [phases, setPhases] = useState<PhaseState[]>(initialPhases);
  const [toolCalls, setToolCalls] = useState<ToolCallState[]>([]);
  const [report, setReport] = useState<RiskReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [partialSanctions, setPartialSanctions] = useState<SanctionsResult | null>(null);
  const [partialAdverse, setPartialAdverse] = useState<AdverseMediaResult | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setPhases(initialPhases());
    setToolCalls([]);
    setReport(null);
    setError(null);
    setIsRunning(false);
    setPartialSanctions(null);
    setPartialAdverse(null);
  }, []);

  const applyEvent = useCallback((e: ScreenEvent) => {
    if (e.type === 'phase') {
      setPhases((prev) =>
        prev.map((p) =>
          p.phase === e.phase
            ? {
                ...p,
                status: e.status === 'start' ? 'running' : 'done',
                detail: e.detail ?? p.detail,
                matches: e.matches ?? p.matches,
              }
            : p,
        ),
      );
    } else if (e.type === 'tool') {
      setToolCalls((prev) => {
        if (e.status === 'call') {
          // New invocation (or restart) — upsert a running entry.
          const next = prev.filter((t) => t.tool !== e.tool);
          return [...next, { tool: e.tool, status: 'running', args: e.args }];
        }
        // 'result' — mark the matching call done.
        return prev.map((t) =>
          t.tool === e.tool ? { ...t, status: 'done', summary: e.summary, ok: e.ok } : t,
        );
      });
    } else if (e.type === 'partial') {
      if (e.sanctions) setPartialSanctions(e.sanctions);
      if (e.adverseMedia) setPartialAdverse(e.adverseMedia);
    } else if (e.type === 'report') {
      setReport(e.report);
    } else if (e.type === 'error') {
      setError(e.message);
    }
  }, []);

  const start = useCallback(
    async (input: ScreeningInput) => {
      reset();
      setIsRunning(true);
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch('/api/screen', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          let message = `Request failed (${res.status})`;
          try {
            const j = await res.json();
            if (j?.message) message = j.message;
          } catch {
            /* keep default */
          }
          setError(message);
          setIsRunning(false);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const { events, rest } = parseChunk(buffer);
          buffer = rest;
          for (const e of events) applyEvent(e);
        }
        // flush any trailing complete line
        const { events } = parseChunk(buffer + '\n');
        for (const e of events) applyEvent(e);
      } catch (err) {
        if ((err as Error)?.name !== 'AbortError') {
          setError(err instanceof Error ? err.message : 'Screening failed');
        }
      } finally {
        setIsRunning(false);
      }
    },
    [applyEvent, reset],
  );

  return {
    start,
    reset,
    phases,
    toolCalls,
    report,
    error,
    isRunning,
    partialSanctions,
    partialAdverse,
  };
}
