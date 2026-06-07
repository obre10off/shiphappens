import { describe, expect, it } from 'vitest';
import { normalizeName, scoreNames, searchEuSanctions } from './match';

describe('normalizeName', () => {
  it('lowercases, strips diacritics + punctuation, collapses whitespace', () => {
    expect(normalizeName('  Saddam   HUSSEIN  ')).toBe('saddam hussein');
    expect(normalizeName('Aliaksándr Łukashénka')).toBe('aliaksandr lukashenka');
  });
});

describe('scoreNames', () => {
  it('exact normalized match scores 1', () => {
    expect(scoreNames('Saddam Hussein', 'saddam  hussein')).toBe(1);
  });
  it('no shared tokens scores 0', () => {
    expect(scoreNames('Jane Doe', 'Saddam Hussein')).toBe(0);
  });
  it('partial overlap is between 0 and 1', () => {
    const s = scoreNames('Saddam Hussein', 'Saddam Hussein Al-Tikriti');
    expect(s).toBeGreaterThan(0.5);
    expect(s).toBeLessThan(1);
  });
});

describe('searchEuSanctions', () => {
  it('finds a known listed individual (alias exact match) and flags it as listed', () => {
    const res = searchEuSanctions({ name: 'Saddam Hussein Al-Tikriti', country: 'Iraq' });
    expect(res.error).toBeUndefined();
    expect(res.isListed).toBe(true);
    expect(res.bestScore).toBeGreaterThanOrEqual(0.9);
    const top = res.matches[0];
    expect(top.sourceUrl).toMatch(/eusanctionstracker\/subjects\//);
    expect(top.regime).toBeTruthy();
  });

  it('returns no matches for an obvious non-entity', () => {
    const res = searchEuSanctions({ name: 'Zxqw Nonexistent Personname', country: 'Germany' });
    expect(res.totalMatches).toBe(0);
    expect(res.isListed).toBe(false);
    expect(res.bestScore).toBe(0);
  });
});
