// lib/google/tavily.ts
// Web search via Tavily (https://tavily.com). Returns normalized hits; throws a typed
// error on failure (the tool layer catches and degrades).

export interface SearchHit {
  title: string;
  link: string;
  snippet: string;
  date?: string;
  score?: number;
}

export class TavilyError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'TavilyError';
    this.status = status;
  }
}

const ENDPOINT = 'https://api.tavily.com/search';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface RawTavily {
  results?: {
    title?: string;
    url?: string;
    content?: string;
    score?: number;
    published_date?: string;
  }[];
}

async function call(
  query: string,
  apiKey: string,
  country: string | undefined,
  timeoutMs: number,
  maxResults: number,
): Promise<SearchHit[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const body: Record<string, unknown> = {
    query,
    search_depth: 'advanced',
    topic: 'general',
    max_results: maxResults,
    include_answer: false,
  };
  // Tavily's `country` expects a full lowercase country name (e.g. "bulgaria"),
  // NOT an ISO code — an invalid value returns HTTP 400. We retry without it below.
  if (country) body.country = country.toLowerCase();

  try {
    let res: Response | undefined;
    const MAX_ATTEMPTS = 3;
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const last = attempt === MAX_ATTEMPTS - 1;
      try {
        res = await fetch(ENDPOINT, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        if (res.ok) break;
        // An unrecognized country yields 400 — drop it and retry unfiltered.
        if (res.status === 400 && body.country && !last) {
          delete body.country;
          continue;
        }
        // Rate-limit / transient server error — back off and retry.
        if ((res.status === 429 || res.status >= 500) && !last) {
          await sleep(500 * (attempt + 1));
          continue;
        }
        throw new TavilyError(`Tavily ${res.status}`, res.status);
      } catch (err) {
        if (err instanceof TavilyError) throw err;
        if (!last) {
          await sleep(300 * (attempt + 1));
          continue;
        }
        throw err;
      }
    }
    if (!res || !res.ok) throw new TavilyError('Tavily request failed', res?.status ?? 0);
    const data = (await res.json()) as RawTavily;
    return (data.results ?? [])
      .filter((r) => r.url)
      .map((r) => ({
        title: r.title ?? '',
        link: r.url as string,
        snippet: r.content ?? '',
        date: r.published_date,
        score: r.score,
      }));
  } finally {
    clearTimeout(timer);
  }
}

// Tavily is a neural/semantic search API — plain keyword queries outperform
// Google-style boolean `(A OR B)` strings, which return fewer, weaker results.
// The full name stays quoted to anchor results on the exact subject.

/** Build the targeted adverse-media queries for a subject. */
export function buildQueries(args: {
  name: string;
  company?: string;
  country?: string;
  freeText?: string;
}): string[] {
  const { name, company, country, freeText } = args;
  const n = `"${name}"`;
  const queries = [`${n} fraud corruption money laundering sanctions investigation lawsuit`];
  if (company) queries.push(`${n} "${company}" fraud investigation misconduct`);
  if (country) queries.push(`${n} ${country} adverse media scandal news`);
  if (freeText && freeText.trim()) queries.push(`${n} ${freeText.trim().slice(0, 120)}`);
  return queries;
}

/**
 * A broad, multi-angle query set for DEEP research. Covers sanctions, criminal,
 * regulatory, financial-crime, leaks and litigation angles in addition to the
 * baseline `buildQueries`. Deduped.
 */
export function buildDeepQueries(args: {
  name: string;
  company?: string;
  country?: string;
  freeText?: string;
}): string[] {
  const { name, company } = args;
  const n = `"${name}"`;
  const queries = [
    ...buildQueries(args),
    `${n} sanctions OFAC asset freeze designated embargo sanctioned`,
    `${n} indictment charged prosecuted convicted arrested criminal case`,
    `${n} regulator enforcement action fine penalty settlement probe`,
    `${n} bribery kickback embezzlement abuse of office corruption`,
    `${n} offshore shell company Panama Papers Pandora Papers leaked`,
    `${n} lawsuit litigation court ruling allegations misconduct`,
  ];
  if (company) {
    queries.push(`"${company}" fraud investigation sanctions lawsuit scandal`);
  }
  return [...new Set(queries.map((q) => q.trim()).filter(Boolean))];
}

/** Run `fn` over `items` with a bounded number of in-flight calls. */
async function mapPool<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

/** Run an explicit list of queries, merge and dedupe by URL (highest score wins).
 * Bounded concurrency avoids rate-limit bursts; per-query failures degrade to [] but
 * are logged so a throttled/empty query is visible rather than silently lost. */
export async function searchQueries(
  queries: string[],
  opts: {
    apiKey?: string;
    country?: string;
    timeoutMs?: number;
    maxResults?: number;
    concurrency?: number;
  } = {},
): Promise<SearchHit[]> {
  const apiKey = opts.apiKey ?? process.env.TAVILY_API_KEY ?? '';
  if (!apiKey) throw new TavilyError('TAVILY_API_KEY is not set', 0);
  const timeoutMs = opts.timeoutMs ?? 15_000;
  const maxResults = opts.maxResults ?? 5;
  const concurrency = opts.concurrency ?? 5;

  let failures = 0;
  const results = await mapPool(queries, concurrency, (q) =>
    call(q, apiKey, opts.country, timeoutMs, maxResults).catch((err) => {
      failures++;
      console.warn(`[tavily] query failed: ${q.slice(0, 70)} — ${err instanceof Error ? err.message : err}`);
      return [] as SearchHit[];
    }),
  );

  const byUrl = new Map<string, SearchHit>();
  for (const hit of results.flat()) {
    const prev = byUrl.get(hit.link);
    if (!prev || (hit.score ?? 0) > (prev.score ?? 0)) byUrl.set(hit.link, hit);
  }
  if (failures) console.warn(`[tavily] ${failures}/${queries.length} queries failed`);
  return [...byUrl.values()];
}

/** Baseline search for a subject (kept for callers/tests that don't need deep mode). */
export async function searchWeb(
  args: { name: string; company?: string; country?: string; freeText?: string },
  opts: { apiKey?: string; country?: string; timeoutMs?: number; maxResults?: number } = {},
): Promise<SearchHit[]> {
  return searchQueries(buildQueries(args), opts);
}
