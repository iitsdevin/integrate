// Interactive diagrams for the workbook: tap or drag to map where you sit.
// Drawn for this app in the Field Print style, with theme tokens so they follow scheme and dark mode.
// Each one has plain controls underneath too, so it works with VoiceOver and without precise taps.
import { useRef, useState } from 'react';
import { localDate } from '../lib/store.js';

const C = { ink: 'var(--ink)', g: 'var(--ground)', b1: 'var(--block1)', b2: 'var(--block2)', r: 'var(--raised)', t2: 'var(--tab-ink)', deep: 'var(--deep)' };
const mono = { fontFamily: 'var(--mono)', letterSpacing: '0.04em', fontWeight: 500 };
const disp = { fontWeight: 800, fontStretch: '75%', letterSpacing: '-0.02em' };

const sector = (cx, cy, r0, r1, a0, a1) => {
  const p = (r, a) => `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`;
  const lg = a1 - a0 > Math.PI ? 1 : 0;
  return `M${p(r1, a0)} A${r1} ${r1} 0 ${lg} 1 ${p(r1, a1)} L${p(r0, a1)} A${r0} ${r0} 0 ${lg} 0 ${p(r0, a0)} Z`;
};
// pointer position in SVG user units
const svgPoint = (e, svg) => { const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; return pt.matrixTransform(svg.getScreenCTM().inverse()); };

function Legend({ children }) { return <p className="mono-s mute" style={{ lineHeight: 1.5 }}>{children}</p>; }

// ---------------------------------------------------------------- radial map (wheel of power, spectrum wheel)
export function RadialMap({ b, v, set }) {
  const val = v || {};
  const N = b.axes.length, L = b.levels;
  const cx = 180, cy = 166, R0 = 24, R1 = 116, w = (R1 - R0) / L, step = (2 * Math.PI) / N;
  const tap = (name, j) => set({ ...val, [name]: val[name] === j ? undefined : j });
  return (
    <fieldset className="stack wb-set" style={{ gap: 12 }}>
      <legend className="wb-q">{b.label}</legend>
      <div className="fig" style={{ boxShadow: '4px 4px 0 var(--block2)' }}>
        <svg viewBox="0 0 360 334" aria-hidden="true" style={{ touchAction: 'manipulation' }}>
          {b.axes.map(([name, short], i) => {
            const a0 = -Math.PI / 2 - step / 2 + i * step, a1 = a0 + step, am = (a0 + a1) / 2;
            const sel = val[name];
            const lx = cx + (R1 + 13) * Math.cos(am), ly = cy + (R1 + 13) * Math.sin(am);
            const c = Math.cos(am);
            return (
              <g key={name}>
                {Array.from({ length: L }, (_, j) => (
                  <path key={j} d={sector(cx, cy, R0 + j * w, R0 + (j + 1) * w, a0, a1)}
                    fill={sel == null || j > sel ? (j % 2 ? C.g : C.r) : j === sel ? C.b2 : C.b1}
                    stroke={C.ink} strokeWidth={1.5} style={{ cursor: 'pointer', transition: 'fill 160ms ease' }}
                    onClick={() => tap(name, j)} />
                ))}
                <text x={lx} y={ly + 4} fontSize={11.5} fontWeight={600} fill={C.ink} textAnchor={c > 0.3 ? 'start' : c < -0.3 ? 'end' : 'middle'} style={{ cursor: 'pointer' }}
                  onClick={() => tap(name, sel == null ? 0 : sel + 1 >= L ? undefined : sel + 1)}>{short}</text>
              </g>
            );
          })}
          <circle cx={cx} cy={cy} r={R0} fill={C.ink} />
          <text x={cx} y={cy + 3.5} fontSize={9} textAnchor="middle" fill={C.g} style={mono}>{b.hub.toUpperCase()}</text>
        </svg>
        <figcaption>{b.cap}</figcaption>
      </div>
      <div className="stack" style={{ gap: 10 }}>
        {b.axes.map(([name, , levels]) => (
          <div key={name} className="stack" style={{ gap: 4 }}>
            <p className="between"><span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{name}</span>{val[name] != null && <button type="button" className="link-btn mono-s" onClick={() => tap(name, val[name])}>clear</button>}</p>
            <div className="seg wb-seg-sm" role="radiogroup" aria-label={name} style={{ gridTemplateColumns: `repeat(${L}, minmax(0, 1fr))` }}>
              {(levels || Array.from({ length: L }, (_, j) => String(j + 1))).map((lv, j) => (
                <button key={j} type="button" role="radio" aria-checked={val[name] === j} aria-selected={val[name] === j} onClick={() => tap(name, j)}>{lv}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </fieldset>
  );
}

// ---------------------------------------------------------------- sensory map (drag a dot along each sense)
export function SenseMap({ b, v, set }) {
  const val = v || {};
  const svg = useRef(null), drag = useRef(null);
  const X0 = 96, X1 = 292, row = (i) => 40 + i * 26;
  const toVal = (x) => Math.round(Math.max(0, Math.min(100, ((x - X0) / (X1 - X0)) * 100)));
  const move = (e) => { if (!drag.current) return; const p = svgPoint(e, svg.current); set({ ...val, [drag.current]: toVal(p.x) }); };
  const Z = b.zones || ['seeking', 'comfy', 'avoiding'];
  const zone = (x) => (x < 34 ? Z[0] : x > 66 ? Z[2] : Z[1]);
  const H = 40 + b.rows.length * 26;
  return (
    <fieldset className="stack wb-set" style={{ gap: 12 }}>
      <legend className="wb-q">{b.label}</legend>
      <div className="fig" style={{ boxShadow: '4px 4px 0 var(--block2)' }}>
        <svg ref={svg} viewBox={`0 0 300 ${H}`} aria-hidden="true" style={{ touchAction: 'none' }}
          onPointerMove={move} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}>
          {[[X0, C.b2, Z[0]], [X0 + 65.3, C.r, Z[1]], [X0 + 130.6, C.b1, Z[2]]].map(([x, f, l]) => (
            <g key={l}><rect x={x} y={22} width={65.4} height={H - 26} fill={f} stroke={C.ink} strokeWidth={2} /><text x={x + 32.7} y={14} fontSize={9.5} textAnchor="middle" fill={C.ink} style={mono}>{l.toUpperCase()}</text></g>
          ))}
          {b.rows.map((s, i) => {
            const y = row(i), x = val[s] == null ? null : X0 + (val[s] / 100) * (X1 - X0);
            return (
              <g key={s} onPointerDown={(e) => { e.currentTarget.ownerSVGElement.setPointerCapture(e.pointerId); drag.current = s; const p = svgPoint(e, svg.current); set({ ...val, [s]: toVal(p.x) }); }} style={{ cursor: 'pointer' }}>
                <rect x={0} y={y - 13} width={300} height={26} fill="transparent" />
                <text x={86} y={y + 4.5} fontSize={12} fontWeight={600} textAnchor="end" fill={C.ink}>{s}</text>
                <line x1={X0 + 4} y1={y} x2={X1 - 4} y2={y} stroke={C.ink} strokeOpacity={0.35} strokeWidth={1.5} />
                {x == null ? <circle cx={X0 + 98} cy={y} r={6} fill="none" stroke={C.ink} strokeWidth={1.5} strokeDasharray="2 2" />
                  : <circle cx={x} cy={y} r={8} fill={C.ink} stroke={C.g} strokeWidth={2} />}
              </g>
            );
          })}
        </svg>
        <figcaption>{b.cap || 'Tap or drag along each line. Left if you go looking for more of that sense, right if you try to get away from it.'}</figcaption>
      </div>
      <details className="wb-details">
        <summary className="mono caps">Adjust with sliders</summary>
        <div className="stack" style={{ gap: 8, paddingTop: 8 }}>
          {b.rows.map((s) => (
            <label key={s} className="stack" style={{ gap: 2 }}>
              <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{s}{val[s] != null && <span className="mono-s mute"> · {zone(val[s])}</span>}</span>
              <input type="range" min="0" max="100" value={val[s] ?? 50} onChange={(e) => set({ ...val, [s]: Number(e.target.value) })} aria-valuetext={val[s] == null ? 'not set' : zone(val[s])} style={{ accentColor: 'var(--deep)' }} />
            </label>
          ))}
        </div>
      </details>
    </fieldset>
  );
}

// ---------------------------------------------------------------- window of tolerance
const WOT = [
  [67, 'Above the window', 'Fight or flight. Racing, hot, on edge. This is meltdown territory. Pause, get somewhere safe, then soothe through your senses.'],
  [33, 'In the window', "You can feel things and still think. This is where choosing, connecting and learning happen. Notice what's helping."],
  [0, 'Below the window', 'Shutdown. Flat, foggy, far away, hard to speak. Come back up gently: warmth, a favourite stim, slow movement, a familiar song.'],
];
export function WindowMap({ b, v, set }) {
  const val = { now: null, log: [], ...(v || {}) };
  const svg = useRef(null), down = useRef(false);
  const Y = (n) => 196 - n * 1.84; // 0..100 → 196..12
  const toN = (y) => Math.round(Math.max(0, Math.min(100, (196 - y) / 1.84)));
  const setFrom = (e) => { const p = svgPoint(e, svg.current); set({ ...val, now: toN(p.y) }); };
  const bands = b.bands || WOT;
  const tags = b.tags || ['HYPER · FIGHT, FLIGHT, MELTDOWN', 'THE WINDOW · CAN FEEL AND THINK', 'HYPO · SHUTDOWN, NUMB, FOGGY'];
  const zone = val.now == null ? null : bands.find(([t]) => val.now >= t);
  const pts = val.log.slice(-8);
  const xs = (i) => 24 + i * ((232 - 24) / Math.max(1, 7));
  return (
    <fieldset className="stack wb-set" style={{ gap: 12 }}>
      <legend className="wb-q">{b.label}</legend>
      <div className="fig" style={{ boxShadow: '4px 4px 0 var(--block2)' }}>
        <svg ref={svg} viewBox="0 0 300 204" aria-hidden="true" style={{ touchAction: 'none', cursor: 'pointer' }}
          onPointerDown={(e) => { svg.current.setPointerCapture(e.pointerId); down.current = true; setFrom(e); }}
          onPointerMove={(e) => { if (down.current) setFrom(e); }} onPointerUp={() => { down.current = false; }} onPointerCancel={() => { down.current = false; }}>
          <rect x={2} y={4} width={296} height={Y(67) - 4} fill={C.b1} stroke={C.ink} strokeWidth={2} />
          <rect x={2} y={Y(67)} width={296} height={Y(33) - Y(67)} fill={C.b2} stroke={C.ink} strokeWidth={2} />
          <rect x={2} y={Y(33)} width={296} height={200 - Y(33)} fill={C.b1} stroke={C.ink} strokeWidth={2} />
          {pts.length > 1 && <polyline points={pts.map((p, i) => `${xs(i)},${Y(p.v)}`).join(' ')} fill="none" stroke={C.ink} strokeWidth={2} strokeLinejoin="round" strokeDasharray="4 3" />}
          {pts.map((p, i) => <circle key={p.at} cx={xs(i)} cy={Y(p.v)} r={4} fill={C.g} stroke={C.ink} strokeWidth={1.5} />)}
          <g><rect x={5} y={20 - 11} width={tags[0].length * 5.95 + 10} height={15} fill={C.b1} /><text x={10} y={20} fontSize={9.5} fill={C.ink} style={mono}>{tags[0]}</text></g>
          <g><rect x={5} y={Y(67) + 16 - 11} width={tags[1].length * 5.95 + 10} height={15} fill={C.b2} /><text x={10} y={Y(67) + 16} fontSize={9.5} fill={C.t2} style={mono}>{tags[1]}</text></g>
          <g><rect x={5} y={Y(33) + 16 - 11} width={tags[2].length * 5.95 + 10} height={15} fill={C.b1} /><text x={10} y={Y(33) + 16} fontSize={9.5} fill={C.ink} style={mono}>{tags[2]}</text></g>
          {val.now != null && (
            <g>
              <line x1={240} y1={Y(val.now)} x2={292} y2={Y(val.now)} stroke={C.ink} strokeWidth={2} />
              <circle cx={266} cy={Y(val.now)} r={10} fill={C.ink} />
              <text x={266} y={Y(val.now) + 3.5} fontSize={8.5} textAnchor="middle" fill={C.g} style={mono}>NOW</text>
            </g>
          )}
          {val.now == null && <text x={266} y={Y(50) + 30} fontSize={9.5} textAnchor="middle" fill={C.t2} style={mono}>TAP</text>}
        </svg>
        <figcaption>{b.cap || 'Tap where you are right now. Log it to see how you move over a few days.'}</figcaption>
      </div>
      <label className="stack" style={{ gap: 2 }}>
        <span className="mono-s caps mute">Or use the slider · shut down to overwhelmed</span>
        <input type="range" min="0" max="100" value={val.now ?? 50} onChange={(e) => set({ ...val, now: Number(e.target.value) })} aria-valuetext={zone ? zone[1] : 'not set'} style={{ accentColor: 'var(--deep)' }} />
      </label>
      {zone && <p className="notice" role="status"><b>{zone[1]}.</b> {zone[2]}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, alignItems: 'center' }}>
        <button type="button" className="btn" disabled={val.now == null} onClick={() => set({ ...val, log: [...val.log, { at: new Date().toISOString(), v: val.now }].slice(-30) })}>Log where I am</button>
        {val.log.length > 0 && <button type="button" className="link-btn" onClick={() => set({ ...val, log: [] })}>Clear log</button>}
      </div>
    </fieldset>
  );
}

// ---------------------------------------------------------------- feelings wheel
export function FeelWheel({ b, v, set }) {
  const val = { sel: [], own: [], ...(v || {}) };
  const [act, setAct] = useState(0);
  const [add, setAdd] = useState('');
  const G = b.groups, N = G.length, step = (2 * Math.PI) / N;
  const fills = [C.b1, C.b2, C.r, C.b1, C.b2, C.r, C.b2];
  const short = b.short || G.map((g) => g[0].split(/[ ,]/)[0]);
  const [gname, words, gnote] = G[act];
  const count = (i) => G[i][1].filter((w) => val.sel.includes(w)).length;
  const tog = (w) => set({ ...val, sel: val.sel.includes(w) ? val.sel.filter((x) => x !== w) : [...val.sel, w] });
  return (
    <fieldset className="stack wb-set" style={{ gap: 12 }}>
      <legend className="wb-q">{b.label}</legend>
      <div className="fig" style={{ boxShadow: '4px 4px 0 var(--block2)' }}>
        <svg viewBox="0 0 300 300" aria-hidden="true" style={{ touchAction: 'manipulation' }}>
          {G.map((g, i) => {
            const a0 = -Math.PI / 2 - step / 2 + i * step, a1 = a0 + step, am = (a0 + a1) / 2, on = i === act;
            const tx = 150 + 88 * Math.cos(am), ty = 150 + 88 * Math.sin(am), n = count(i);
            const tf = on ? C.g : fills[i] === C.b2 ? C.t2 : C.ink;
            return (
              <g key={g[0]} onClick={() => setAct(i)} style={{ cursor: 'pointer' }}>
                <path d={sector(150, 150, 40, on ? 142 : 132, a0, a1)} fill={on ? C.ink : fills[i]} stroke={C.ink} strokeWidth={2} style={{ transition: 'fill 160ms ease' }} />
                <text x={tx} y={ty + (n ? 0 : 4.5)} fontSize={15} textAnchor="middle" fill={tf} style={disp}>{short[i]}</text>
                {n > 0 && <text x={tx} y={ty + 14} fontSize={9.5} textAnchor="middle" fill={tf} style={mono}>{n} picked</text>}
              </g>
            );
          })}
          <circle cx={150} cy={150} r={40} fill={C.g} stroke={C.ink} strokeWidth={2} />
          <text x={150} y={147} fontSize={9.5} textAnchor="middle" fill={C.ink} style={mono}>HOW DO</text>
          <text x={150} y={159} fontSize={9.5} textAnchor="middle" fill={C.ink} style={mono}>I FEEL?</text>
        </svg>
        <figcaption>{b.cap || 'Tap a slice to open that family of feelings, then pick the words that fit.'}</figcaption>
      </div>
      <div className="seg wb-seg-sm" role="tablist" aria-label="Feeling families" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
        {G.map((g, i) => <button key={g[0]} type="button" role="tab" aria-selected={i === act} onClick={() => setAct(i)}>{short[i]}{count(i) ? ` ${count(i)}` : ''}</button>)}
      </div>
      <div className="stack" style={{ gap: 6 }} role="tabpanel" aria-label={gname}>
        <p className="mono caps">{gname}</p>
        {gnote && <p className="mono-s mute" style={{ marginTop: -4 }}>{gnote}</p>}
        <div className="wb-chips">{words.map((w) => <button key={w} type="button" className="chip" aria-pressed={val.sel.includes(w)} onClick={() => tog(w)}>{w}</button>)}</div>
      </div>
      {val.own.length > 0 && <div className="wb-chips">{val.own.map((w) => <button key={w} type="button" className="chip" aria-pressed={val.sel.includes(w)} onClick={() => tog(w)}>{w}</button>)}</div>}
      <form className="wb-add" onSubmit={(e) => { e.preventDefault(); const w = add.trim(); if (!w) return; set({ ...val, own: val.own.includes(w) ? val.own : [...val.own, w], sel: val.sel.includes(w) ? val.sel : [...val.sel, w] }); setAdd(''); }}>
        <input className="field" value={add} onChange={(e) => setAdd(e.target.value)} placeholder="Add my own word" aria-label="Add your own feeling word" />
        <button type="submit" className="btn" disabled={!add.trim()}>Add</button>
      </form>
    </fieldset>
  );
}

// ---------------------------------------------------------------- circles of closeness
const RINGS0 = ['Closest', 'Close', 'Around'];
export function Circles({ b, v, set, all }) {
  const RINGS = b.rings || RINGS0;
  const val = v || {};
  const [add, setAdd] = useState('');
  const fromList = (all[b.from] || []).map((x) => x?.trim()).filter(Boolean);
  const names = [...new Set([...fromList, ...Object.keys(val)])];
  const placed = (k) => names.filter((n) => val[n] === k);
  const R = [40, 80, 118];
  return (
    <fieldset className="stack wb-set" style={{ gap: 12 }}>
      <legend className="wb-q">{b.label}</legend>
      <div className="fig" style={{ boxShadow: '4px 4px 0 var(--block2)' }}>
        <svg viewBox="0 0 300 262" aria-hidden="true">
          <circle cx={150} cy={131} r={R[2]} fill={C.r} stroke={C.ink} strokeWidth={1.5} strokeDasharray="4 4" />
          <circle cx={150} cy={131} r={R[1]} fill={C.b1} stroke={C.ink} strokeWidth={2} />
          <circle cx={150} cy={131} r={R[0]} fill={C.b2} stroke={C.ink} strokeWidth={2} />
          <circle cx={150} cy={131} r={11} fill={C.ink} />
          <text x={150} y={134} fontSize={7.5} textAnchor="middle" fill={C.g} style={mono}>YOU</text>
          {[0, 1, 2].map((k) => {
            const ps = placed(k), off = [-Math.PI / 2, -Math.PI / 3, -Math.PI / 2.4][k];
            return ps.map((n, i) => {
              const a = off + (i / Math.max(ps.length, 1)) * 2 * Math.PI;
              const x = 150 + R[k] * Math.cos(a), y = 131 + R[k] * Math.sin(a);
              const label = n.length > 13 ? n.slice(0, 12) + '…' : n, w = label.length * 6.4 + 14;
              return <g key={n}><rect x={x - w / 2} y={y - 10} width={w} height={20} rx={10} fill={C.g} stroke={C.ink} strokeWidth={1.5} /><text x={x} y={y + 4} fontSize={11} fontWeight={600} textAnchor="middle" fill={C.ink}>{label}</text></g>;
            });
          })}
          {!names.some((n) => val[n] != null) && <text x={150} y={256} fontSize={9.5} textAnchor="middle" fill={C.ink} style={mono}>ADD PEOPLE BELOW</text>}
        </svg>
        <figcaption>{b.cap || "Your circles. Strawberry people go in the inner circle. There's no right number, and people can move."}</figcaption>
      </div>
      {names.map((n) => (
        <div key={n} className="stack" style={{ gap: 4 }}>
          <p className="between" style={{ gap: 8 }}><span style={{ fontWeight: 600, minWidth: 0, overflowWrap: 'anywhere' }}>{n}</span>{val[n] != null && <button type="button" className="link-btn mono-s" onClick={() => { const x = { ...val }; delete x[n]; set(x); }}>take off</button>}</p>
          <div className="seg wb-seg-sm" role="radiogroup" aria-label={`Where ${n} sits`} style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
            {RINGS.map((r, k) => <button key={r} type="button" role="radio" aria-checked={val[n] === k} aria-selected={val[n] === k} onClick={() => set({ ...val, [n]: k })}>{r}</button>)}
          </div>
        </div>
      ))}
      <form className="wb-add" onSubmit={(e) => { e.preventDefault(); const w = add.trim(); if (!w) return; set({ ...val, [w]: val[w] ?? 1 }); setAdd(''); }}>
        <input className="field" value={add} onChange={(e) => setAdd(e.target.value)} placeholder="Add someone" aria-label="Add someone to your circles" />
        <button type="submit" className="btn" disabled={!add.trim()}>Add</button>
      </form>
    </fieldset>
  );
}

// ---------------------------------------------------------------- today's spoons
const TASKS = [['Shower', 1], ['Work or study', 4], ['Groceries', 2], ['Cooking', 1], ['Seeing people', 3], ['Admin', 2], ['Appointment', 2], ['Exercise', 2], ['Phone call', 1], ['Something else', 1]];
export function SpoonDay({ b, v, set }) {
  const today = localDate();
  const val = { days: {}, start: 12, ...(v || {}) };
  const d = val.days[today] || { total: val.start, spent: [] };
  const put = (nd) => { const days = Object.fromEntries(Object.entries({ ...val.days, [today]: nd }).sort().slice(-14)); set({ ...val, days, start: nd.total }); };
  const used = d.spent.reduce((s, [, n]) => s + n, 0), left = d.total - used;
  const per = 12, rowsN = Math.ceil(d.total / per), H = 18 + rowsN * 66;
  return (
    <fieldset className="stack wb-set" style={{ gap: 12 }}>
      <legend className="wb-q">{b.label}</legend>
      <div className="fig" style={{ boxShadow: '4px 4px 0 var(--block2)' }}>
        <svg viewBox={`0 0 300 ${H}`} aria-hidden="true">
          {Array.from({ length: d.total }, (_, i) => {
            const x = 14 + (i % per) * 24.4, y0 = 12 + Math.floor(i / per) * 66, spent = i >= left;
            const p = { stroke: C.ink, strokeWidth: 1.5, strokeDasharray: spent ? '3 2' : undefined, fill: spent ? 'none' : C.b2, opacity: spent ? 0.55 : 1, style: { transition: 'fill 200ms ease, opacity 200ms ease' } };
            return <g key={i}><ellipse cx={x} cy={y0 + 12} rx={8} ry={11} {...p} /><rect x={x - 2} y={y0 + 23} width={4} height={34} rx={2} {...p} /></g>;
          })}
        </svg>
        <figcaption aria-live="polite">{left > 0 ? `${left} of ${d.total} spoons left today.` : left === 0 ? 'Out of spoons. Rest is the task now.' : `${-left} spoons into tomorrow's. Go gently.`}</figcaption>
      </div>
      <div className="between">
        <span style={{ fontWeight: 600 }}>I started today with</span>
        <span className="row" style={{ gap: 6 }}>
          <button type="button" className="btn btn-tight" aria-label="Fewer spoons" disabled={d.total <= 4} onClick={() => put({ ...d, total: d.total - 1 })}>−</button>
          <b className="mono" style={{ minWidth: 26, textAlign: 'center', fontSize: '0.9375rem' }} aria-live="polite">{d.total}</b>
          <button type="button" className="btn btn-tight" aria-label="More spoons" disabled={d.total >= 24} onClick={() => put({ ...d, total: d.total + 1 })}>+</button>
        </span>
      </div>
      <p className="mono caps">Spend some</p>
      <div className="wb-chips">
        {TASKS.map(([t, n]) => <button key={t} type="button" className="chip" onClick={() => put({ ...d, spent: [...d.spent, [t, n]] })}>{t} · {n}</button>)}
      </div>
      {d.spent.length > 0 && (
        <div className="stack" style={{ gap: 0 }}>
          {d.spent.map(([t, n], i) => (
            <div key={i} className="between" style={{ padding: '7px 0', borderBottom: '1px solid color-mix(in srgb, var(--ink) 22%, transparent)' }}>
              <span>{t}</span>
              <span className="row" style={{ gap: 10 }}><span className="mono">−{n}</span><button type="button" className="link-btn mono-s" aria-label={`Undo ${t}`} onClick={() => put({ ...d, spent: d.spent.filter((_, j) => j !== i) })}>undo</button></span>
            </div>
          ))}
        </div>
      )}
      <Legend>Starts fresh each day. The app keeps the last two weeks so you can look back.</Legend>
    </fieldset>
  );
}

// ---------------------------------------------------------------- interactive image: tap to drop pins
// b.image: 'body' (built-in outline) or a data:image URL. b.tags: optional quick labels for pins.
function BodyOutline() {
  const p = { fill: C.r, stroke: C.ink, strokeWidth: 2, strokeLinejoin: 'round' };
  return (
    <g>
      <ellipse {...p} cx={150} cy={40} rx={21} ry={24} />
      <path {...p} d="M159 64 L159 74 C177 76 187 80 190 86 L203 164 C205 172 194 175 192 167 L184 112 L180 172 L183 188 L176 290 C175 298 160 298 159 290 L152 196 L150 192 L148 196 L141 290 C140 298 125 298 124 290 L117 188 L120 172 L116 112 L108 167 C106 175 95 172 97 164 L110 86 C113 80 123 76 141 74 L141 64 Z" />
    </g>
  );
}
export function PinMap({ b, v, set }) {
  const pins = Array.isArray(v) ? v : [];
  const svg = useRef(null);
  const [sel, setSel] = useState(null);
  const body = b.image === 'body';
  const VW = 300, VH = b.h || (body ? 300 : 220);
  const add = (e) => {
    const p = svgPoint(e, svg.current);
    const x = Math.round((p.x / VW) * 1000) / 10, y = Math.round((p.y / VH) * 1000) / 10;
    const next = [...pins, { x, y, label: '' }];
    set(next); setSel(next.length - 1);
  };
  const upd = (i, patch) => set(pins.map((q, j) => (j === i ? { ...q, ...patch } : q)));
  return (
    <fieldset className="stack wb-set" style={{ gap: 12 }}>
      <legend className="wb-q">{b.label}</legend>
      <div className="fig" style={{ boxShadow: '4px 4px 0 var(--block2)' }}>
        <svg ref={svg} viewBox={`0 0 ${VW} ${VH}`} aria-hidden="true" style={{ touchAction: 'manipulation', cursor: 'crosshair' }} onClick={add}>
          {body ? <BodyOutline /> : <image href={b.image} x={0} y={0} width={VW} height={VH} preserveAspectRatio="xMidYMid meet" />}
          {pins.map((q, i) => (
            <g key={i} onClick={(e) => { e.stopPropagation(); setSel(i); }} style={{ cursor: 'pointer' }}>
              <circle cx={(q.x / 100) * VW} cy={(q.y / 100) * VH} r={11} fill={i === sel ? C.ink : C.b2} stroke={C.ink} strokeWidth={2} />
              <text x={(q.x / 100) * VW} y={(q.y / 100) * VH + 4} fontSize={11} textAnchor="middle" fill={i === sel ? C.g : C.t2} style={mono}>{i + 1}</text>
            </g>
          ))}
        </svg>
        <figcaption>{b.cap || 'Tap the picture to drop a pin. Then say what it is underneath.'}</figcaption>
      </div>
      {pins.map((q, i) => (
        <div key={i} className="wb-rowcard" style={{ gap: 6, borderColor: i === sel ? 'var(--ink)' : undefined, boxShadow: i === sel ? '3px 3px 0 var(--block2)' : 'none' }}>
          <p className="between"><span className="mono caps">Pin {i + 1}</span><button type="button" className="link-btn mono-s" onClick={() => { set(pins.filter((_, j) => j !== i)); setSel(null); }}>remove</button></p>
          <input className="field" value={q.label} placeholder={b.hint || 'What is here?'} aria-label={`Pin ${i + 1}`} onFocus={() => setSel(i)} onChange={(e) => upd(i, { label: e.target.value })} />
          {b.tags && <div className="wb-chips">{b.tags.map((t) => <button key={t} type="button" className="chip" aria-pressed={q.label === t} onClick={() => upd(i, { label: q.label === t ? '' : t })}>{t}</button>)}</div>}
        </div>
      ))}
      {!pins.length && <p className="mono-s mute">No pins yet.</p>}
    </fieldset>
  );
}
