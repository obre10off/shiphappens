// lib/report/pdf.tsx
// @react-pdf/renderer document for a RiskReport. Kept legible — it's the real deliverable.

import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';
import type { CategoryScore, RiskReport } from '@/lib/contracts/types';
import { bandColor, categoryTo10, colors, overallTo10, print, scoreColor } from '@/lib/theme';
import { stripMarkdown } from '@/lib/util/markdown';

const INK = print.ink; // primary heading/text on the white page
const TEAL = colors.accent; // teal accent
const MUTED = print.muted;

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, color: INK, fontFamily: 'Helvetica' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  brand: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: INK },
  brandAccent: { color: TEAL },
  sub: { fontSize: 9, color: MUTED, marginTop: 2 },
  bandBox: { padding: 10, borderRadius: 6, alignItems: 'flex-end' },
  bandLabel: { fontSize: 18, fontFamily: 'Helvetica-Bold' },
  bandScore: { fontSize: 9, color: MUTED, marginTop: 2 },
  section: { marginTop: 18 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: INK,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  para: { lineHeight: 1.5, marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  rowLabel: { flex: 1, paddingRight: 8 },
  barTrack: { width: 120, height: 8, backgroundColor: print.barTrack, borderRadius: 4, marginRight: 8 },
  barFill: { height: 8, borderRadius: 4 },
  rowScore: { width: 28, textAlign: 'right', fontFamily: 'Helvetica-Bold' },
  timelineItem: { flexDirection: 'row', marginBottom: 3 },
  timelineDate: { width: 70, color: MUTED },
  source: { color: print.link, marginBottom: 2 },
  footer: { position: 'absolute', bottom: 24, left: 40, right: 40, fontSize: 8, color: MUTED, textAlign: 'center' },
});

function ScoreRow({ c }: { c: CategoryScore }) {
  const color = scoreColor(c.score);
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{c.label}</Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${c.score}%`, backgroundColor: color }]} />
      </View>
      <Text style={[styles.rowScore, { color }]}>{categoryTo10(c.score)}</Text>
    </View>
  );
}

export function RiskReportDocument({ report }: { report: RiskReport }) {
  const presentActivities = report.highRiskActivityScores.filter((c) => c.present);
  const subjectLine = [report.input.name, report.input.country, report.input.dateOfBirth]
    .filter(Boolean)
    .join(' · ');

  return (
    <Document title={`Risk report — ${report.input.name}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>
              Clavis
            </Text>
            <Text style={styles.sub}>KYC / AML Screening Report</Text>
            <Text style={styles.sub}>{subjectLine}</Text>
            <Text style={styles.sub}>
              Generated {new Date(report.generatedAt).toUTCString()} · {(report.durationMs / 1000).toFixed(1)}s
            </Text>
          </View>
          <View style={[styles.bandBox, { backgroundColor: `${bandColor[report.band]}22` }]}>
            <Text style={[styles.bandLabel, { color: bandColor[report.band] }]}>
              {report.band.toUpperCase()}
            </Text>
            <Text style={styles.bandScore}>Score {overallTo10(report.overallScore)}/10</Text>
            <Text style={styles.bandScore}>
              weights S {report.weights.sanctions.toFixed(2)} · M {report.weights.adverseMedia.toFixed(2)} · So{' '}
              {report.weights.social.toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <Text style={styles.para}>{stripMarkdown(report.summary)}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended action</Text>
          <Text style={styles.para}>{report.recommendation}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adverse-media signals</Text>
          {report.adverseMediaScores.map((c) => (
            <ScoreRow key={c.key} c={c} />
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            High-risk activities ({presentActivities.length} flagged)
          </Text>
          {presentActivities.length === 0 ? (
            <Text style={styles.para}>No high-risk activities flagged.</Text>
          ) : (
            presentActivities.map((c) => <ScoreRow key={c.key} c={c} />)
          )}
        </View>

        {report.adverseMedia?.timeline?.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Timeline</Text>
            {report.adverseMedia.timeline.map((t, i) => (
              <View key={i} style={styles.timelineItem}>
                <Text style={styles.timelineDate}>{t.date || '—'}</Text>
                <Text style={{ flex: 1 }}>{t.event}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {report.sources.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sources</Text>
            {report.sources.map((s, i) => (
              <Text key={i} style={styles.source}>
                [{i + 1}] {s.note ? `${s.note} — ` : ''}{s.url}
              </Text>
            ))}
          </View>
        ) : null}

        <Text style={styles.footer} fixed>
          Clavis — automated screening. Review by a qualified compliance officer is required
          before any decision.
        </Text>
      </Page>
    </Document>
  );
}
