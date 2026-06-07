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
): Promise<SearchHit[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const body: Record<string, unknown> = {
    query,
    search_depth: 'advanced',
    topic: 'general',
    max_results: 5,
    include_answer: false,
  };
  // Tavily's `country` expects a full lowercase country name (e.g. "bulgaria"),
  // NOT an ISO code — an invalid value returns HTTP 400. We retry without it below.
  if (country) body.country = country.toLowerCase();

  try {
    let res: Response | undefined;
    for (let attempt = 0; attempt < 2; attempt++) {
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
        // An unrecognized country yields 400 — drop it and retry once unfiltered.
        if (res.status === 400 && body.country && attempt === 0) {
          delete body.country;
          continue;
        }
        if (res.status >= 500 && attempt === 0) continue;
        throw new TavilyError(`Tavily ${res.status}`, res.status);
      } catch (err) {
        if (err instanceof TavilyError) throw err;
        if (attempt === 0) continue;
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

/** Build the targeted adverse-media queries for a subject. */
export function buildQueries(args: {
  name: string;
  company?: string;
  country?: string;
  freeText?: string;
}): string[] {
  const { name, company, country, freeText } = args;
  const queries = [
    `"${name}" (fraud OR corruption OR "money laundering" OR sanctions OR investigation OR arrested OR lawsuit)`,
  ];
  if (company) queries.push(`"${name}" "${company}"`);
  if (country) queries.push(`"${name}" ${country}`);
  if (freeText && freeText.trim()) queries.push(`"${name}" ${freeText.trim().slice(0, 120)}`);
  return queries;
}

/** Run all queries, merge and dedupe by URL (keeping the highest-scored hit). */
export async function searchWeb(
  args: { name: string; company?: string; country?: string; freeText?: string },
  opts: { apiKey?: string; country?: string; timeoutMs?: number } = {},
): Promise<SearchHit[]> {
  const apiKey = opts.apiKey ?? process.env.TAVILY_API_KEY ?? '';
  if (!apiKey) throw new TavilyError('TAVILY_API_KEY is not set', 0);
  const timeoutMs = opts.timeoutMs ?? 10_000;

  const queries = buildQueries(args);
  const results = await Promise.all(
    queries.map((q) => call(q, apiKey, opts.country, timeoutMs).catch(() => [] as SearchHit[])),
  );

  const byUrl = new Map<string, SearchHit>();
  for (const hit of results.flat()) {
    const prev = byUrl.get(hit.link);
    if (!prev || (hit.score ?? 0) > (prev.score ?? 0)) byUrl.set(hit.link, hit);
  }
  return [...byUrl.values()];
}
