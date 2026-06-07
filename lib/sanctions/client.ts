// lib/sanctions/client.ts
// Low-level HTTP client for api.opensanctions.org. Thin wrapper around fetch with
// auth, timeout, and one retry on 5xx / network errors.

export const OPENSANCTIONS_BASE = 'https://api.opensanctions.org';

export class OpenSanctionsError extends Error {
  status: number;
  body: string;
  constructor(message: string, status: number, body: string) {
    super(message);
    this.name = 'OpenSanctionsError';
    this.status = status;
    this.body = body;
  }
}

interface PostOptions {
  scope: string;
  query: Record<string, unknown>;
  search?: Record<string, string>;
  apiKey?: string;
  timeoutMs?: number;
}

async function once(url: string, body: string, apiKey: string, timeoutMs: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `ApiKey ${apiKey}`,
      },
      body,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

/** POST /match/{scope}. Retries once on network error or 5xx. Throws OpenSanctionsError on non-2xx. */
export async function matchRequest<T = unknown>({
  scope,
  query,
  search = { algorithm: 'best', limit: '5' },
  apiKey = process.env.OPENSANCTIONS_API_KEY ?? '',
  timeoutMs = 10_000,
}: PostOptions): Promise<T> {
  const params = new URLSearchParams(search).toString();
  const url = `${OPENSANCTIONS_BASE}/match/${encodeURIComponent(scope)}?${params}`;
  const body = JSON.stringify(query);

  let lastErr: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await once(url, body, apiKey, timeoutMs);
      if (res.ok) return (await res.json()) as T;
      const text = await res.text().catch(() => '');
      if (res.status >= 500 && attempt === 0) {
        lastErr = new OpenSanctionsError(`HTTP ${res.status}`, res.status, text);
        continue; // retry 5xx once
      }
      throw new OpenSanctionsError(`OpenSanctions ${res.status}`, res.status, text);
    } catch (err) {
      if (err instanceof OpenSanctionsError && err.status < 500) throw err;
      lastErr = err;
      if (attempt === 0) continue; // retry network/abort once
      throw err;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('OpenSanctions request failed');
}
