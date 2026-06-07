import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildDeepQueries, buildQueries, searchWeb } from './tavily';

beforeEach(() => {
  process.env.TAVILY_API_KEY = 'tvly-test';
});
afterEach(() => vi.restoreAllMocks());

describe('buildQueries', () => {
  it('always includes the adverse-keyword query; adds company/country/freeText', () => {
    const qs = buildQueries({ name: 'Jane Doe', company: 'Acme', country: 'Bulgaria', freeText: 'bribery' });
    expect(qs[0]).toContain('"Jane Doe"');
    expect(qs[0]).toContain('money laundering');
    expect(qs.some((q) => q.includes('"Acme"'))).toBe(true);
    expect(qs.some((q) => q.includes('Bulgaria'))).toBe(true);
    expect(qs.some((q) => q.includes('bribery'))).toBe(true);
  });

  it('omits optional queries when fields absent', () => {
    const qs = buildQueries({ name: 'Jane Doe' });
    expect(qs).toHaveLength(1);
  });
});

describe('buildDeepQueries', () => {
  it('covers many adverse angles and is deduped', () => {
    const qs = buildDeepQueries({ name: 'Jane Doe', country: 'Bulgaria' });
    expect(qs.length).toBeGreaterThan(5);
    expect(new Set(qs).size).toBe(qs.length); // no dupes
    expect(qs.every((q) => q.includes('"Jane Doe"'))).toBe(true);
    expect(qs.some((q) => q.includes('OFAC'))).toBe(true);
    expect(qs.some((q) => q.includes('indictment'))).toBe(true);
  });

  it('adds a company-focused query when a company is given', () => {
    const qs = buildDeepQueries({ name: 'Jane Doe', country: 'Bulgaria', company: 'Acme' });
    expect(qs.some((q) => q.includes('"Acme"'))).toBe(true);
  });
});

describe('searchWeb', () => {
  it('normalizes hits and dedupes by URL (keeping highest score)', async () => {
    const page = (results: unknown[]) => ({
      ok: true,
      status: 200,
      json: async () => ({ results }),
      text: async () => '',
    });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        page([
          { title: 'A', url: 'https://x.com/a', content: 'sa', score: 0.5, published_date: '2023-01-01' },
          { title: 'B', url: 'https://x.com/b', content: 'sb', score: 0.9 },
        ]),
      )
      .mockResolvedValue(page([{ title: 'A2', url: 'https://x.com/a', content: 'sa2', score: 0.8 }]));
    vi.stubGlobal('fetch', fetchMock);

    const hits = await searchWeb({ name: 'Jane Doe', country: 'Bulgaria' });
    const a = hits.find((h) => h.link === 'https://x.com/a');
    expect(hits).toHaveLength(2); // a (deduped) + b
    expect(a?.snippet).toBe('sa2'); // higher score wins
  });

  it('throws when API key is missing', async () => {
    delete process.env.TAVILY_API_KEY;
    await expect(searchWeb({ name: 'Jane Doe' })).rejects.toThrow(/TAVILY_API_KEY/);
  });
});
