import { describe, it, expect } from 'vitest';
import { total, locate, restPlan } from '../src/lib/sit.js';
import { dailySit } from '../src/data/daily.js';

const sit = dailySit('shake'); // 3 + 14 + 3

describe('sit timing', () => {
  it('adds up the phases in seconds', () => expect(total(sit.phases)).toBe(20 * 60));
  it('uses custom lengths', () => expect(total(dailySit('shake', { connect: 2, dive: 20, integrate: 5 }).phases)).toBe(27 * 60));
  it('finds the phase for a moment in the sit', () => {
    expect(locate(sit, 0)).toEqual({ idx: 0, acc: 0 });
    expect(locate(sit, 179.9).idx).toBe(0);
    expect(locate(sit, 180)).toEqual({ idx: 1, acc: 180 });
    expect(locate(sit, 17 * 60)).toEqual({ idx: 2, acc: 17 * 60 });
  });
  it('stays on the last phase after the end', () => expect(locate(sit, 99999).idx).toBe(2));
  it('a rough sit keeps what was done and adds a rest', () => {
    const r = restPlan(sit, 180 + 240, 'rest'); // four minutes into Dive
    expect(r.rough).toBe(true);
    expect(r.phases.map((p) => p.label)).toEqual(['Connect', 'Dive', 'Rest']);
    expect(r.phases[1].min).toBeCloseTo(4);
    expect(r.idx).toBe(2);
    expect(locate(r, 180 + 240 + 1).idx).toBe(2);
  });
});
