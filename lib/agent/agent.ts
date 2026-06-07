// lib/agent/agent.ts
// The single screening agent (AI SDK v6). Registers tools, runs them in priority
// order (sanctions → google), and emits phase events as each tool fires. Falls back
// to calling the underlying functions directly if the model skips a tool, so the
// report is always complete and deterministic.

import { generateText, stepCountIs, tool } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';
import { getScope, searchSanctions } from '@/lib/sanctions/match';
import { analyzeAdverseMedia } from '@/lib/google/tool';
import { withTimeout } from '@/lib/util/timeout';
import type {
  AdverseMediaResult,
  SanctionsResult,
  ScreeningInput,
  ScreenEvent,
  SocialMediaResult,
} from '@/lib/contracts/types';
import { AGENT_ORCHESTRATION_PROMPT, MODEL_ID, buildUserPrompt } from './prompts';

// Per-step deadlines. The underlying HTTP clients already cap individual fetches
// (OpenSanctions/Tavily ~10s), but the LLM calls and the orchestration loop have
// no ceiling — these guard against a step that hangs past what's reasonable.
const SANCTIONS_STEP_MS = 25_000;
const ADVERSE_STEP_MS = 45_000;
const AGENT_LOOP_MS = 90_000;

function timeoutLabel(ms: number): string {
  return `timed out after ${Math.round(ms / 1000)}s`;
}

function timedOutSanctions(ms: number): SanctionsResult {
  return {
    matches: [],
    totalMatches: 0,
    bestScore: 0,
    isPep: false,
    isSanctioned: false,
    datasetsHit: [],
    scope: getScope(),
    error: `sanctions screening ${timeoutLabel(ms)}`,
  };
}

function timedOutAdverse(name: string, ms: number): AdverseMediaResult {
  return {
    name,
    badPress: false,
    badPressLast5Years: false,
    highRiskActivitiesFlag: false,
    highRiskActivities: [],
    summary: 'Adverse-media screening could not be completed; no findings available.',
    sources: [],
    timeline: [],
    error: `adverse-media screening ${timeoutLabel(ms)}`,
  };
}

export interface ScreeningBundle {
  sanctions: SanctionsResult | null;
  adverseMedia: AdverseMediaResult | null;
  social: SocialMediaResult | null;
}

type Emit = (e: ScreenEvent) => void;

function sanctionsSummary(res: SanctionsResult): string {
  if (res.error) return `failed — ${res.error}`;
  const flags = [
    res.isSanctioned ? 'SANCTIONED' : null,
    res.isPep ? 'PEP' : null,
  ].filter(Boolean);
  const base = `${res.totalMatches} match${res.totalMatches === 1 ? '' : 'es'} · best score ${Math.round(
    res.bestScore * 100,
  )}%`;
  return flags.length ? `${base} · ${flags.join(' · ')}` : base;
}

function adverseSummary(res: AdverseMediaResult): string {
  if (res.error) return `failed — ${res.error}`;
  const flags = [
    res.badPressLast5Years ? 'recent adverse media' : res.badPress ? 'adverse media' : null,
    res.highRiskActivitiesFlag ? `${res.highRiskActivities.length} high-risk activit${res.highRiskActivities.length === 1 ? 'y' : 'ies'}` : null,
  ].filter(Boolean);
  const base = `${res.sources.length} source${res.sources.length === 1 ? '' : 's'}`;
  return flags.length ? `${base} · ${flags.join(' · ')}` : `${base} · no adverse findings`;
}

export async function runScreening(
  input: ScreeningInput,
  onEvent: Emit = () => {},
): Promise<ScreeningBundle> {
  const captured: ScreeningBundle = { sanctions: null, adverseMedia: null, social: null };

  const tools = {
    searchSanctions: tool({
      description:
        'Search the OpenSanctions database (sanctions lists + PEPs) for a person or company. ' +
        'ALWAYS call this first.',
      inputSchema: z.object({
        name: z.string(),
        dateOfBirth: z.string().optional(),
        country: z.string(),
        company: z.string().optional(),
      }),
      execute: async (args) => {
        onEvent({ type: 'phase', phase: 'sanctions', status: 'start' });
        onEvent({ type: 'tool', tool: 'searchSanctions', status: 'call', args });
        const res = await withTimeout(searchSanctions(args), SANCTIONS_STEP_MS, () =>
          timedOutSanctions(SANCTIONS_STEP_MS),
        );
        captured.sanctions = res;
        onEvent({
          type: 'tool',
          tool: 'searchSanctions',
          status: 'result',
          summary: sanctionsSummary(res),
          ok: !res.error,
        });
        onEvent({ type: 'phase', phase: 'sanctions', status: 'done', matches: res.totalMatches });
        onEvent({ type: 'partial', sanctions: res });
        return res;
      },
    }),
    searchGoogle: tool({
      description:
        'Search the web for adverse media about the subject and flag bad press + high-risk ' +
        'activities. Call this AFTER searchSanctions.',
      inputSchema: z.object({
        name: z.string(),
        dateOfBirth: z.string().optional(),
        country: z.string(),
        company: z.string().optional(),
        freeText: z.string().optional(),
      }),
      execute: async (args) => {
        onEvent({ type: 'phase', phase: 'adverse_media', status: 'start' });
        onEvent({ type: 'tool', tool: 'searchGoogle', status: 'call', args });
        const res = await withTimeout(analyzeAdverseMedia(args), ADVERSE_STEP_MS, () =>
          timedOutAdverse(args.name, ADVERSE_STEP_MS),
        );
        captured.adverseMedia = res;
        onEvent({
          type: 'tool',
          tool: 'searchGoogle',
          status: 'result',
          summary: adverseSummary(res),
          ok: !res.error,
        });
        onEvent({
          type: 'phase',
          phase: 'adverse_media',
          status: 'done',
          matches: res.sources.length,
        });
        onEvent({ type: 'partial', adverseMedia: res });
        return res;
      },
    }),
  };

  try {
    // Guard the whole orchestration loop: if the model hangs (outside a tool we
    // already time-bound), stop awaiting and let the deterministic fallback fill
    // any missing signals below. The loop's late result, if any, is ignored.
    await withTimeout(
      generateText({
        model: anthropic(MODEL_ID),
        stopWhen: stepCountIs(6),
        tools,
        system: AGENT_ORCHESTRATION_PROMPT,
        prompt: buildUserPrompt(input),
      }).then(() => undefined),
      AGENT_LOOP_MS,
      () => undefined,
    );
  } catch {
    // The agent loop failed (e.g. no API key). Fall through to direct calls below.
  }

  // Deterministic fallback — guarantee both signals exist.
  if (!captured.sanctions) {
    onEvent({ type: 'phase', phase: 'sanctions', status: 'start' });
    onEvent({
      type: 'tool',
      tool: 'searchSanctions',
      status: 'call',
      args: { name: input.name, dateOfBirth: input.dateOfBirth, country: input.country, company: input.company },
    });
    captured.sanctions = await withTimeout(searchSanctions(input), SANCTIONS_STEP_MS, () =>
      timedOutSanctions(SANCTIONS_STEP_MS),
    );
    onEvent({
      type: 'tool',
      tool: 'searchSanctions',
      status: 'result',
      summary: sanctionsSummary(captured.sanctions),
      ok: !captured.sanctions.error,
    });
    onEvent({
      type: 'phase',
      phase: 'sanctions',
      status: 'done',
      matches: captured.sanctions.totalMatches,
    });
    onEvent({ type: 'partial', sanctions: captured.sanctions });
  }
  if (!captured.adverseMedia) {
    onEvent({ type: 'phase', phase: 'adverse_media', status: 'start' });
    onEvent({
      type: 'tool',
      tool: 'searchGoogle',
      status: 'call',
      args: { name: input.name, dateOfBirth: input.dateOfBirth, country: input.country, company: input.company, freeText: input.freeText },
    });
    captured.adverseMedia = await withTimeout(analyzeAdverseMedia(input), ADVERSE_STEP_MS, () =>
      timedOutAdverse(input.name, ADVERSE_STEP_MS),
    );
    onEvent({
      type: 'tool',
      tool: 'searchGoogle',
      status: 'result',
      summary: adverseSummary(captured.adverseMedia),
      ok: !captured.adverseMedia.error,
    });
    onEvent({
      type: 'phase',
      phase: 'adverse_media',
      status: 'done',
      matches: captured.adverseMedia.sources.length,
    });
    onEvent({ type: 'partial', adverseMedia: captured.adverseMedia });
  }

  return captured;
}
