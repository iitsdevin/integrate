// Interactive items for the Neurodivergence Skills workbook. Everything saves as you go.
import { useState } from 'react';
import { getState, setState, addEntry } from '../lib/store.js';
import { FREQ } from '../data/workbook.js';
import { toast } from './bits.jsx';
import { RadialMap, SenseMap, WindowMap, FeelWheel, Circles, SpoonDay, PinMap } from './WorkbookMaps.jsx';

export const wbState = (s = getState()) => ({ done: {}, ans: {}, practiced: {}, ...(s.wb || {}) });
export const setWb = (fn) => setState((s) => ({ ...s, wb: fn(wbState(s)) }));
export const setAns = (lid, k, v) => setWb((w) => ({ ...w, ans: { ...w.ans, [lid]: { ...(w.ans[lid] || {}), [k]: typeof v === 'function' ? v(w.ans[lid]?.[k]) : v } } }));
export const markDone = (lid) => setWb((w) => ({ ...w, done: { ...w.done, [lid]: w.done[lid] || new Date().toISOString() } }));

const blank = (v) => v === undefined || v === null || v === '' || (Array.isArray(v) && !v.some((x) => (typeof x === 'string' ? x.trim() : x && Object.values(x).some((y) => y && String(y).trim())))) || (typeof v === 'object' && !Array.isArray(v) && !Object.keys(v).length);
const id = (lid, k, x = '') => `wb-${lid}-${k}${x}`;

// ---------- one item ----------
function Item({ b, lid, all }) {
  const v = all[b.k];
  const set = (x) => setAns(lid, b.k, x);
  switch (b.t) {
    case 'note': return <p className="notice" style={{ fontSize: '0.9375rem' }}>{b.text}</p>;
    case 'head': return <h3 className="wb-head">{b.text}</h3>;
    case 'text':
      return (
        <div className="stack" style={{ gap: 6 }}>
          <label className="wb-q" htmlFor={id(lid, b.k)}>{b.label}</label>
          {b.short
            ? <input id={id(lid, b.k)} className="field" value={v || ''} placeholder={b.hint} onChange={(e) => set(e.target.value)} />
            : <textarea id={id(lid, b.k)} className="field" style={{ minHeight: 84 }} value={v || ''} placeholder={b.hint} onChange={(e) => set(e.target.value)} />}
        </div>
      );
    case 'list': {
      const arr = Array.from({ length: b.n }, (_, i) => v?.[i] || '');
      return (
        <fieldset className="stack wb-set" style={{ gap: 6 }}>
          <legend className="wb-q">{b.label}</legend>
          {b.hint && <p className="mono-s mute">{b.hint}</p>}
          {arr.map((x, i) => (
            <div key={i} className="wb-num">
              <span className="mono" aria-hidden="true">{i + 1}</span>
              <input className="field" aria-label={`${b.label}, ${i + 1}`} value={x} onChange={(e) => set(arr.map((y, j) => (j === i ? e.target.value : y)))} />
            </div>
          ))}
        </fieldset>
      );
    }
    case 'blanks': return <Blanks b={b} v={v} set={set} />;
    case 'chips': return <Chips b={b} v={v} set={set} />;
    case 'one':
      return (
        <fieldset className="stack wb-set">
          <legend className="wb-q">{b.label}</legend>
          <div className="wb-chips" role="radiogroup">
            {b.options.map((o) => <button key={o} type="button" role="radio" aria-checked={v === o} className="chip" style={{ fontSize: /\p{Extended_Pictographic}/u.test(o) ? '1.4rem' : undefined }} aria-pressed={v === o} onClick={() => set(v === o ? '' : o)}>{o}</button>)}
          </div>
        </fieldset>
      );
    case 'freq':
      return (
        <fieldset className="stack wb-set" style={{ gap: 8 }}>
          <legend className="wb-q">{b.label}</legend>
          <div className="wb-freq" role="radiogroup">
            {FREQ.map((f, i) => <button key={f} type="button" role="radio" aria-checked={v === i} onClick={() => set(v === i ? null : i)}>{f}</button>)}
          </div>
        </fieldset>
      );
    case 'scale':
      return <Scale label={b.label} left={b.left} right={b.right} v={v} set={set} name={id(lid, b.k)} big />;
    case 'scales':
      return (
        <fieldset className="stack wb-set" style={{ gap: 12 }}>
          <legend className="wb-q">{b.label}</legend>
          <p className="between mono-s caps mute" aria-hidden="true"><span>{b.left}</span><span>{b.right}</span></p>
          {b.rows.map((r) => <Scale key={r} label={r} left={b.left} right={b.right} v={v?.[r]} set={(x) => set({ ...(v || {}), [r]: x })} name={id(lid, b.k, r)} />)}
        </fieldset>
      );
    case 'check': return <Checklist b={b} v={v} set={set} />;
    case 'rank': {
      const order = v || [];
      return (
        <fieldset className="stack wb-set">
          <legend className="wb-q">{b.label}</legend>
          <div className="stack" style={{ gap: 6 }}>
            {b.options.map((o) => {
              const n = order.indexOf(o);
              return (
                <button key={o} type="button" className="wb-row" aria-pressed={n >= 0} onClick={() => set(n >= 0 ? order.filter((x) => x !== o) : order.length < b.n ? [...order, o] : order)}>
                  <span className="wb-box" aria-hidden="true">{n >= 0 ? n + 1 : ''}</span><span>{o}</span>
                </button>
              );
            })}
          </div>
          {order.length >= b.n && <p className="mono-s mute">Tap one to take it out and change the order.</p>}
        </fieldset>
      );
    }
    case 'table': return <Table b={b} v={v} set={set} lid={lid} />;
    case 'rows': return <Rows b={b} v={v} set={set} />;
    case 'pick':
      return (
        <fieldset className="stack wb-set" style={{ gap: 14 }}>
          <legend className="wb-q">{b.label}</legend>
          {b.rows.map((r, i) => (
            <div key={i} className="stack" style={{ gap: 6 }}>
              <p style={{ lineHeight: 1.35 }}>{r}</p>
              <div className="seg" role="radiogroup" aria-label={r} style={{ gridTemplateColumns: `repeat(${b.options.length}, minmax(0, 1fr))` }}>
                {b.options.map((o, j) => <button key={o} type="button" role="radio" aria-checked={v?.[i] === j} aria-selected={v?.[i] === j} onClick={() => set({ ...(v || {}), [i]: v?.[i] === j ? undefined : j })}>{o}</button>)}
              </div>
            </div>
          ))}
        </fieldset>
      );
    case 'pair':
      return (
        <fieldset className="stack wb-set" style={{ gap: 12 }}>
          <legend className="wb-q">{b.label}</legend>
          {b.rows.map(([a, c], i) => {
            const cur = v?.[i] || '';
            const tog = (side) => { const s = new Set(cur.split('')); s.has(side) ? s.delete(side) : s.add(side); set({ ...(v || {}), [i]: [...s].sort().join('') }); };
            return (
              <div key={i} className="wb-pair">
                <button type="button" aria-pressed={cur.includes('a')} onClick={() => tog('a')}>{a}</button>
                <button type="button" aria-pressed={cur.includes('b')} onClick={() => tog('b')}>{c}</button>
              </div>
            );
          })}
        </fieldset>
      );
    case 'strike': {
      const src = (all[b.from] || []).map((x, i) => [x, i]).filter(([x]) => x?.trim());
      const struck = v || [];
      if (!src.length) return <p className="notice">Write your stories in the list above first, then come back to this step.</p>;
      return (
        <div className="stack">
          <p className="wb-q">{b.label}</p>
          {src.map(([x, i]) => (
            <button key={i} type="button" className="wb-row" aria-pressed={struck.includes(i)} onClick={() => set(struck.includes(i) ? struck.filter((y) => y !== i) : [...struck, i])}>
              <span className="wb-box" aria-hidden="true">{i + 1}</span>
              <span style={{ textDecoration: struck.includes(i) ? 'line-through' : 'none', textDecorationThickness: 2, opacity: struck.includes(i) ? 0.55 : 1 }}>{x}</span>
            </button>
          ))}
          {struck.length > 0 && <button type="button" className="link-btn" style={{ alignSelf: 'flex-start' }} onClick={() => set([])}>Bring them all back</button>}
        </div>
      );
    }
    case 'prefix': return <Prefix b={b} src={all[b.from]} />;
    case 'show': {
      const a = getState().wb?.ans?.[b.from] || {};
      const filled = b.keys.filter(([k]) => a[k]?.trim());
      return (
        <section className="card card-lav stack" aria-label={b.label}>
          <p className="mono-s caps">{b.label}</p>
          {filled.length ? filled.map(([k, label]) => <p key={k} style={{ lineHeight: 1.45, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}><b>{label}.</b> {a[k]}</p>)
            : <p>Nothing here yet. Fill in the sweet spot lesson first, or tell the story out loud from memory.</p>}
        </section>
      );
    }
    case 'rewrite': return <Rewrite b={b} v={v} set={set} />;
    case 'plan': return <Plan v={v} set={set} />;
    case 'radial': return <RadialMap b={b} v={v} set={set} />;
    case 'sensemap': return <SenseMap b={b} v={v} set={set} />;
    case 'window': return <WindowMap b={b} v={v} set={set} />;
    case 'feelwheel': return <FeelWheel b={b} v={v} set={set} />;
    case 'circles': return <Circles b={b} v={v} set={set} all={all} />;
    case 'spoonday': return <SpoonDay b={b} v={v} set={set} />;
    case 'pins': return <PinMap b={b} v={v} set={set} />;
    default: return null;
  }
}

function Scale({ label, left, right, v, set, name, big }) {
  return (
    <div className="stack" style={{ gap: 4 }}>
      <label className={big ? 'wb-q' : undefined} htmlFor={name} style={big ? undefined : { fontWeight: 600, fontSize: '0.9375rem' }}>{label}</label>
      <div className="wb-scale">
        <input id={name} type="range" min="0" max="10" value={v ?? 5} data-unset={v == null || undefined} aria-valuetext={v == null ? 'not set' : `${v} of 10, from ${left} to ${right}`} onChange={(e) => set(Number(e.target.value))} onPointerDown={() => { if (v == null) set(5); }} />
        <output className="mono" htmlFor={name}>{v ?? '–'}</output>
      </div>
      {big && <p className="between mono-s mute" aria-hidden="true"><span>{left}</span><span style={{ textAlign: 'right' }}>{right}</span></p>}
    </div>
  );
}

function Blanks({ b, v, set }) {
  const arr = Array.from({ length: b.n }, (_, i) => v?.[i] || '');
  const ans = b.suggest ? getState().wb?.ans?.[b.suggest.lesson]?.[b.suggest.k] : null;
  const sugg = ans ? (ans.star?.length ? ans.star : ans.sel || []) : [];
  const fill = (w) => { const i = arr.findIndex((x) => !x.trim()); if (i >= 0) set(arr.map((x, j) => (j === i ? w : x))); };
  return (
    <fieldset className="stack wb-set" style={{ gap: 6 }}>
      <legend className="wb-q">{b.label}</legend>
      <div className="wb-blanks" style={{ gridTemplateColumns: `repeat(${b.n % 2 === 0 ? 2 : Math.min(b.n, 3)}, minmax(0, 1fr))` }}>
        {arr.map((x, i) => <input key={i} className="field" aria-label={`${b.label} ${i + 1}`} value={x} onChange={(e) => set(arr.map((y, j) => (j === i ? e.target.value : y)))} />)}
      </div>
      {sugg.length > 0 && (
        <div className="wb-chips" aria-label="Suggestions from your qualities">
          {sugg.filter((w) => !arr.includes(w)).slice(0, 12).map((w) => <button key={w} type="button" className="chip wb-sugg" onClick={() => fill(w)}>+ {w.toLowerCase()}</button>)}
        </div>
      )}
    </fieldset>
  );
}

function Chips({ b, v, set }) {
  const val = { sel: [], star: [], own: [], ...(v || {}) };
  const [add, setAdd] = useState('');
  const groups = b.groups || [[null, b.options]];
  const max = b.star;
  const tap = (o) => {
    const on = val.sel.includes(o), st = val.star.includes(o);
    if (!on) return set({ ...val, sel: [...val.sel, o] });
    if (max && !st && val.star.length < max) return set({ ...val, star: [...val.star, o] });
    set({ ...val, sel: val.sel.filter((x) => x !== o), star: val.star.filter((x) => x !== o) });
  };
  const chip = (o) => {
    const on = val.sel.includes(o), st = val.star.includes(o);
    return <button key={o} type="button" className={'chip' + (st ? ' wb-star' : '')} aria-pressed={on} aria-label={st ? `${o}, starred` : undefined} onClick={() => tap(o)}>{st ? '★ ' : ''}{o}</button>;
  };
  return (
    <fieldset className="stack wb-set">
      <legend className="wb-q">{b.label}</legend>
      {max && <p className="mono-s mute">{val.sel.length} chosen · {val.star.length} of {max} starred</p>}
      {groups.map(([g, opts, gnote], gi) => (
        <div key={gi} className="stack" style={{ gap: 6 }}>
          {g && <p className="mono caps" style={{ marginTop: gi ? 6 : 0 }}>{g}</p>}
          {gnote && <p className="mono-s mute" style={{ marginTop: -4 }}>{gnote}</p>}
          <div className="wb-chips">{opts.map(chip)}</div>
        </div>
      ))}
      {val.own.length > 0 && <div className="wb-chips">{val.own.map(chip)}</div>}
      {b.own && (
        <form className="wb-add" onSubmit={(e) => { e.preventDefault(); const w = add.trim(); if (!w) return; set({ ...val, own: val.own.includes(w) ? val.own : [...val.own, w], sel: val.sel.includes(w) ? val.sel : [...val.sel, w] }); setAdd(''); }}>
          <input className="field" value={add} onChange={(e) => setAdd(e.target.value)} placeholder="Add my own" aria-label={`Add your own to: ${b.label}`} />
          <button type="submit" className="btn" disabled={!add.trim()}>Add</button>
        </form>
      )}
    </fieldset>
  );
}

function Checklist({ b, v, set }) {
  const val = { m: {}, own: [], ...(v || {}) };
  const [add, setAdd] = useState('');
  const tap = (it) => {
    const cur = val.m[it] || 0;
    const next = b.star ? (cur + 1) % 3 : cur ? 0 : 1;
    const m = { ...val.m }; if (next) m[it] = next; else delete m[it];
    set({ ...val, m });
  };
  const row = (it) => {
    const s = val.m[it] || 0;
    return (
      <button key={it} type="button" className="wb-row" aria-pressed={s > 0} aria-label={s === 2 ? `${it}, starred: ${b.star}` : undefined} onClick={() => tap(it)}>
        <span className="wb-box" aria-hidden="true">{s === 2 ? '★' : s ? '✓' : ''}</span><span>{it}</span>
      </button>
    );
  };
  const groups = b.groups;
  return (
    <fieldset className="stack wb-set">
      <legend className="wb-q">{b.label}</legend>
      {b.star && <p className="mono-s mute">Tap once to tick. Tap again to star: {b.star}.</p>}
      {groups.map(([g, items], gi) => {
        const n = items.filter((it) => val.m[it]).length;
        return (
          <div key={gi} className="stack" style={{ gap: 4 }}>
            {g && <p className="between mono caps" style={{ marginTop: gi ? 10 : 0 }}><span>{g}</span>{(b.tally || n > 0) && <span>{n}/{items.length}</span>}</p>}
            {items.map(row)}
          </div>
        );
      })}
      {val.own.length > 0 && <div className="stack" style={{ gap: 4 }}>{val.own.map(row)}</div>}
      {b.own && (
        <form className="wb-add" onSubmit={(e) => { e.preventDefault(); const w = add.trim(); if (!w) return; set({ ...val, own: val.own.includes(w) ? val.own : [...val.own, w], m: { ...val.m, [w]: val.m[w] || 1 } }); setAdd(''); }}>
          <input className="field" value={add} onChange={(e) => setAdd(e.target.value)} placeholder="Add my own" aria-label={`Add your own to: ${b.label}`} />
          <button type="submit" className="btn" disabled={!add.trim()}>Add</button>
        </form>
      )}
      {b.tally && (
        <div className="card stack" style={{ gap: 4 }} aria-live="polite">
          <p className="mono-s caps">My counts</p>
          {groups.map(([g, items]) => <p key={g} className="between" style={{ fontWeight: 600 }}><span>{g}</span><span className="mono">{items.filter((it) => val.m[it]).length}</span></p>)}
        </div>
      )}
    </fieldset>
  );
}

function Table({ b, v, set, lid }) {
  const val = v || {};
  const any = b.rows.some(([k]) => val[k]?.trim());
  return (
    <section className="stack" style={{ gap: 12 }} aria-label={b.label || 'Worksheet'}>
      {b.label && <p className="wb-q">{b.label}</p>}
      {b.rows.map(([k, label, ex]) => (
        <div key={k} className="stack" style={{ gap: 4 }}>
          <label htmlFor={id(lid, b.k, k)} style={{ fontWeight: 600, lineHeight: 1.3 }}>{label}</label>
          <textarea id={id(lid, b.k, k)} className="field" style={{ minHeight: 64 }} rows={2} value={val[k] || ''} placeholder={ex || ''} onChange={(e) => set({ ...val, [k]: e.target.value })} />
        </div>
      ))}
      {b.repeat && any && (
        <button type="button" className="btn" onClick={() => {
          addEntry({ kind: 'workbook', lessonId: lid, text: b.rows.filter(([k]) => val[k]?.trim()).map(([k, label]) => `${label}\n${val[k].trim()}`).join('\n\n') });
          set({}); toast('Saved to your journal. Fresh page.');
        }}>Save to journal and start fresh</button>
      )}
    </section>
  );
}

function Rows({ b, v, set }) {
  const arr = v || [];
  const n = Math.max(b.min || 1, arr.length);
  const get = (i) => arr[i] || {};
  const put = (i, k, x) => { const out = Array.from({ length: n }, (_, j) => get(j)); out[i] = { ...out[i], [k]: x }; set(out); };
  return (
    <fieldset className="stack wb-set" style={{ gap: 10 }}>
      <legend className="wb-q">{b.label}</legend>
      {Array.from({ length: n }, (_, i) => (
        <div key={i} className="wb-rowcard">
          {b.pre?.[i] && <p className="mono caps">{b.pre[i]}</p>}
          {b.cols.map(([k, label, kind]) => {
            if (b.pre && k === b.cols[0][0]) return null;
            if (kind === 'tick') return <button key={k} type="button" className="wb-row" style={{ padding: '6px 0' }} aria-pressed={!!get(i)[k]} onClick={() => put(i, k, !get(i)[k])}><span className="wb-box" aria-hidden="true">{get(i)[k] ? '✓' : ''}</span><span>{label}</span></button>;
            return (
              <label key={k} className="stack" style={{ gap: 3 }}>
                <span className="mono-s caps mute">{label}</span>
                <input className="field" value={get(i)[k] || ''} placeholder={i === 0 ? kind || '' : ''} onChange={(e) => put(i, k, e.target.value)} />
              </label>
            );
          })}
        </div>
      ))}
      {!b.pre && <button type="button" className="link-btn" style={{ alignSelf: 'flex-start' }} onClick={() => set([...Array.from({ length: n }, (_, j) => get(j)), {}])}>+ Add a row</button>}
    </fieldset>
  );
}

function Prefix({ b, src }) {
  const [step, setStep] = useState(0);
  const lines = (src || []).filter((x) => x?.trim());
  if (!lines.length) return <p className="notice">Write the harsh thoughts above first. Then they'll show up here, ready to read aloud.</p>;
  const [title, pre] = b.steps[step];
  const low = (t) => t.trim().replace(/[.!?]+$/, '').replace(/^([A-Z])(?=[a-z])/, (m) => m.toLowerCase());
  return (
    <section className="card card-lav stack" aria-live="polite">
      <p className="mono-s caps">{title}</p>
      {lines.map((t, i) => <p key={i} style={{ fontWeight: 700, lineHeight: 1.35, overflowWrap: 'anywhere' }}>{pre}{low(t)}.</p>)}
      <div className="seg" role="tablist" style={{ gridTemplateColumns: `repeat(${b.steps.length}, minmax(0, 1fr))` }}>
        {b.steps.map((s, i) => <button key={i} type="button" role="tab" aria-selected={step === i} onClick={() => setStep(i)}>Step {i + 1}</button>)}
      </div>
    </section>
  );
}

function Rewrite({ b, v, set }) {
  const [open, setOpen] = useState({});
  return (
    <fieldset className="stack wb-set" style={{ gap: 14 }}>
      <legend className="wb-q">{b.label}</legend>
      {b.rows.map(([dont, doo], i) => (
        <div key={i} className="stack" style={{ gap: 6 }}>
          <p style={{ textDecoration: 'line-through', textDecorationThickness: 2, opacity: 0.7 }}>{dont}</p>
          <input className="field" aria-label={`Rewrite: ${dont}`} value={v?.[i] || ''} placeholder="Ask for what you want…" onChange={(e) => set({ ...(v || {}), [i]: e.target.value })} />
          {open[i] ? <p className="mono" role="status">One way: {doo}</p>
            : <button type="button" className="link-btn" style={{ alignSelf: 'flex-start' }} onClick={() => setOpen({ ...open, [i]: true })}>Peek</button>}
        </div>
      ))}
    </fieldset>
  );
}

function Plan({ v, set }) {
  const val = { obj: '', goals: [{}, {}, {}], ...(v || {}) };
  const goal = (i, patch) => set({ ...val, goals: val.goals.map((g, j) => (j === i ? { ...g, ...patch } : g)) });
  return (
    <section className="stack" style={{ gap: 14 }} aria-label="Action plan">
      <div className="stack" style={{ gap: 6 }}>
        <label className="wb-q" htmlFor="wb-plan-obj">My overall objective</label>
        <textarea id="wb-plan-obj" className="field" style={{ minHeight: 64 }} value={val.obj} placeholder="e.g. recover from burnout and have more good things in my week" onChange={(e) => set({ ...val, obj: e.target.value })} />
      </div>
      {val.goals.map((g, i) => (
        <div key={i} className="wb-rowcard" style={{ gap: 8 }}>
          <p className="mono caps">Goal {i + 1}</p>
          <input className="field" aria-label={`Goal ${i + 1}`} value={g.goal || ''} placeholder={i === 0 ? "e.g. see people in ways that don't drain me" : ''} onChange={(e) => goal(i, { goal: e.target.value })} />
          <input className="field" aria-label={`Values behind goal ${i + 1}`} value={g.values || ''} placeholder="Values behind it" onChange={(e) => goal(i, { values: e.target.value })} />
          {[0, 1, 2].map((a) => (
            <div key={a} className="wb-num">
              <span className="mono" aria-hidden="true">{a + 1}</span>
              <input className="field" aria-label={`Goal ${i + 1}, small action ${a + 1}`} value={g.a?.[a] || ''} placeholder={i === 0 && a === 0 ? 'e.g. host a movie night at home' : 'Small action'} onChange={(e) => goal(i, { a: [0, 1, 2].map((x) => (x === a ? e.target.value : g.a?.[x] || '')) })} />
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}

export function WorkbookItems({ lesson, wb }) {
  const all = wb.ans[lesson.id] || {};
  return <div className="stack" style={{ gap: 22 }}>{lesson.items.map((b, i) => <Item key={i} b={b} lid={lesson.id} all={all} />)}</div>;
}

// ---------- answers as plain text, for the journal and for sharing ----------
export function answersText(lesson, ans = {}) {
  const out = [];
  for (const b of lesson.items || []) {
    const v = ans[b.k];
    if (b.t === 'head') { out.push(`· ${b.text}`); continue; }
    if (!b.k || blank(v)) continue;
    const L = b.label ? b.label.replace(/…$/, '') : '';
    let s = '';
    switch (b.t) {
      case 'text': case 'one': s = String(v).trim(); break;
      case 'list': case 'blanks': s = v.filter((x) => x?.trim()).map((x) => `• ${x.trim()}`).join('\n'); break;
      case 'chips': case 'feelwheel': s = (v.sel || []).map((x) => ((v.star || []).includes(x) ? `${x} ★` : x)).join(', '); break;
      case 'freq': s = FREQ[v]; break;
      case 'scale': s = `${v}/10 (0 = ${b.left}, 10 = ${b.right})`; break;
      case 'scales': s = Object.entries(v).map(([r, x]) => `${r}: ${x}/10`).join('\n'); break;
      case 'check': s = Object.entries(v.m || {}).map(([it, x]) => `• ${it}${x === 2 ? ' ★' : ''}`).join('\n'); break;
      case 'rank': s = v.map((x, i) => `${i + 1}. ${x}`).join('\n'); break;
      case 'table': s = b.rows.filter(([k]) => v[k]?.trim()).map(([k, l]) => `${l}: ${v[k].trim()}`).join('\n'); break;
      case 'rows': s = v.filter((r) => Object.values(r || {}).some((x) => x && String(x).trim())).map((r, i) => '• ' + (b.pre?.[i] ? b.pre[i] + ': ' : '') + b.cols.filter(([k]) => r[k]).map(([k, l, kind]) => (kind === 'tick' ? l : r[k])).join(' · ')).join('\n'); break;
      case 'pick': s = Object.entries(v).filter(([, j]) => j !== undefined).map(([i, j]) => `${b.rows[i]} ${b.options[j]}`).join('\n'); break;
      case 'pair': s = Object.entries(v).filter(([, x]) => x).map(([i, x]) => x.split('').map((c) => b.rows[i][c === 'a' ? 0 : 1]).join(' + ')).join('\n'); break;
      case 'strike': s = `Struck out ${v.length}`; break;
      case 'rewrite': s = Object.entries(v).filter(([, x]) => x?.trim()).map(([i, x]) => `${b.rows[i][0]} → ${x.trim()}`).join('\n'); break;
      case 'plan': s = [v.obj && `Objective: ${v.obj}`, ...(v.goals || []).filter((g) => g.goal).map((g, i) => `Goal ${i + 1}: ${g.goal}${g.values ? ` (${g.values})` : ''}${(g.a || []).filter(Boolean).map((a) => `\n  - ${a}`).join('')}`)].filter(Boolean).join('\n'); break;
      case 'radial': s = b.axes.filter(([n]) => v[n] != null).map(([n, , lv]) => `${n}: ${lv ? lv[v[n]] : `${v[n] + 1} of ${b.levels}`}`).join('\n'); break;
      case 'sensemap': s = b.rows.filter((r) => v[r] != null).map((r) => `${r}: ${v[r] < 34 ? 'seeking' : v[r] > 66 ? 'avoiding' : 'comfy'}`).join('\n'); break;
      case 'window': s = v.now == null ? '' : `Right now: ${v.now >= 67 ? 'above the window' : v.now >= 33 ? 'in the window' : 'below the window'}${v.log?.length ? ` (${v.log.length} logged)` : ''}`; break;
      case 'circles': s = ['Closest', 'Close', 'Around'].map((r, k) => { const n = Object.keys(v).filter((x) => v[x] === k); return n.length ? `${r}: ${n.join(', ')}` : ''; }).filter(Boolean).join('\n'); break;
      case 'pins': s = v.map((q, i) => `${i + 1}. ${q.label || '(no label)'}`).join('\n'); break;
      case 'spoonday': { const t = Object.entries(v.days || {}).slice(-1)[0]; s = t ? `${t[0]}: started with ${t[1].total}, spent ${t[1].spent.reduce((a, [, n]) => a + n, 0)} (${t[1].spent.map(([x]) => x).join(', ')})` : ''; break; }
      default: s = '';
    }
    if (s) out.push(L ? `${L}\n${s}` : s);
  }
  return out.filter((x, i, a) => !(x.startsWith('· ') && (i === a.length - 1 || a[i + 1].startsWith('· ')))).join('\n\n');
}

export function hasAnswers(lesson, ans) { return !!answersText(lesson, ans).replace(/^· .*$/gm, '').trim(); }
