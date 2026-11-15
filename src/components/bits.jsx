import { useEffect, useLayoutEffect, useRef, useState } from 'react';

export function Spark({ size = 20, style, color = 'currentColor' }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" className="spark" style={style}>
      <path d="M12 0 C13 9 15 11 24 12 C15 13 13 15 12 24 C11 15 9 13 0 12 C9 11 11 9 12 0 Z" fill={color} />
    </svg>
  );
}

export const Icon = {
  back: () => <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><path d="M15 4 L7 12 L15 20" /></svg>,
  arrow: () => <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><path d="M5 12 L19 12 M13 6 L19 12 L13 18" /></svg>,
  gear: () => (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" strokeLinecap="square" />
    </svg>
  ),
  plus: () => <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><path d="M12 4 V20 M4 12 H20" /></svg>,
  search: () => <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.5 15.5 L21 21" /></svg>,
  stop: () => <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24"><rect x="5" y="5" width="14" height="14" fill="currentColor" /></svg>,
};

// 108 beads. Beads lit since the last render arrive with a small settle.
// `full` shows a just-completed round as 108 of 108 rather than an empty new one.
export function Mala({ count, full = false }) {
  const lit = full ? 108 : count % 108;
  const round = full ? Math.floor(count / 108) - 1 : Math.floor(count / 108);
  const prev = useRef(null);
  const [fresh, setFresh] = useState(() => new Set());
  useEffect(() => {
    if (prev.current !== null && lit > prev.current) {
      const s = new Set(); for (let i = prev.current; i < lit; i++) s.add(i);
      setFresh(s);
    }
    prev.current = lit;
  }, [lit]);
  const beads = [];
  for (let i = 0; i < 108; i++) {
    const a = ((i + 0.5) / 108) * Math.PI * 2 - Math.PI / 2;
    beads.push(<circle key={i} cx={(40 + 35 * Math.cos(a)).toFixed(2)} cy={(40 + 35 * Math.sin(a)).toFixed(2)} r="1.7" className={(i < lit ? 'lit' : '') + (fresh.has(i) ? ' new' : '')} />);
  }
  return (
    <div className="mala-row rule">
      <svg className="mala" viewBox="0 0 80 80" role="img" aria-label={`Mala of 108 beads, ${lit} filled${round ? `, round ${round + 1}` : ''}`}>{beads}</svg>
      <div className="stack" style={{ gap: 4, minWidth: 0 }}>
        <p className="word count">{String(lit).padStart(3, '0')}<span>/108</span></p>
        <p className="hint">{round ? `Round ${round + 1}. ` : ''}One bead per sit. Missed days leave no gap; just come back.</p>
      </div>
    </div>
  );
}

// Name the current view in the page title: it is what a screen reader announces after
// navigating and what the browser's history lists.
export function useTitle(name) {
  useEffect(() => { document.title = name ? `${name} · Integrate` : 'Integrate'; }, [name]);
}

// Arrow keys move between tabs, Home and End jump to the ends. Put on the tablist.
export function onTabKeys(e) {
  const dir = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
  if (!dir && e.key !== 'Home' && e.key !== 'End') return;
  const tabs = [...e.currentTarget.querySelectorAll('[role="tab"]')];
  const i = tabs.indexOf(document.activeElement);
  if (i < 0) return;
  e.preventDefault();
  const next = e.key === 'Home' ? tabs[0] : e.key === 'End' ? tabs[tabs.length - 1] : tabs[(i + dir + tabs.length) % tabs.length];
  next.focus(); next.click();
}

// A slim bar that appears once a long page has scrolled past its heading, so the page
// name and the way back are always within reach.
export function PageBar({ title, onBack }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const check = () => setOn(window.scrollY > 150);
    check();
    window.addEventListener('scroll', check, { passive: true });
    return () => window.removeEventListener('scroll', check);
  }, []);
  return (
    <div className="pagebar" data-on={on || undefined} inert={!on}>
      <button type="button" className="btn icon-btn" onClick={onBack} aria-label="Back"><Icon.back /></button>
      <span className="word">{title}</span>
    </div>
  );
}

export function TabBar({ tab, onTab }) {
  const tabs = [['today', 'TODAY'], ['toolkit', 'TOOLKIT'], ['reflect', 'REFLECT']];
  const nav = useRef(null);
  const [mark, setMark] = useState(null); // where the lime marker sits: { x, w }
  // The marker is one element that travels to the chosen tab, rather than a
  // highlight that vanishes from one label and appears on another.
  useLayoutEffect(() => {
    const measure = () => {
      const el = nav.current?.querySelector('[aria-current="page"] span');
      if (!el) return;
      const a = nav.current.getBoundingClientRect(), b = el.getBoundingClientRect();
      setMark({ x: b.left - a.left, w: b.width });
    };
    measure();
    window.addEventListener('resize', measure);
    document.fonts?.ready?.then(measure).catch(() => {});
    return () => window.removeEventListener('resize', measure);
  }, [tab]);
  return (
    <nav ref={nav} className="tabbar" aria-label="Sections">
      {mark && <i className="tab-mark" aria-hidden="true" style={{ transform: `translateX(${mark.x}px)`, width: mark.w }} />}
      {tabs.map(([id, label]) => (
        <button key={id} type="button" aria-current={tab === id ? 'page' : undefined} onClick={() => onTab(id)}>
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

// Toasts. toast('Saved') or toast('Sit removed', { action: 'Undo', onAction: fn }).
// A toast raised before the Toaster is on screen (e.g. as the sit screen closes) waits for it.
//
// The toast is a manual popover, so it sits in the top layer above an open sheet. It
// lives in one named region so screen-reader users can always find it, is announced
// when it appears, has its own Close button, and waits while it is hovered or focused
// so there is time to reach Undo.
let toastSetter = null, pending = null;
export function toast(text, opts = {}) {
  const t = { text, ...opts, k: Date.now() + Math.random() };
  if (toastSetter) toastSetter(t); else pending = t;
}
export function Toaster() {
  const [msg, setMsg] = useState(null);
  const [leaving, setLeaving] = useState(false);
  const [held, setHeld] = useState(false);
  const box = useRef(null);
  useEffect(() => {
    toastSetter = (t) => { setLeaving(false); setHeld(false); setMsg(t); };
    if (pending) { toastSetter(pending); pending = null; }
    return () => { toastSetter = null; };
  }, []);
  // Show it in the top layer (re-shown for each message so it stacks above a sheet
  // opened since), and announce it. Only the words are announced, not the controls.
  useLayoutEffect(() => {
    const el = box.current;
    if (!msg || !el) return undefined;
    try { if (el.matches(':popover-open')) el.hidePopover(); el.showPopover(); } catch { /* no popover support: it is still a fixed element */ }
    const said = msg.text + (msg.action ? '. Actions available.' : '');
    try { document.ariaNotify?.(said); } catch { /* the live region below covers it */ }
    return () => { try { if (el.matches(':popover-open')) el.hidePopover(); } catch { /* ignore */ } };
  }, [msg]);
  useEffect(() => {
    if (!msg || held) return undefined;
    const out = setTimeout(() => setLeaving(true), msg.ms || (msg.action ? 7000 : 3200));
    return () => clearTimeout(out);
  }, [msg, held]);
  useEffect(() => {
    if (!leaving) return undefined;
    const id = setTimeout(() => { setMsg(null); setLeaving(false); }, 220);
    return () => clearTimeout(id);
  }, [leaving]);
  const notify = typeof document !== 'undefined' && typeof document.ariaNotify === 'function';
  return (
    <div role="region" aria-label="Notifications">
      {msg && (
        <div key={msg.k} ref={box} popover="manual" className="toast" data-leaving={leaving || undefined}
          onPointerEnter={() => setHeld(true)} onPointerLeave={() => setHeld(false)} onFocus={() => setHeld(true)} onBlur={() => setHeld(false)}>
          <span role={notify ? undefined : 'status'}>{msg.text}</span>
          {msg.action && <button type="button" onClick={() => { msg.onAction?.(); setLeaving(true); }}>{msg.action}</button>}
          <button type="button" className="toast-x" aria-label="Close notification" onClick={() => setLeaving(true)}>
            <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square"><path d="M5 5 L19 19 M19 5 L5 19" /></svg>
          </button>
        </div>
      )}
    </div>
  );
}

// Paragraphs, steps and notes for a practice.
export function PracticeBody({ item }) {
  return (
    <div className="prose">
      {item.who && <p className="mono caps mute">{item.who}{item.mins ? ' · ' + item.mins : ''}</p>}
      {!item.who && item.mins && <p className="mono caps mute">{item.mins}</p>}
      {item.summary && <p style={{ fontWeight: 600 }}>{item.summary}</p>}
      {item.intro && <p>{item.intro}</p>}
      {item.mantra && (
        <div className="card card-lav">
          <p style={{ fontWeight: 800, fontSize: '1.25rem' }}>{item.mantra.text}</p>
          <p className="mono">{item.mantra.say}</p>
        </div>
      )}
      {item.steps && <ol>{item.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>}
      {item.after && <p>{item.after}</p>}
      {item.when && <p><span className="mono caps">When · </span>{item.when}</p>}
      {item.note && <p className="soft">{item.note}</p>}
      {item.where && <p><span className="mono caps">Where · </span>{item.where}</p>}
    </div>
  );
}
