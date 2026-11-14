import { describe, it, expect } from 'vitest';
import { planWeek, checkinKey, checkinWeek } from '../src/lib/backup.js';
import { DEFAULT_PLAN } from '../src/data/daily.js';

describe('plan weeks', () => {
  it('counts weeks of the built-in plan from its start', () => {
    expect(planWeek(DEFAULT_PLAN, '2026-11-05')).toBe(1);
    expect(planWeek(DEFAULT_PLAN, '2026-11-11')).toBe(1);
    expect(planWeek(DEFAULT_PLAN, '2026-11-12')).toBe(2);
    expect(planWeek(DEFAULT_PLAN, '2026-12-30')).toBe(8);
  });
  it('is null before the plan starts and after it ends', () => {
    expect(planWeek(DEFAULT_PLAN, '2026-11-04')).toBeNull();
    expect(planWeek(DEFAULT_PLAN, '2026-12-31')).toBeNull();
    expect(planWeek(DEFAULT_PLAN, '2027-03-01')).toBeNull();
  });
  it("counts a buddy plan from that plan's own start", () => {
    const p = { id: 'toolu_1', from: '2027-01-04', to: '2027-01-17', weeks: 2, source: 'buddy' };
    expect(planWeek(p, '2027-01-04')).toBe(1);
    expect(planWeek(p, '2027-01-12')).toBe(2);
    expect(planWeek(p, '2027-01-18')).toBeNull();
  });
  it('keeps the old keys for the built-in plan and separates other plans', () => {
    expect(checkinKey(DEFAULT_PLAN, 3)).toBe('W3');
    expect(checkinKey(null, 3)).toBe('W3');
    expect(checkinKey({ id: 'toolu_1', source: 'buddy' }, 1)).toBe('toolu_1:W1');
    expect(checkinWeek('W3')).toBe('3');
    expect(checkinWeek('toolu_1:W12')).toBe('12');
  });
});
