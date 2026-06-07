// lib/google/tool.ts
// searchGoogle tool: web search (Tavily) → LLM adverse-media flagging (generateObject).
// On any failure returns a degraded AdverseMediaResult (never blocks the report).

import { tool, generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';
import { FULL_SYSTEM_PROMPT } from '@/lib/data/adverseMedia';
import { adverseMediaSchema, sanitizeAdverseMedia } from '@/lib/agent/schema';
import { MODEL_ID } from '@/lib/agent/prompts';
import { toIso2 } from '@/lib/sanctions/countries';
import type { AdverseMediaResult } from '@/lib/contracts/types';
import { searchWeb, type SearchHit } from './tavily';

interface AdverseArgs {
  name: string;
  dateOfBirth?: string;
  country: string;
  company?: string;
  freeText?: string;
}

function buildContext(args: AdverseArgs, hits: SearchHit[]): string {
  const subject = [
    `Name: ${args.name}`,
    args.dateOfBirth ? `Date of birth: ${args.dateOfBirth}` : null,
    `Country: ${args.country}`,
    args.company ? `Company: ${args.company}` : null,
    args.freeText ? `Context: ${args.freeText}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const evidence = hits.length
    ? hits
        .map(
          (h, i) =>
            `[${i + 1}] ${h.title}\nURL: ${h.link}\nDate: ${h.date ?? 'unknown'}\nSnippet: ${h.snippet}`,
        )
        .join('\n\n')
    : 'No search results were returned.';

  return `SUBJECT:\n${subject}\n\nSEARCH RESULTS (use only these to ground factual claims; cite their URLs):\n${evidence}`;
}

function degraded(name: string, error: string): AdverseMediaResult {
  return {
    name,
    badPress: false,
    badPressLast5Years: false,
    highRiskActivitiesFlag: false,
    highRiskActivities: [],
    summary: 'Adverse-media screening could not be completed; no findings available.',
    sources: [],
    timeline: [],
    error,
  };
}

export async function analyzeAdverseMedia(args: AdverseArgs): Promise<AdverseMediaResult> {
  let hits: SearchHit[] = [];
  try {
    hits = await searchWeb(
      { name: args.name, company: args.company, country: args.country, freeText: args.freeText },
      { country: toIso2(args.country) },
    );
  } catch (err) {
    // Search failed — still ask the model, but it will have no grounding.
    hits = [];
    if (!process.env.ANTHROPIC_API_KEY) {
      return degraded(args.name, err instanceof Error ? err.message : 'search failed');
    }
  }

  try {
    const { object } = await generateObject({
      model: anthropic(MODEL_ID),
      schema: adverseMediaSchema,
      system: FULL_SYSTEM_PROMPT,
      prompt: buildContext(args, hits),
    });
    const sanitized = sanitizeAdverseMedia(object);
    // Ensure the name field reflects the subject we screened.
    return { ...sanitized, name: sanitized.name || args.name };
  } catch (err) {
    return degraded(args.name, err instanceof Error ? err.message : 'LLM flagging failed');
  }
}

export const googleTool = tool({
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
  execute: async (a) => analyzeAdverseMedia(a),
});
