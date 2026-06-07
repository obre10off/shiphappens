// lib/social/tool.ts
// STRETCH (lowest weight, 0.10). Searches major social platforms for the subject and
// summarizes profiles + flags. Not wired into the default agent flow — the route ships
// `social: null` unless this is explicitly enabled. Everything works without it.

import { tool, generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';
import { MODEL_ID } from '@/lib/agent/prompts';
import type { SocialMediaResult } from '@/lib/contracts/types';
import { searchWeb, type SearchHit } from '@/lib/google/tavily';

const SOCIAL_DOMAINS = ['linkedin.com', 'x.com', 'twitter.com', 'facebook.com', 'instagram.com'];

const socialSchema = z.object({
  profiles: z.array(
    z.object({ platform: z.string(), url: z.string(), note: z.string().optional() }),
  ),
  flags: z.array(z.string()),
  summary: z.string(),
});

interface SocialArgs {
  name: string;
  company?: string;
  country?: string;
}

export async function analyzeSocial(args: SocialArgs): Promise<SocialMediaResult> {
  let hits: SearchHit[] = [];
  try {
    const queries = SOCIAL_DOMAINS.map((d) => `"${args.name}"${args.company ? ` ${args.company}` : ''} site:${d}`);
    const all = await Promise.all(
      queries.map((q) =>
        searchWeb({ name: q, country: args.country }).catch(() => [] as SearchHit[]),
      ),
    );
    const byUrl = new Map<string, SearchHit>();
    for (const h of all.flat()) if (!byUrl.has(h.link)) byUrl.set(h.link, h);
    hits = [...byUrl.values()];
  } catch (err) {
    return {
      profiles: [],
      flags: [],
      summary: 'Social media screening could not be completed.',
      error: err instanceof Error ? err.message : 'social search failed',
    };
  }

  try {
    const context = hits
      .map((h) => `${h.title}\nURL: ${h.link}\n${h.snippet}`)
      .join('\n\n') || 'No social profiles found.';
    const { object } = await generateObject({
      model: anthropic(MODEL_ID),
      schema: socialSchema,
      system:
        'You summarize a subject\'s public social-media footprint for KYC. Only use the provided ' +
        'results. List likely profiles (platform + url) and any reputational flags. Plain text summary.',
      prompt: `Subject: ${args.name}${args.company ? ` (${args.company})` : ''}\n\nResults:\n${context}`,
    });
    return object;
  } catch (err) {
    return {
      profiles: [],
      flags: [],
      summary: 'Social media analysis was degraded.',
      error: err instanceof Error ? err.message : 'social analysis failed',
    };
  }
}

export const socialTool = tool({
  description:
    'Search social media (LinkedIn, X, Facebook, Instagram) for the subject and summarize ' +
    'profiles and reputational flags. Optional — call LAST, after searchGoogle.',
  inputSchema: z.object({
    name: z.string(),
    company: z.string().optional(),
    country: z.string().optional(),
  }),
  execute: async (a) => analyzeSocial(a),
});
