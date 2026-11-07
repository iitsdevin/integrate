import { useEffect, useRef, useState } from 'react';

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
};

// 108 beads. Beads lit since the last render arrive with a small settle.
export function Mala({ count }) {
  const lit = count % 108;
  const round = Math.floor(count / 108);
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
        <p className="mono soft">{round ? `round ${round + 1}. ` : ''}one bead per sit. missed days leave no gap — just come back.</p>
      </div>
    </div>
  );
}

export function TabBar({ tab, onTab }) {
  const tabs = [['today', 'TODAY'], ['toolkit', 'TOOLKIT'], ['reflect', 'REFLECT']];
  return (
    <nav className="tabbar" aria-label="Sections">
      {tabs.map(([id, label]) => (
        <button key={id} type="button" aria-current={tab === id ? 'page' : undefined} onClick={() => onTab(id)}>
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

let toastSetter = null;
export function toast(text) { toastSetter?.(text); }
export function Toaster() {
  const [msg, setMsg] = useState(null);
  useEffect(() => {
    toastSetter = (t) => setMsg({ t, k: Date.now() });
    return () => { toastSetter = null; };
  }, []);
  useEffect(() => {
    if (!msg) return;
    const id = setTimeout(() => setMsg(null), 3200);
    return () => clearTimeout(id);
  }, [msg]);
  return msg ? <div key={msg.k} className="toast" role="status">{msg.t}</div> : null;
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
