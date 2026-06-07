import { describe, expect, it } from 'vitest';
import { renderToBuffer } from '@react-pdf/renderer';
import { createElement } from 'react';
import { RiskReportDocument } from './pdf';
import { mockRiskReport, mockRiskReportClear } from '@/lib/contracts/mocks';

describe('RiskReportDocument', () => {
  it('renders a HIGH report to a valid PDF buffer', async () => {
    const el = createElement(RiskReportDocument, { report: mockRiskReport }) as Parameters<
      typeof renderToBuffer
    >[0];
    const buf = await renderToBuffer(el);
    expect(buf.length).toBeGreaterThan(1000);
    expect(buf.subarray(0, 5).toString('latin1')).toBe('%PDF-');
  }, 20_000);

  it('renders a CLEAR report (empty activities/timeline) without throwing', async () => {
    const el = createElement(RiskReportDocument, { report: mockRiskReportClear }) as Parameters<
      typeof renderToBuffer
    >[0];
    const buf = await renderToBuffer(el);
    expect(buf.subarray(0, 5).toString('latin1')).toBe('%PDF-');
  }, 20_000);
});
