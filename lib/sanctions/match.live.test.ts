// Live test — hits the real OpenSanctions API. Run with: npm run test:live
// Skipped automatically when OPENSANCTIONS_API_KEY is absent.

import { describe, expect, it } from 'vitest';
import { searchSanctions } from './match';

const hasKey = !!process.env.OPENSANCTIONS_API_KEY;
const d = hasKey ? describe : describe.skip;

d('searchSanctions (live)', () => {
  it('a known sanctioned figure → isSanctioned, bestScore > 0.8', async () => {
    const res = await searchSanctions({
      name: 'Viktor Yanukovych',
      country: 'Ukraine',
      dateOfBirth: '1950-07-09',
    });
    console.log('Yanukovych:', JSON.stringify(res, null, 2));
    expect(res.error).toBeUndefined();
    expect(res.isSanctioned).toBe(true);
    expect(res.bestScore).toBeGreaterThan(0.8);
  }, 20_000);

  it('a random clean name → totalMatches 0', async () => {
    const res = await searchSanctions({ name: 'Asdf Qwerty Zxcvb', country: 'Bulgaria' });
    expect(res.totalMatches).toBe(0);
  }, 20_000);
});
