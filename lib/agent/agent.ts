// lib/agent/agent.ts
// The single screening agent (AI SDK v6). Registers tools, runs them in priority
// order (sanctions → google), and emits phase events as each tool fires. Falls back
// to calling the underlying functions directly if the model skips a tool, so the
// report is always complete and deterministic.

import { generateText, stepCountIs, tool } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';
import { searchSanctions } from '@/lib/sanctions/match';
import { analyzeAdverseMedia } from '@/lib/google/tool';
import type {
  AdverseMediaResult,
  SanctionsResult,
  ScreeningInput,
  ScreenEvent,
  SocialMediaResult,
} from '@/lib/contracts/types';
import { AGENT_ORCHESTRATION_PROMPT, MODEL_ID, buildUserPrompt } from './prompts';

export interface ScreeningBundle {
  sanctions: SanctionsResult | null;
  adverseMedia: AdverseMediaResult | null;
  social: SocialMediaResult | null;
}

type Emit = (e: ScreenEvent) => void;

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
        const res = await searchSanctions(args);
        captured.sanctions = res;
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
        const res = await analyzeAdverseMedia(args);
        captured.adverseMedia = res;
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
    await generateText({
      model: anthropic(MODEL_ID),
      stopWhen: stepCountIs(6),
      tools,
      system: AGENT_ORCHESTRATION_PROMPT,
      prompt: buildUserPrompt(input),
    });
  } catch {
    // The agent loop failed (e.g. no API key). Fall through to direct calls below.
  }

  // Deterministic fallback — guarantee both signals exist.
  if (!captured.sanctions) {
    onEvent({ type: 'phase', phase: 'sanctions', status: 'start' });
    captured.sanctions = await searchSanctions(input);
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
    captured.adverseMedia = await analyzeAdverseMedia(input);
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
