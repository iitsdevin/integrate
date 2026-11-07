// Dev-only datasets for stress-testing the UI (?data=worst|empty|one). Never shipped.
const iso = (daysAgo, h = 7, m = 12) => { const d = new Date(); d.setDate(d.getDate() - daysAgo); d.setHours(h, m, 0, 0); return d.toISOString(); };

export function fixture(kind, base) {
  if (kind === 'empty') return { ...base, sits: [], journal: [], checkins: {}, plan: null };
  if (kind === 'one') {
    return { ...base,
      sits: [{ id: 's1', at: iso(0), kind: 'daily', label: 'Body, Mantra, Open', minutes: 1, done: false, feel: 'okay' }],
      journal: [{ id: 'j1', at: iso(0), kind: 'sit', sitId: 's1', text: 'Short.' }],
      checkins: { W1: { back: true, settled: 0, connected: 10, at: iso(0) } },
      plan: { title: '1 week', summary: 'One thing.', items: [{ label: 'Daily', text: 'Sit.' }], weeks: 1, from: '2026-11-07', to: '2026-11-13', source: 'buddy' },
    };
  }
  // worst: realistic extremes, spread across the first rows
  const sits = [];
  for (let i = 0; i < 1284; i++) {
    const day = Math.floor(i / 2);
    sits.push({ id: 'w' + i, at: iso(day + 1, i % 2 ? 15 : 6, (i * 7) % 60), kind: i % 9 === 0 ? 'kriya' : 'daily',
      label: i % 9 === 0 ? `Jacqui's Kriya, day ${(i % 15) + 1}` : i % 5 === 0 ? 'Sat without the timer' : 'Body, Mantra, Open',
      minutes: i % 5 === 0 ? 0 : i % 7 === 0 ? 1 : 20, done: i % 3 !== 0, rough: i % 11 === 0, feel: ['wired', 'flat', 'foggy', 'okay', null][i % 5],
      bodyName: i % 4 === 0 ? 'Slow walking or long exhales' : 'Shake, Touch, Settle' });
  }
  sits.push({ id: 'today', at: iso(0, 5, 2), kind: 'daily', label: 'Body, Mantra, Open', minutes: 20, done: true, feel: 'wired' });
  const long = 'Woke at 4:50 with the heart going. '.repeat(3) + 'The mantra kept turning into a to-do list, so I let it be a to-do list for a while and then came back. Around minute nine there was a moment where the sound of the fridge and the magpies outside and the breath were all the same thing, and then it was gone, and I tried to get it back, which of course pushed it further away. Joko Beck would say: just this. '.repeat(5);
  const journal = [
    { id: 'n1', at: iso(0, 5, 30), kind: 'sit', sitId: 'today', text: long },
    { id: 'n2', at: iso(0, 9, 1), kind: 'note', text: 'Link for later: https://example.com/workspaces/practice/recordings/euphemia-russell/microdosing-pleasure/grounding-into-yourself-and-the-land-10min-final-v2.mp3?download=1&ref=membership' },
    { id: 'n3', at: iso(1, 21, 40), kind: 'note', text: '👩🏽‍💻 Benachrichtigungseinstellungen off.\nLine two.\n\n\nLine five after blank lines.' },
    { id: 'n4', at: iso(2, 12, 0), kind: 'note', text: '<script>alert(1)</script> &amp; **not bold**' },
    { id: 'n5', at: iso(3, 8, 0), kind: 'note', text: 'J' },
  ];
  const checkins = {};
  for (let w = 1; w <= 12; w++) checkins['W' + w] = { back: w % 3 !== 0, settled: w % 11, connected: 10 - (w % 11), at: iso(w * 7, 19, 0) };
  return {
    ...base, sits, journal, checkins,
    plan: { id: 'p', title: 'Weeks 2–3 — gentler, with more ground on foggy days and one long walk', weeks: 2, from: '2026-11-07', to: '2026-11-20', source: 'buddy',
      summary: 'Keep Body, Mantra, Open every morning before the phone; on foggy days start with Five Senses and use Feet, Weight, Earth as the Body phase, and take one forty-minute walk with Om Mani Padme Hum at the weekend.',
      items: Array.from({ length: 9 }, (_, i) => ({ label: ['Daily', 'Foggy days', 'Wired days', 'Weekly', 'Reading', 'Second sit', 'Evening', 'Rules', 'Benachrichtigungseinstellungen'][i], text: 'A realistic, fairly long instruction the buddy might write, including a citation like (Nothing Special: Living Zen, p. 112) and a specific time window such as 3:30–4:00pm.' })) },
    settings: { ...base.settings, aboutMe: 'x'.repeat(0) + 'Long about-me text. '.repeat(40) },
    buddy: { sessions: [{ id: 'b1', at: iso(0), title: 'Can you look at the last three weeks and tell me honestly whether the second sit is helping or just another thing I feel guilty about?', display: [], api: [] }] },
  };
}
