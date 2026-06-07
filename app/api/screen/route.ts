// app/api/screen/route.ts
// POST: runs the screening agent and streams newline-delimited JSON ScreenEvents,
// then scores the bundle into a RiskReport. See DEV_PLAN.md §4 (streaming protocol).

import { z } from 'zod';
import { runScreening } from '@/lib/agent/agent';
import { scoreReport } from '@/lib/scoring/score';
import type { ScreenEvent } from '@/lib/contracts/types';

export const runtime = 'nodejs'; // tools call external APIs
// Deep adverse-media research (multi-query Tavily + AI curation) can run for
// minutes; 300s is the platform ceiling on most Vercel plans. Locally there's
// no cap. The agent's per-step timeouts keep us under this budget.
export const maxDuration = 300; // Vercel function timeout (seconds)

const ScreeningInputSchema = z.object({
  name: z.string().min(1, 'name is required'),
  dateOfBirth: z.string().optional(),
  country: z.string().min(1, 'country is required'),
  company: z.string().optional(),
  freeText: z.string().optional(),
  caseId: z.string().optional(),
});

export async function POST(req: Request) {
  let parsed;
  try {
    parsed = ScreeningInputSchema.parse(await req.json());
  } catch (err) {
    const message =
      err instanceof z.ZodError ? err.issues.map((i) => i.message).join('; ') : 'Invalid request body';
    return new Response(JSON.stringify({ type: 'error', message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const input = parsed;
  const encoder = new TextEncoder();
  const started = Date.now();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (e: ScreenEvent) => {
        controller.enqueue(encoder.encode(JSON.stringify(e) + '\n'));
      };

      try {
        const bundle = await runScreening(input, send);

        send({ type: 'phase', phase: 'synthesis', status: 'start' });
        const report = scoreReport({
          input,
          sanctions: bundle.sanctions,
          euSanctions: bundle.euSanctions,
          adverseMedia: bundle.adverseMedia,
          social: bundle.social,
          durationMs: Date.now() - started,
        });
        send({ type: 'phase', phase: 'synthesis', status: 'done' });
        send({ type: 'report', report });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Screening failed';
        send({ type: 'error', message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
