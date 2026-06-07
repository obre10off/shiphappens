// lib/eu/match.ts
// searchEuSanctions(input) — corroborating secondary check against a local snapshot
// of the EU Sanctions Tracker consolidated list (data.europa.eu). Pure + synchronous;
// never throws to the caller (returns a result with `error` set on failure).
//
// Refresh the snapshot from the EU Sanctions Tracker (the app loads it client-side as
// `datasets/subjects.jsonpack` and unpacks it into `window.application.datasets.subjects`,
// keyed by id; we keep individuals only). See lib/data/euSanctionsIndividuals.json.

import snapshot from '@/lib/data/euSanctionsIndividuals.json';
import { toIso2 } from '@/lib/sanctions/countries';
import type {
  EuSanctionsMatch,
  EuSanctionsResult,
  ScreeningInput,
} from '@/lib/contracts/types';

interface RawIndividual {
  id: string;
  name: string;
  aliases: string[];
  dob: string;
  nats: string[];
  regime: string;
  ref: string;
  types: string;
  url: string;
}
interface Snapshot {
  source: string;
  updated: string;
  count: number;
  individuals: RawIndividual[];
}

const data = snapshot as unknown as Snapshot;

// Show a record as a candidate match at/above this name confidence…
const DISPLAY_THRESHOLD = 0.72;
// …and treat it as a corroborating "listed" hit (drives escalation) at/above this.
const LISTED_THRESHOLD = 0.9;
const MAX_MATCHES = 10;

// Stroke/ligature letters that NFKD does not decompose, transliterated so names
// like "Łukashénka" still match the Latin spellings used in the EU list.
const SPECIAL_LETTERS: Record<string, string> = {
  ł: 'l', đ: 'd', ø: 'o', ð: 'd', þ: 'th', ß: 'ss', æ: 'ae', œ: 'oe', ı: 'i',
};

/** Lowercase, strip diacritics, drop punctuation, collapse whitespace. */
export function normalizeName(s: string): string {
  return (s ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[łđøðþßæœı]/g, (c) => SPECIAL_LETTERS[c] ?? c)
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function f1(aToks: Set<string>, aNorm: string, bToks: Set<string>, bNorm: string): number {
  if (aToks.size === 0 || bToks.size === 0) return 0;
  if (aNorm === bNorm) return 1;
  let common = 0;
  for (const t of aToks) if (bToks.has(t)) common++;
  if (common === 0) return 0;
  const precision = common / aToks.size;
  const recall = common / bToks.size;
  return (2 * precision * recall) / (precision + recall);
}

/** Token-set F1 over normalized names. 1 = exact, 0 = nothing in common. */
export function scoreNames(a: string, b: string): number {
  const an = normalizeName(a);
  const bn = normalizeName(b);
  return f1(new Set(an ? an.split(' ') : []), an, new Set(bn ? bn.split(' ') : []), bn);
}

interface IndexedName {
  raw: string;
  norm: string;
  toks: Set<string>;
}
// Pre-normalize every listed name + alias once at module load.
const INDEX: { rec: RawIndividual; names: IndexedName[] }[] = data.individuals.map((rec) => {
  const names = [rec.name, ...rec.aliases].filter(Boolean).map((raw) => {
    const norm = normalizeName(raw);
    return { raw, norm, toks: new Set(norm ? norm.split(' ') : []) };
  });
  return { rec, names };
});

export function searchEuSanctions(input: ScreeningInput): EuSanctionsResult {
  try {
    const qNorm = normalizeName(input.name);
    const qToks = new Set(qNorm ? qNorm.split(' ') : []);
    const iso = toIso2(input.country);
    const dob = (input.dateOfBirth ?? '').trim();

    const scored: EuSanctionsMatch[] = [];
    for (const { rec, names } of INDEX) {
      let best = 0;
      let matchedName = rec.name;
      for (const n of names) {
        const s = f1(qToks, qNorm, n.toks, n.norm);
        if (s > best) {
          best = s;
          matchedName = n.raw;
        }
      }
      if (best < DISPLAY_THRESHOLD) continue;

      // Corroborate with structured fields when both sides have them.
      let score = best;
      if (dob && rec.dob) score = rec.dob === dob ? Math.min(1, score + 0.08) : Math.max(0, score - 0.15);
      if (iso && rec.nats.length && rec.nats.includes(iso)) score = Math.min(1, score + 0.05);
      if (score < DISPLAY_THRESHOLD) continue;

      scored.push({
        id: rec.id,
        name: rec.name,
        matchedName,
        aliases: rec.aliases,
        score: Math.round(score * 100) / 100,
        regime: rec.regime,
        reference: rec.ref,
        types: rec.types,
        dob: rec.dob || undefined,
        sourceUrl: rec.url,
      });
    }

    scored.sort((a, b) => b.score - a.score);
    const matches = scored.slice(0, MAX_MATCHES);
    const bestScore = matches[0]?.score ?? 0;

    return {
      matches,
      totalMatches: scored.length,
      bestScore,
      isListed: bestScore >= LISTED_THRESHOLD,
      source: data.source,
      snapshotDate: data.updated,
    };
  } catch (err) {
    return {
      matches: [],
      totalMatches: 0,
      bestScore: 0,
      isListed: false,
      source: data?.source ?? 'EU Sanctions Tracker',
      snapshotDate: data?.updated ?? '',
      error: err instanceof Error ? err.message : 'EU sanctions lookup failed',
    };
  }
}
