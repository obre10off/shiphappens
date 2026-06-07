// lib/sanctions/match.ts
// searchSanctions(input) — builds the /match query, calls the API, maps the response.
// Never throws to the caller: on failure returns a SanctionsResult with `error` set.

import type { SanctionsResult, ScreeningInput } from '@/lib/contracts/types';
import { matchRequest } from './client';
import { toIso2 } from './countries';
import { aggregate, mapEntity, type RawEntity } from './map';

interface MatchResponse {
  responses?: Record<string, { results?: RawEntity[]; total?: { value: number } }>;
}

export function getScope(override?: string): string {
  return override || process.env.OPENSANCTIONS_SCOPE || 'default';
}

/** Build the `queries` body. Always a Person q1; an Organization q2 if company given. */
export function buildQuery(input: ScreeningInput): Record<string, unknown> {
  const iso = toIso2(input.country);
  const personProps: Record<string, string[]> = { name: [input.name] };
  if (input.dateOfBirth) personProps.birthDate = [input.dateOfBirth];
  if (iso) {
    personProps.country = [iso];
    personProps.nationality = [iso];
  }

  const queries: Record<string, unknown> = {
    q1: { schema: 'Person', properties: personProps },
  };

  if (input.company) {
    const orgProps: Record<string, string[]> = { name: [input.company] };
    if (iso) orgProps.country = [iso];
    queries.q2 = { schema: 'Organization', properties: orgProps };
  }

  return { queries };
}

export async function searchSanctions(
  input: ScreeningInput,
  opts: { scope?: string } = {},
): Promise<SanctionsResult> {
  const scope = getScope(opts.scope);

  try {
    const data = await matchRequest<MatchResponse>({
      scope,
      query: buildQuery(input),
    });

    const responses = data.responses ?? {};
    const raw: RawEntity[] = Object.values(responses).flatMap((r) => r.results ?? []);

    // Dedupe by entity id, keeping the highest-scoring instance.
    const byId = new Map<string, RawEntity>();
    for (const e of raw) {
      const prev = byId.get(e.id);
      if (!prev || (e.score ?? 0) > (prev.score ?? 0)) byId.set(e.id, e);
    }

    const matches = [...byId.values()]
      .map(mapEntity)
      .sort((a, b) => b.score - a.score);

    return aggregate(matches, scope);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Sanctions lookup failed';
    return {
      matches: [],
      totalMatches: 0,
      bestScore: 0,
      isPep: false,
      isSanctioned: false,
      datasetsHit: [],
      scope,
      error: message,
    };
  }
}
