import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildQuery, searchSanctions } from './match';
import { toIso2 } from './countries';
import { aggregate, mapEntity } from './map';

function mockFetchOnce(body: unknown, ok = true, status = 200) {
  return vi.fn().mockResolvedValue({
    ok,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  });
}

const sanctionedEntity = {
  id: 'Q1090',
  caption: 'Viktor Yanukovych',
  schema: 'Person',
  score: 0.95,
  match: true,
  datasets: ['us_ofac_sdn', 'eu_fsf'],
  topics: ['sanction', 'role.pep'],
  properties: { birthDate: ['1950-07-09'] },
};

beforeEach(() => {
  process.env.OPENSANCTIONS_API_KEY = 'test-key';
});
afterEach(() => {
  vi.restoreAllMocks();
});

describe('buildQuery', () => {
  it('builds a Person query with name + country, omits birthDate when absent', () => {
    const q = buildQuery({ name: 'John Doe', country: 'Ukraine' }) as any;
    expect(q.queries.q1.schema).toBe('Person');
    expect(q.queries.q1.properties.name).toEqual(['John Doe']);
    expect(q.queries.q1.properties.country).toEqual(['ua']);
    expect(q.queries.q1.properties.birthDate).toBeUndefined();
    expect(q.queries.q2).toBeUndefined();
  });

  it('adds an Organization query when company is set', () => {
    const q = buildQuery({ name: 'John Doe', country: 'Bulgaria', company: 'Acme Ltd' }) as any;
    expect(q.queries.q2.schema).toBe('Organization');
    expect(q.queries.q2.properties.name).toEqual(['Acme Ltd']);
  });
});

describe('country mapping', () => {
  it('maps display name → ISO-2', () => {
    expect(toIso2('Ukraine')).toBe('ua');
    expect(toIso2('United States')).toBe('us');
    expect(toIso2('bg')).toBe('bg');
    expect(toIso2(undefined)).toBeUndefined();
  });
});

describe('map + aggregate', () => {
  it('sanctioned result → isSanctioned, datasetsHit, sourceUrl', () => {
    const res = aggregate([mapEntity(sanctionedEntity)], 'default');
    expect(res.isSanctioned).toBe(true);
    expect(res.isPep).toBe(true);
    expect(res.datasetsHit).toEqual(['us_ofac_sdn', 'eu_fsf']);
    expect(res.matches[0].sourceUrl).toBe('https://www.opensanctions.org/entities/Q1090/');
  });

  it('reads topics from properties.topics when the top-level field is empty', () => {
    const fromProps = {
      ...sanctionedEntity,
      topics: [],
      properties: { topics: ['role.pep', 'sanction'] },
    };
    const res = aggregate([mapEntity(fromProps)], 'default');
    expect(res.isSanctioned).toBe(true);
    expect(res.isPep).toBe(true);
  });

  it('PEP-only → isPep true, isSanctioned false', () => {
    const pep = { ...sanctionedEntity, topics: ['role.pep'] };
    const res = aggregate([mapEntity(pep)], 'default');
    expect(res.isPep).toBe(true);
    expect(res.isSanctioned).toBe(false);
  });

  it('bestScore = max across results; near-misses kept with match:false', () => {
    const near = { ...sanctionedEntity, id: 'Q2', score: 0.4, match: false, topics: [] };
    const res = aggregate([mapEntity(sanctionedEntity), mapEntity(near)], 'default');
    expect(res.bestScore).toBe(0.95);
    expect(res.totalMatches).toBe(1); // only the matched one counts
    expect(res.matches).toHaveLength(2);
    expect(res.matches.find((m) => m.id === 'Q2')?.match).toBe(false);
  });
});

describe('searchSanctions', () => {
  it('maps a live-shaped response into a SanctionsResult', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetchOnce({ responses: { q1: { results: [sanctionedEntity], total: { value: 1 } } } }),
    );
    const res = await searchSanctions({ name: 'Viktor Yanukovych', country: 'Ukraine' });
    expect(res.isSanctioned).toBe(true);
    expect(res.bestScore).toBeCloseTo(0.95);
    expect(res.error).toBeUndefined();
  });

  it('clean name → totalMatches 0', async () => {
    vi.stubGlobal('fetch', mockFetchOnce({ responses: { q1: { results: [], total: { value: 0 } } } }));
    const res = await searchSanctions({ name: 'Asdf Qwerty', country: 'Bulgaria' });
    expect(res.totalMatches).toBe(0);
    expect(res.isSanctioned).toBe(false);
  });

  it('on 500 → returns error set, empty matches, never throws', async () => {
    // 5xx twice (retry also fails) → caught → error result
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 500, text: async () => 'boom', json: async () => ({}) }),
    );
    const res = await searchSanctions({ name: 'X', country: 'Ukraine' });
    expect(res.error).toBeDefined();
    expect(res.matches).toEqual([]);
  });

  it('on network error → returns error set, never throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));
    const res = await searchSanctions({ name: 'X', country: 'Ukraine' });
    expect(res.error).toContain('network down');
  });
});
