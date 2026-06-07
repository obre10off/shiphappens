// lib/google/research.ts
// Two LLM-backed research helpers used by the deep adverse-media pipeline:
//   1. planQueries        — expand the subject into many targeted search queries.
//   2. selectRelevantSources — vet a large hit pool down to the most relevant
//      sources that should back the citations.
// Both degrade gracefully (return a deterministic fallback) on any failure.

import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';
import { MODEL_ID } from '@/lib/agent/prompts';
import type { SearchHit } from './tavily';

export interface SubjectArgs {
  name: string;
  dateOfBirth?: string;
  country: string;
  company?: string;
  freeText?: string;
}

function subjectBlock(args: SubjectArgs): string {
  return [
    `Name: ${args.name}`,
    args.dateOfBirth ? `Date of birth: ${args.dateOfBirth}` : null,
    `Country: ${args.country}`,
    args.company ? `Company: ${args.company}` : null,
    args.freeText ? `Context: ${args.freeText}` : null,
  ]
    .filter(Boolean)
    .join('\n');
}

const queryPlanSchema = z.object({ queries: z.array(z.string()).max(14) });

const QUERY_PLANNER_PROMPT = `
You are a research planner for KYC/AML adverse-media screening. Given a subject, produce a set of
precise web-search queries that, run together, would surface any adverse media, sanctions, criminal
or civil litigation, regulatory/enforcement actions, financial-crime allegations, leaks, and PEP
connections about THIS specific person or entity.

Rules:
- Output 8–12 queries. Always wrap the full name in double quotes.
- The search engine is SEMANTIC (Tavily), not Google. Use plain keywords — do NOT use boolean
  operators or punctuation logic (no AND / OR / parentheses); just list the relevant terms.
- Vary the angle and keywords across queries (don't repeat the same one).
- Use the country and company where given to disambiguate.
- Include at most ONE query phrased in the subject's likely local language if relevant.
- Keep each query under ~140 characters. Do not invent facts about the subject.
Return JSON: { "queries": string[] }.
`.trim();

/** Ask the model for targeted deep-research queries. Returns [] on failure. */
export async function planQueries(args: SubjectArgs): Promise<string[]> {
  if (!process.env.ANTHROPIC_API_KEY) return [];
  try {
    const { object } = await generateObject({
      model: anthropic(MODEL_ID),
      schema: queryPlanSchema,
      system: QUERY_PLANNER_PROMPT,
      prompt: `SUBJECT:\n${subjectBlock(args)}\n\nPropose the search queries now.`,
      maxOutputTokens: 800,
    });
    return (object.queries ?? []).map((q) => q.trim()).filter(Boolean).slice(0, 12);
  } catch {
    return [];
  }
}

const selectionSchema = z.object({
  selected: z
    .array(z.object({ index: z.number().int(), note: z.string().optional() }))
    .max(20),
});

const SOURCE_SELECTOR_PROMPT = `
You are a source-vetting analyst for KYC/AML screening. From a pool of candidate web results,
select only the ones that should be cited in the screening report.

Select a result when BOTH hold:
- It plausibly refers to THIS subject (same person/entity — weigh country, company, role, dates; be
  cautious about unrelated namesakes), AND
- It is materially relevant: adverse media, sanctions, legal/regulatory action, financial crime, or
  other risk-relevant context.

Exclude: unrelated namesakes, near-duplicate coverage of the same event (keep the strongest one),
bare social-media/profile pages with no substantive reporting, and generic directory listings.

Order the selection by relevance and severity (most material first). Select up to 15.
Return JSON: { "selected": [ { "index": <the [n] of the candidate>, "note": "why it's relevant" } ] }.
`.trim();

/**
 * Vet a large pool of hits down to the most relevant sources (ordered most-material
 * first). The returned order becomes the citation numbering. Falls back to the
 * top-scored hits on any failure or when the pool is already small.
 */
export async function selectRelevantSources(
  args: SubjectArgs,
  hits: SearchHit[],
  opts: { max?: number } = {},
): Promise<SearchHit[]> {
  const max = opts.max ?? 15;
  const fallback = () =>
    [...hits].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, max);

  if (hits.length <= 6 || !process.env.ANTHROPIC_API_KEY) return hits.slice(0, max);

  const list = hits
    .map(
      (h, i) =>
        `[${i + 1}] ${h.title}\nURL: ${h.link}\nDate: ${h.date ?? 'unknown'}\nSnippet: ${(
          h.snippet ?? ''
        ).slice(0, 280)}`,
    )
    .join('\n\n');

  try {
    const { object } = await generateObject({
      model: anthropic(MODEL_ID),
      schema: selectionSchema,
      system: SOURCE_SELECTOR_PROMPT,
      prompt: `SUBJECT:\n${subjectBlock(args)}\n\nCANDIDATE SOURCES:\n${list}\n\nSelect now.`,
      maxOutputTokens: 1500,
    });

    const picked: SearchHit[] = [];
    const seen = new Set<string>();
    for (const { index } of object.selected ?? []) {
      const hit = hits[index - 1];
      if (hit?.link && !seen.has(hit.link)) {
        seen.add(hit.link);
        picked.push(hit);
      }
    }
    return picked.length ? picked.slice(0, max) : fallback();
  } catch {
    return fallback();
  }
}
