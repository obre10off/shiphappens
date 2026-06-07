'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader, Shield } from 'lucide-react';
import type { RiskReport, ScreeningInput } from '@/lib/contracts/types';
import { mockRiskReport, mockRiskReportClear } from '@/lib/contracts/mocks';
import { PHASE_ORDER, useScreening, type PhaseState } from '@/lib/client/useScreening';
import { ScreeningForm } from '@/components/ScreeningForm';
import { ProgressStream } from '@/components/ProgressStream';
import { RiskDashboard } from '@/components/RiskDashboard';

type View = 'form' | 'running' | 'done';

function Header() {
  return (
    <header className="border-b border-white/5 px-5 py-3.5">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#00c9a7] flex items-center justify-center">
            <Shield className="w-3.5 h-3.5 text-[#0d1b2a]" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-sm tracking-tight">
            Ship<span className="text-[#00c9a7]">Happens</span>
          </span>
        </Link>
        <span className="text-xs text-slate-500">KYC / AML screening</span>
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
  const [mockReport, setMockReport] = useState<RiskReport | null>(null);

  const runMock = (input: ScreeningInput) => {
    const isClear = /kovacheva|asdf|qwerty/i.test(input.name);
    const report = isClear ? mockRiskReportClear : mockRiskReport;
    const order = PHASE_ORDER;
    setMockPhases(order.map((phase) => ({ phase, status: 'pending' })));
    setView('running');

    order.forEach((phase, i) => {
      setTimeout(() => {
        setMockPhases((prev) =>
          prev.map((p) => (p.phase === phase ? { ...p, status: 'running' } : p)),
        );
      }, i * 1400);
      setTimeout(() => {
        const matches =
          phase === 'sanctions'
            ? report.sanctions?.totalMatches
            : phase === 'adverse_media'
              ? report.adverseMedia?.sources.length
              : undefined;
        setMockPhases((prev) =>
          prev.map((p) => (p.phase === phase ? { ...p, status: 'done', matches } : p)),
        );
      }, i * 1400 + 1100);
    });

    setTimeout(
      () => {
        setMockReport({ ...report, input });
        setView('done');
      },
      order.length * 1400 + 200,
    );
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
    setView('form');
    setSubject('');
  };

  const phases = useMock ? mockPhases : live.phases;
  const report = useMock ? mockReport : live.report;

  return (
    <div className="min-h-screen bg-[#0d1b2a] flex flex-col">
      <Header />
      <main className="flex-1 px-5 py-8 sm:py-10">
        <div className="max-w-3xl mx-auto">
          {view === 'form' && <ScreeningForm onSubmit={handleSubmit} />}

          {view === 'running' && (
            <div className="animate-slide-up">
              <h2 className="text-2xl font-bold text-white mb-4">Running screening…</h2>
              <ProgressStream
                phases={phases}
                subject={subject}
                error={live.error}
                onRetry={reset}
              />
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
        <div className="min-h-screen bg-[#0d1b2a] flex items-center justify-center">
          <Loader className="w-6 h-6 text-[#00c9a7] animate-spin" />
        </div>
      }
    >
      <ScreenInner />
    </Suspense>
  );
}
