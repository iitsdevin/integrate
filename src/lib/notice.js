// Small, kind things the app can say from your own records, with nothing sent anywhere:
// the daily thread on Today, the welcome back after a gap, and a line after a check-in.
import { localDate, dayDiff } from './store.js';

const DAY = 864e5;
const daysAgo = (iso, now) => (now - new Date(iso)) / DAY;

// Days since the last sit, or null if there are none. Used only to choose a gentler
// Today; the number itself is never shown.
export function gapDays(sits, today = localDate()) {
  if (!sits.length) return null;
  return dayDiff(localDate(new Date(sits[sits.length - 1].at)), today);
}

// One thing for today, the same all day and different tomorrow. It rotates between a
// seed from a reading, a "try this", and a note of your own from a few weeks back.
export function dailyThread({ journal = [], readings = [] }, now = new Date()) {
  const day = dayDiff('2026-01-01', localDate(now));
  const pick = (list) => list[((day * 2654435761) >>> 0) % list.length];
  const seeds = readings.filter((r) => r.seed);
  const tries = readings.filter((r) => r.practice);
  const own = journal.filter((j) => j.text && j.kind !== 'round' && j.text.length >= 30 && j.text.length <= 420 && daysAgo(j.at, now) >= 21 && !/^ACT for ADHD/.test(j.text));
  const kinds = [];
  if (seeds.length) kinds.push(() => { const r = pick(seeds); return { kind: 'reading', label: `${r.title} · ${r.author}`, text: r.seed, view: r.categoryId }; });
  if (own.length) kinds.push(() => { const j = pick(own); return { kind: 'journal', label: 'You wrote, ' + new Date(j.at).toLocaleDateString('en-AU', { day: 'numeric', month: 'long' }), text: j.text }; });
  if (tries.length) kinds.push(() => { const r = pick(tries); return { kind: 'try', label: `Try this · from ${r.title}`, text: r.practice, view: r.categoryId }; });
  if (!kinds.length) return null;
  return kinds[((day % kinds.length) + kinds.length) % kinds.length]();
}

// One plain observation after a weekly check-in. Describes, never scolds; null if
// there is nothing worth saying.
export function observe({ sits = [], checkins = {} }, now = new Date()) {
  const week = sits.filter((s) => { const d = daysAgo(s.at, now); return d >= 0 && d <= 7; });
  const felt = week.filter((s) => s.feel);
  if (felt.length >= 3) {
    const counts = {};
    for (const s of felt) counts[s.feel] = (counts[s.feel] || 0) + 1;
    const [feel, n] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    if (feel !== 'okay' && n >= 3 && n / felt.length >= 0.6) return `You arrived ${feel} for ${n} of your last ${felt.length} sits, and sat anyway.`;
  }
  const rough = week.filter((s) => s.rough).length;
  if (rough >= 2) return `${rough} sits this week turned rough and you rested instead of pushing through. That is the practice working.`;
  const scored = Object.values(checkins).filter((c) => c.at).sort((a, b) => (a.at < b.at ? -1 : 1));
  if (scored.length >= 2) {
    const [prev, last] = scored.slice(-2);
    for (const [k, word] of [['settled', 'Settled'], ['connected', 'Connected']]) {
      if (prev[k] != null && last[k] != null && Math.abs(last[k] - prev[k]) >= 2) return `${word} moved from ${prev[k]} to ${last[k]} since your last check-in.`;
    }
  }
  if (!week.length) return 'A quiet week, and you still checked in. That is coming back.';
  if (felt.length >= 3 && felt.every((s) => s.feel === 'okay')) return `${week.length} sits this week, and you arrived okay each time you checked.`;
  return `You sat ${week.length} ${week.length === 1 ? 'time' : 'times'} this week.`;
}
