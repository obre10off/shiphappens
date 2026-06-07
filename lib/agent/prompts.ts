// lib/agent/prompts.ts
// The small orchestration prompt for the single agent. The heavy adverse-media
// prompt (FULL_SYSTEM_PROMPT) lives in lib/data/adverseMedia.ts and is used by the
// google tool's generateObject call.

import type { ScreeningInput } from '@/lib/contracts/types';

export const MODEL_ID = 'claude-sonnet-4-6';

export const AGENT_ORCHESTRATION_PROMPT = `
You are a KYC/AML compliance analyst orchestrating a screening.
Run the available tools in this exact order, calling each exactly once:

1. searchSanctions — ALWAYS first. Checks OpenSanctions (sanctions lists + PEPs).
2. searchEuSanctions — AFTER searchSanctions. Corroborates against the EU Sanctions Tracker
   consolidated list (EU asset freezes + travel bans).
3. searchGoogle — LAST. Finds adverse media and flags high-risk activities.

Call the tools with the subject's details exactly as provided. Do not invent facts.
After both tools have returned, reply with a one-sentence acknowledgement — the structured
data from the tools is what matters, not your prose.
`.trim();

export function buildUserPrompt(input: ScreeningInput): string {
  const lines = [
    `Name: ${input.name}`,
    input.dateOfBirth ? `Date of birth: ${input.dateOfBirth}` : null,
    `Country: ${input.country}`,
    input.company ? `Company: ${input.company}` : null,
    input.freeText ? `Context: ${input.freeText}` : null,
  ].filter(Boolean);
  return `Screen the following subject. ${lines.join('. ')}.`;
}
