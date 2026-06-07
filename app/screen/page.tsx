'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader, Shield } from 'lucide-react';
import type { RiskReport, ScreeningInput } from '@/lib/contracts/types';
import { mockRiskReport, mockRiskReportClear, mockRiskReportReview } from '@/lib/contracts/mocks';
import {
  PHASE_ORDER,
  useScreening,
  type Phase,
  type PhaseState,
  type ToolCallState,
} from '@/lib/client/useScreening';
import { ScreeningForm } from '@/components/ScreeningForm';
import { ProgressStream } from '@/components/ProgressStream';
import { ToolCallStream } from '@/components/ToolCallStream';
import { RiskDashboard } from '@/components/RiskDashboard';
import { featureFlags } from '@/lib/config';

type View = 'form' | 'running' | 'done';

// Per-step durations for the mock workflow. Mirrors a real run where the
// sanctions/EU checks are quick API lookups and adverse-media is deep research.
const PHASE_DURATIONS_MS: Record<Phase, number> = {
  sanctions: 1600,
  eu_sanctions: 1200,
  adverse_media: 4500,
  social: 1000,
  synthesis: 1800,
};
const PHASE_GAP_MS = 200;

function mockSanctionsSummary(report: RiskReport): string {
  const s = report.sanctions;
  if (!s) return 'no sanctions data';
  const flags = [s.isSanctioned ? 'SANCTIONED' : null, s.isPep ? 'PEP' : null].filter(Boolean);
  const base = `${s.totalMatches} match${s.totalMatches === 1 ? '' : 'es'} · best score ${Math.round(
    s.bestScore * 100,
  )}%`;
  return flags.length ? `${base} · ${flags.join(' · ')}` : base;
}

function mockEuSummary(report: RiskReport): string {
  const e = report.euSanctions;
  if (!e) return 'no EU data';
  if (e.totalMatches === 0) return 'no EU list match';
  const base = `${e.totalMatches} candidate match${e.totalMatches === 1 ? '' : 'es'} · best ${Math.round(
    e.bestScore * 100,
  )}%`;
  return e.isListed ? `${base} · LISTED` : base;
}

function mockAdverseSummary(report: RiskReport): string {
  const a = report.adverseMedia;
  if (!a) return 'no adverse-media data';
  const flags = [
    a.badPressLast5Years ? 'recent adverse media' : a.badPress ? 'adverse media' : null,
    a.highRiskActivitiesFlag ? `${a.highRiskActivities.length} high-risk activities` : null,
  ].filter(Boolean);
  const base = `${a.sources.length} source${a.sources.length === 1 ? '' : 's'}`;
  return flags.length ? `${base} · ${flags.join(' · ')}` : `${base} · no adverse findings`;
}

function Header() {
  return (
    <header className="border-b border-line px-5 py-3.5">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
            <Shield className="w-3.5 h-3.5 text-cream" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-sm tracking-tight">
            Clavis
          </span>
        </Link>
        <span className="text-xs text-faint">KYC / AML screening</span>
      </div>
    </header>
  );
}

function ScreenInner() {
  const searchParams = useSearchParams();
  const useMock = searchParams.get('mock') === '1';

  const live = useScreening();
  const [view, setView] = useState<View>('form');
  const [subject, setSubject] = useState('');

  // ── Mock mode: animate phases then show a checked-in report (demo safety net). ──
  const [mockPhases, setMockPhases] = useState<PhaseState[]>([]);
  const [mockToolCalls, setMockToolCalls] = useState<ToolCallState[]>([]);
  const [mockReport, setMockReport] = useState<RiskReport | null>(null);

  const runMock = (input: ScreeningInput) => {
    const isClear = /kovacheva|asdf|qwerty/i.test(input.name);
    const isReview = /nevzorov/i.test(input.name);
    const report = isClear
      ? mockRiskReportClear
      : isReview
        ? mockRiskReportReview
        : mockRiskReport;
    const order = PHASE_ORDER;
    setMockPhases(order.map((phase) => ({ phase, status: 'pending' })));
    setMockToolCalls([]);
    setView('running');

    const toolForPhase = {
      sanctions: {
        tool: 'searchSanctions' as const,
        args: {
          name: input.name,
          dateOfBirth: input.dateOfBirth,
          country: input.country,
          company: input.company,
        },
        summary: mockSanctionsSummary(report),
        ok: !report.sanctions?.error,
      },
      eu_sanctions: {
        tool: 'searchEuSanctions' as const,
        args: {
          name: input.name,
          dateOfBirth: input.dateOfBirth,
          country: input.country,
        },
        summary: mockEuSummary(report),
        ok: !report.euSanctions?.error,
      },
      adverse_media: {
        tool: 'searchGoogle' as const,
        args: {
          name: input.name,
          country: input.country,
          company: input.company,
          freeText: input.freeText,
        },
        summary: mockAdverseSummary(report),
        ok: !report.adverseMedia?.error,
      },
    };

    // Walk the phases sequentially, giving each its own timeout so the run feels
    // like the real workflow (quick lookups, slow deep adverse-media research).
    let cursor = 0;
    order.forEach((phase) => {
      const startAt = cursor;
      const doneAt = startAt + PHASE_DURATIONS_MS[phase];
      cursor = doneAt + PHASE_GAP_MS;

      setTimeout(() => {
        setMockPhases((prev) =>
          prev.map((p) => (p.phase === phase ? { ...p, status: 'running' } : p)),
        );
        const t = toolForPhase[phase as keyof typeof toolForPhase];
        if (t) {
          setMockToolCalls((prev) => [
            ...prev.filter((c) => c.tool !== t.tool),
            { tool: t.tool, status: 'running', args: t.args },
          ]);
        }
      }, startAt);
      setTimeout(() => {
        const matches =
          phase === 'sanctions'
            ? report.sanctions?.totalMatches
            : phase === 'eu_sanctions'
              ? report.euSanctions?.matches.length
              : phase === 'adverse_media'
                ? report.adverseMedia?.sources.length
                : undefined;
        setMockPhases((prev) =>
          prev.map((p) => (p.phase === phase ? { ...p, status: 'done', matches } : p)),
        );
        const t = toolForPhase[phase as keyof typeof toolForPhase];
        if (t) {
          setMockToolCalls((prev) =>
            prev.map((c) =>
              c.tool === t.tool ? { ...c, status: 'done', summary: t.summary, ok: t.ok } : c,
            ),
          );
        }
      }, doneAt);
    });

    setTimeout(() => {
      setMockReport({ ...report, input });
      setView('done');
    }, cursor);
  };

  const handleSubmit = (input: ScreeningInput) => {
    setSubject(input.name);
    if (useMock) {
      runMock(input);
    } else {
      setView('running');
      live.start(input);
    }
  };

  // Move to dashboard once the live report arrives.
  useEffect(() => {
    if (!useMock && live.report) setView('done');
  }, [live.report, useMock]);

  const reset = () => {
    live.reset();
    setMockReport(null);
    setMockPhases([]);
    setMockToolCalls([]);
    setView('form');
    setSubject('');
  };

  const phases = useMock ? mockPhases : live.phases;
  const toolCalls = useMock ? mockToolCalls : live.toolCalls;
  const report = useMock ? mockReport : live.report;

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <Header />
      <main className="flex-1 px-5 py-8 sm:py-10">
        <div className="max-w-3xl mx-auto">
          {view === 'form' && <ScreeningForm onSubmit={handleSubmit} />}

          {view === 'running' && (
            <div className="animate-slide-up">
              <h2 className="text-2xl font-bold text-ink mb-4">Running screening…</h2>
              <ProgressStream
                phases={phases}
                subject={subject}
                error={live.error}
                onRetry={reset}
              />
              {featureFlags.showAgentToolCalls && <ToolCallStream calls={toolCalls} />}
            </div>
          )}

          {view === 'done' && report && <RiskDashboard report={report} onReset={reset} />}
        </div>
      </main>
    </div>
  );
}

export default function ScreenPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-canvas flex items-center justify-center">
          <Loader className="w-6 h-6 text-accent animate-spin" />
        </div>
      }
    >
      <ScreenInner />
    </Suspense>
  );
}
