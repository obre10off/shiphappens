import { describe, expect, it } from 'vitest';
import { parseChunk } from './useScreening';
import type { ScreenEvent } from '@/lib/contracts/types';

describe('parseChunk', () => {
  it('parses complete NDJSON lines and buffers the partial remainder', () => {
    const a: ScreenEvent = { type: 'phase', phase: 'sanctions', status: 'start' };
    const b: ScreenEvent = { type: 'phase', phase: 'sanctions', status: 'done', matches: 1 };
    const buffer = JSON.stringify(a) + '\n' + JSON.stringify(b) + '\n' + '{"type":"phase"';

    const { events, rest } = parseChunk(buffer);
    expect(events).toEqual([a, b]);
    expect(rest).toBe('{"type":"phase"');
  });

  it('reassembles an event split across two chunks', () => {
    const evt: ScreenEvent = { type: 'error', message: 'boom' };
    const full = JSON.stringify(evt) + '\n';
    const mid = Math.floor(full.length / 2);

    const first = parseChunk(full.slice(0, mid));
    expect(first.events).toEqual([]);

    const second = parseChunk(first.rest + full.slice(mid));
    expect(second.events).toEqual([evt]);
  });

  it('ignores blank and malformed lines', () => {
    const { events } = parseChunk('\n  \nnot json\n');
    expect(events).toEqual([]);
  });
});
