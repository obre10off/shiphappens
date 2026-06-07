// lib/sanctions/tool.ts
// Vercel AI SDK tool wrapper (AI SDK v6: `inputSchema`). Registered by Part 2's agent.

import { tool } from 'ai';
import { z } from 'zod';
import { searchSanctions } from './match';

export const sanctionsTool = tool({
  description:
    'Search the OpenSanctions database (sanctions lists + PEPs) for a person or company. ' +
    'ALWAYS call this first. Returns matches with scores, datasets, and PEP/sanction flags.',
  inputSchema: z.object({
    name: z.string(),
    dateOfBirth: z.string().optional(),
    country: z.string(),
    company: z.string().optional(),
  }),
  execute: async (args) => searchSanctions(args),
});
