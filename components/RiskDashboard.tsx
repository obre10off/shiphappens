'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  FileDown,
  Loader,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import type { RiskBand, RiskReport } from '@/lib/contracts/types';
import { ScoreGauge } from './ScoreGauge';
import { CategoryScoreList } from './CategoryScoreList';
import { Markdown } from './Markdown';

const BAND_META: Record<
  RiskBand,
  { label: string; verdict: string; color: string; ring: string; bg: string; Icon: typeof XCircle }
> = {
  high: { label: 'HIGH RISK', verdict: 'Decline — escalate to compliance', color: 'text-red-400', ring: 'border-red-500/50', bg: 'bg-red-500/8', Icon: XCircle },
  review: { label: 'REVIEW', verdict: 'Hold — enhanced due diligence required', color: 'text-amber-400', ring: 'border-amber-500/50', bg: 'bg-amber-500/8', Icon: AlertTriangle },
  clear: { label: 'CLEAR', verdict: 'Cleared to proceed under standard due diligence', color: 'text-risk-clear', ring: 'border-risk-clear/50', bg: 'bg-risk-clear/8', Icon: CheckCircle },
};

const TIMELINE_PREVIEW = 4;
const SOURCES_PREVIEW = 3;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <h3 className="text-xs font-semibold text-faint uppercase tracking-widest mb-4">{title}</h3>
      {children}
    </div>
  );
}

export function RiskDashboard({ report, onReset }: { report: RiskReport; onReset?: () => void }) {
  const [downloading, setDownloading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [showAllTimeline, setShowAllTimeline] = useState(false);
  const [showAllSources, setShowAllSources] = useState(false);
  const meta = BAND_META[report.band];
  const { Icon } = meta;
  const timeline = report.adverseMedia?.timeline ?? [];
  const shownTimeline = showAllTimeline ? timeline : timeline.slice(0, TIMELINE_PREVIEW);

  // Sources keep their report order so the summary's inline [n] citations stay
  // stable (adverse-media articles come first, numbered 1..N).
  const orderedSources = report.sources;
  const shownSources = showAllSources ? orderedSources : orderedSources.slice(0, SOURCES_PREVIEW);
  const citationUrl = (n: number) => orderedSources[n - 1]?.url;

  const downloadPdf = async () => {
    setDownloading(true);
    setPdfError(null);
    try {
      const res = await fetch('/api/report/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report),
      });
      if (!res.ok) throw new Error(`PDF failed (${res.status})`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `risk-report-${report.input.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setPdfError(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header band + gauge */}
      <div className={`rounded-2xl border-2 ${meta.ring} ${meta.bg} p-6`}>
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <Icon className={`w-7 h-7 ${meta.color}`} />
              <span className={`text-2xl font-black tracking-tight ${meta.color}`}>{meta.label}</span>
            </div>
            <p className="text-sm text-muted">
              {report.input.name}
              {report.input.country ? ` · ${report.input.country}` : ''}
              {report.input.dateOfBirth ? ` · ${report.input.dateOfBirth}` : ''}
              {' · '}
              {(report.durationMs / 1000).toFixed(1)}s
            </p>
          </div>
          <ScoreGauge score={report.overallScore} band={report.band} />
        </div>
      </div>

      {/* Recommended action — the headline signal, kept at the top */}
      <div className={`rounded-2xl border-2 ${meta.ring} ${meta.bg} p-5`}>
        <h3 className="text-xs font-semibold text-faint uppercase tracking-widest mb-2">
          Recommended action
        </h3>
        <div className="flex items-start gap-2.5 mb-2">
          <Icon className={`w-5 h-5 ${meta.color} flex-shrink-0 mt-0.5`} />
          <span className={`text-lg font-bold leading-snug ${meta.color}`}>{meta.verdict}</span>
        </div>
        <p className="text-sm text-ink leading-relaxed">{report.recommendation}</p>
      </div>

      {/* Summary */}
      <Section title="Summary">
        <Markdown text={report.summary} citationUrl={citationUrl} />
      </Section>

      {/* Adverse-media signals */}
      <Section title="Adverse-media signals">
        <CategoryScoreList items={report.adverseMediaScores} />
      </Section>

      {/* High-risk activities */}
      <Section title={`High-risk activities (${report.highRiskActivityScores.filter((c) => c.present).length} flagged)`}>
        <CategoryScoreList items={report.highRiskActivityScores} collapsible />
      </Section>

      {/* Timeline */}
      {timeline.length > 0 && (
        <Section title="Timeline">
          <div className="space-y-3">
            {shownTimeline.map((t, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center flex-shrink-0">
                  <Clock className="w-3.5 h-3.5 text-accent mt-0.5" />
                  {i < shownTimeline.length - 1 && <div className="w-px flex-1 bg-line mt-1" />}
                </div>
                <div className="pb-1">
                  <div className="text-xs font-semibold text-accent">{t.date || 'Date unknown'}</div>
                  <div className="text-sm text-ink">{t.event}</div>
                </div>
              </div>
            ))}
          </div>
          {timeline.length > TIMELINE_PREVIEW && (
            <button
              onClick={() => setShowAllTimeline((v) => !v)}
              className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink transition-colors focus-teal"
            >
              {showAllTimeline ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" /> Show less
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" /> Show {timeline.length - TIMELINE_PREVIEW} more
                </>
              )}
            </button>
          )}
        </Section>
      )}

      {/* Sources — the single home for evidence links; [n] matches the summary citations */}
      {orderedSources.length > 0 && (
        <Section title={`Sources (${orderedSources.length})`}>
          <div className="space-y-1.5">
            {shownSources.map((s, i) => (
              <a
                key={i}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-accent hover:text-accent-hover transition-colors group"
              >
                <span className="text-xs font-bold text-faint tabular-nums flex-shrink-0 w-5 text-right">
                  {i + 1}
                </span>
                <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{s.note ? `${s.note} — ` : ''}{s.url.replace(/^https?:\/\/(www\.)?/, '')}</span>
              </a>
            ))}
          </div>
          {orderedSources.length > SOURCES_PREVIEW && (
            <button
              onClick={() => setShowAllSources((v) => !v)}
              className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink transition-colors focus-teal"
            >
              {showAllSources ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" /> Show less
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" /> Show {orderedSources.length - SOURCES_PREVIEW} more
                </>
              )}
            </button>
          )}
        </Section>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-1">
        <button
          onClick={downloadPdf}
          disabled={downloading}
          className="flex-1 flex items-center justify-center gap-2 bg-accent text-cream font-bold py-3 px-5 rounded-xl hover:bg-accent-hover transition-colors disabled:opacity-60"
        >
          {downloading ? <Loader className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
          {downloading ? 'Generating…' : 'Download PDF report'}
        </button>
        {onReset && (
          <button
            onClick={onReset}
            className="flex items-center justify-center gap-2 border border-line text-ink font-medium py-3 px-5 rounded-xl hover:bg-surface-alt transition-colors text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            New screening
          </button>
        )}
      </div>
      {pdfError && <p className="text-sm text-red-400">{pdfError}</p>}
    </div>
  );
}
