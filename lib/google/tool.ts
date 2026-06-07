// lib/google/tool.ts
// searchGoogle tool: web search (Tavily) → LLM adverse-media flagging (generateObject).
// On any failure returns a degraded AdverseMediaResult (never blocks the report).

import { tool, generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';
import { FULL_SYSTEM_PROMPT } from '@/lib/data/adverseMedia';
import { adverseMediaSchema, sanitizeAdverseMedia } from '@/lib/agent/schema';
import { MODEL_ID } from '@/lib/agent/prompts';
import type { AdverseMediaResult } from '@/lib/contracts/types';
import { buildDeepQueries, searchQueries, type SearchHit } from './tavily';
import { planQueries, selectRelevantSources } from './research';

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

/**
 * Deep adverse-media research:
 *   1. plan many targeted queries (AI + deterministic angles),
 *   2. run them all through Tavily (advanced depth, more results per query),
 *   3. ask the model to curate the most relevant sources for citations,
 *   4. flag adverse media against the curated pool.
 * Every stage degrades gracefully so the report is always produced.
 */
export async function analyzeAdverseMedia(args: AdverseArgs): Promise<AdverseMediaResult> {
  const hasLLM = !!process.env.ANTHROPIC_API_KEY;
  let hits: SearchHit[] = [];

  try {
    const planned = await planQueries(args);
    const queries = [...new Set([...buildDeepQueries(args), ...planned])].slice(0, 16);
    hits = await searchQueries(queries, {
      // No `country` filter: adverse media is frequently international (Reuters,
      // OCCRP, ICIJ…); region-filtering Tavily here was collapsing the result set.
      // Country still anchors the queries (in the query text) and the source curation.
      timeoutMs: 20_000,
      maxResults: 10,
      concurrency: 5,
    });
    console.log(
      `[tavily] ${args.name} (${args.country}) → ${queries.length} quer${queries.length === 1 ? 'y' : 'ies'}, ${hits.length} unique hit(s)`,
    );
  } catch (err) {
    hits = [];
    console.error(`[tavily] search failed for ${args.name}:`, err instanceof Error ? err.message : err);
    if (!hasLLM) {
      return degraded(args.name, err instanceof Error ? err.message : 'search failed');
    }
  }

  // Curate the most relevant sources — these become the numbered, citable evidence.
  let curated = hits.slice(0, 15);
  if (hasLLM && hits.length > 0) {
    curated = await selectRelevantSources(args, hits);
    console.log(`[research] curated ${curated.length}/${hits.length} source(s) for citation`);
  }

  try {
    const { object } = await generateObject({
      model: anthropic(MODEL_ID),
      schema: adverseMediaSchema,
      system: FULL_SYSTEM_PROMPT,
      prompt: buildContext(args, curated),
      // Generous ceiling so a rich summary + timeline never truncates mid-sentence.
      maxOutputTokens: 8000,
    });
    const sanitized = sanitizeAdverseMedia(object, curated);
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
