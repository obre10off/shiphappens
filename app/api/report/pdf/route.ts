// app/api/report/pdf/route.ts
// POST a RiskReport → application/pdf download.

import { renderToBuffer } from '@react-pdf/renderer';
import { createElement } from 'react';
import { RiskReportDocument } from '@/lib/report/pdf';
import type { RiskReport } from '@/lib/contracts/types';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  let report: RiskReport;
  try {
    report = (await req.json()) as RiskReport;
  } catch {
    return new Response('Invalid JSON body', { status: 400 });
  }

  if (!report?.input?.name) {
    return new Response('Missing report.input.name', { status: 400 });
  }

  try {
    const element = createElement(RiskReportDocument, { report }) as Parameters<
      typeof renderToBuffer
    >[0];
    const buffer = await renderToBuffer(element);
    const safeName = report.input.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="risk-report-${safeName}.pdf"`,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'PDF generation failed';
    return new Response(message, { status: 500 });
  }
}
