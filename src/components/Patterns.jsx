// What the practice has looked like lately. Counts and shapes, never streaks:
// a quiet week is shown as a quiet week, not as a broken chain.
import { useMemo, useState } from 'react';
import { localDate } from '../lib/store.js';
import { checkinWeek } from '../lib/backup.js';

const DAY = 864e5;
const mondayOf = (d) => { const x = new Date(d); x.setHours(12, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };
const dayMonth = (d) => d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
const FEEL_ROWS = [['okay', 'Okay'], ['wired', 'Wired'], ['flat', 'Flat'], ['foggy', 'Foggy']];
const PARTS = [[4, 11, 'in the morning'], [11, 15, 'around the middle of the day'], [15, 19, 'in the late afternoon'], [19, 28, 'in the evening']];

export function summarise(sits, checkins, now = new Date(), weeks = 8) {
  const thisMon = mondayOf(now);
  const buckets = Array.from({ length: weeks }, (_, i) => {
    const start = new Date(thisMon.getTime() - (weeks - 1 - i) * 7 * DAY);
    return { start, key: localDate(start), count: 0, minutes: 0 };
  });
  const byKey = Object.fromEntries(buckets.map((b) => [b.key, b]));
  const feels = { okay: 0, wired: 0, flat: 0, foggy: 0 };
  const after = { okay: 0, wired: 0, flat: 0, foggy: 0 };
  const shift = { both: 0, hard: 0, eased: 0 }; // sits with a before and an after; arrived not-okay; of those, left okay
  const parts = PARTS.map(() => 0);
  let recent = 0;
  for (const s of sits) {
    const at = new Date(s.at);
    const b = byKey[localDate(mondayOf(at))];
    if (!b) continue;
    recent++;
    b.count++; b.minutes += s.minutes || 0;
    if (s.feel && feels[s.feel] !== undefined) feels[s.feel]++;
    if (s.feelAfter && after[s.feelAfter] !== undefined) after[s.feelAfter]++;
    if (s.feel && s.feelAfter) { shift.both++; if (s.feel !== 'okay') { shift.hard++; if (s.feelAfter === 'okay') shift.eased++; } }
    if (s.kind !== 'manual') { const h = at.getHours() < 4 ? at.getHours() + 24 : at.getHours(); const i = PARTS.findIndex(([a, z]) => h >= a && h < z); if (i >= 0) parts[i]++; }
  }
  const top = parts.indexOf(Math.max(...parts));
  const scored = Object.entries(checkins || {}).filter(([, c]) => c.at).sort((a, b) => (a[1].at < b[1].at ? -1 : 1)).slice(-10)
    .map(([k, c]) => ({ week: checkinWeek(k), at: c.at, settled: c.settled, connected: c.connected, back: !!c.back }));
  return { buckets, feels, after, shift, recent, usual: parts[top] >= 3 && parts[top] >= recent * 0.5 ? PARTS[top][2] : null, checkins: scored };
}

function FeelRows({ counts, max }) {
  return (
    <div className="feel-rows">
      {FEEL_ROWS.map(([id, name]) => (
        <div key={id} className="feel-row">
          <span>{name}</span>
          <span className="feel-track"><i style={{ width: `${(counts[id] / Math.max(1, max)) * 100}%` }} /></span>
          <span className="mono">{counts[id]}</span>
        </div>
      ))}
    </div>
  );
}

function WeekBars({ buckets }) {
  const [sel, setSel] = useState(buckets.length - 1);
  const W = 320, H = 132, base = 104, top = 14, n = buckets.length, slot = W / n, bw = slot - 8;
  const max = Math.max(7, ...buckets.map((b) => b.count));
  const y = (v) => base - (v / max) * (base - top);
  const b = buckets[sel];
  return (
    <div className="stack" style={{ gap: 6 }}>
      <p className="mono" role="status">Week of {dayMonth(b.start)} · <b>{b.count} {b.count === 1 ? 'sit' : 'sits'}</b>{b.minutes ? ` · ${b.minutes} min` : ''}</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="group" aria-label="Sits in each of the last eight weeks">
        <line x1="0" x2={W} y1={y(max)} y2={y(max)} className="chart-grid" />
        <text x={W} y={y(max) - 4} textAnchor="end" className="chart-tick">{max}</text>
        <line x1="0" x2={W} y1={base} y2={base} className="chart-axis" />
        {buckets.map((w, i) => (
          <g key={w.key} tabIndex={0} role="img" aria-label={`Week of ${dayMonth(w.start)}: ${w.count} sits`} className="chart-col" data-on={i === sel || undefined}
            onPointerEnter={() => setSel(i)} onPointerDown={() => setSel(i)} onFocus={() => setSel(i)}>
            <rect x={i * slot} y="0" width={slot} height={H} fill="transparent" />
            {w.count > 0
              ? <rect x={i * slot + 4} y={y(w.count)} width={bw} height={base - y(w.count)} className="chart-bar" />
              : <rect x={i * slot + 4} y={base - 2} width={bw} height="2" className="chart-zero" />}
            <text x={i * slot + slot / 2} y={H - 10} textAnchor="middle" className="chart-tick">{i === n - 1 ? 'now' : w.start.getDate()}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function Trend({ label, points, values }) {
  const W = 320, H = 64, l = 8, r = 312, t = 10, b = 50;
  const x = (i) => (points.length === 1 ? (l + r) / 2 : l + (i / (points.length - 1)) * (r - l));
  const y = (v) => b - (v / 10) * (b - t);
  const pts = values.map((v, i) => (v == null ? null : [x(i), y(v)]));
  const path = pts.filter(Boolean).map(([px, py], i) => `${i ? 'L' : 'M'}${px.toFixed(1)} ${py.toFixed(1)}`).join(' ');
  const last = [...values].reverse().find((v) => v != null);
  return (
    <div>
      <p className="between mono"><span className="caps">{label}</span><span>{last == null ? 'not scored' : `latest ${last}/10`}</span></p>
      <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label={`${label}, 0 to 10, by check-in: ${values.map((v, i) => `week ${points[i].week} ${v == null ? 'not scored' : v}`).join(', ')}`}>
        <line x1="0" x2={W} y1={y(10)} y2={y(10)} className="chart-grid" />
        <line x1="0" x2={W} y1={y(5)} y2={y(5)} className="chart-grid" />
        <line x1="0" x2={W} y1={y(0)} y2={y(0)} className="chart-axis" />
        <path d={path} className="chart-line" />
        {pts.map((p, i) => p && <rect key={i} x={p[0] - 4} y={p[1] - 4} width="8" height="8" className="chart-dot" />)}
        {/* Label only as many weeks as fit: all of a few, else first, middle and last. */}
        {points.map((p, i) => (points.length <= 5 || i === 0 || i === points.length - 1 || i === Math.floor((points.length - 1) / 2)) && <text key={i} x={x(i)} y={H - 2} textAnchor={i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle'} className="chart-tick">wk {p.week}</text>)}
      </svg>
    </div>
  );
}

export default function Patterns({ sits, checkins }) {
  const p = useMemo(() => summarise(sits, checkins), [sits, checkins]);
  const feelMax = Math.max(1, ...Object.values(p.feels));
  const feelTotal = Object.values(p.feels).reduce((a, b) => a + b, 0);
  const afterTotal = Object.values(p.after).reduce((a, b) => a + b, 0);
  const bothMax = Math.max(feelMax, ...Object.values(p.after));
  if (!sits.length) return <p className="soft">Once you have a few sits recorded, this shows what your weeks have looked like.</p>;
  return (
    <div className="stack" style={{ gap: 22 }}>
      <section className="stack" style={{ gap: 8 }} aria-labelledby="ptWeeks">
        <h3 id="ptWeeks" className="mono caps">Sits per week · last 8 weeks</h3>
        <WeekBars buckets={p.buckets} />
        <p className="soft" style={{ fontSize: '0.9375rem' }}>
          {p.recent} {p.recent === 1 ? 'sit' : 'sits'} in these eight weeks{p.usual ? `, most often ${p.usual}` : ''}. Quiet weeks are part of it; coming back is the practice.
        </p>
        <details className="wb-details">
          <summary className="mono caps">Show as a table</summary>
          <table className="chart-table">
            <thead><tr><th scope="col">Week of</th><th scope="col">Sits</th><th scope="col">Minutes</th></tr></thead>
            <tbody>{p.buckets.map((w) => <tr key={w.key}><th scope="row">{dayMonth(w.start)}</th><td>{w.count}</td><td>{w.minutes}</td></tr>)}</tbody>
          </table>
        </details>
      </section>

      {(feelTotal > 0 || afterTotal > 0) && (
        <section className="stack" style={{ gap: 8 }} aria-labelledby="ptFeel">
          <h3 id="ptFeel" className="mono caps">How you arrived · last 8 weeks</h3>
          <FeelRows counts={p.feels} max={afterTotal ? bothMax : feelMax} />
          <p className="hint">From the check-in before a sit. Sits with no check-in are left out.</p>
          {afterTotal > 0 && (
            <>
              <h3 className="mono caps" style={{ marginTop: 10 }}>How you left</h3>
              <FeelRows counts={p.after} max={bothMax} />
              {p.shift.hard >= 2 && (
                <p className="soft" style={{ fontSize: '0.9375rem' }}>
                  You arrived wired, flat or foggy for {p.shift.hard} sits where you also checked in afterwards, and left okay after {p.shift.eased} of them.
                </p>
              )}
            </>
          )}
        </section>
      )}

      <section className="stack" style={{ gap: 10 }} aria-labelledby="ptCheck">
        <h3 id="ptCheck" className="mono caps">Weekly check-ins</h3>
        {p.checkins.length < 2
          ? <p className="soft" style={{ fontSize: '0.9375rem' }}>{p.checkins.length ? 'One check-in so far. A second one gives this a shape.' : 'No check-ins yet. They take a minute, once a week.'}</p>
          : (
            <>
              <Trend label="Settled" points={p.checkins} values={p.checkins.map((c) => c.settled ?? null)} />
              <Trend label="Connected" points={p.checkins} values={p.checkins.map((c) => c.connected ?? null)} />
            </>
          )}
      </section>
    </div>
  );
}
