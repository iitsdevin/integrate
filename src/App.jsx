import { useCallback, useEffect, useState } from 'react';
import { useStore, getState, addSit, addEntry } from './lib/store.js';
import { applyTheme, onSystemThemeChange } from './lib/theme.js';
import { ring, unlockAudio, preloadBells } from './lib/bells.js';
import { bodyOption } from './data/daily.js';
import { TabBar, Toaster } from './components/bits.jsx';
import Today from './screens/Today.jsx';
import Toolkit from './screens/Toolkit.jsx';
import Library from './screens/Library.jsx';
import Reflect from './screens/Reflect.jsx';
import Buddy from './screens/Buddy.jsx';
import Settings from './screens/Settings.jsx';
import Sit, { Done, saveActive, loadActive } from './screens/Sit.jsx';
import DevDataToggle from './dev/DevDataToggle.jsx';

// Routes live in the hash so the Android back button and reloads behave: #today, #toolkit/zen, #reflect
function parseHash() {
  const [tab, view] = location.hash.replace(/^#\/?/, '').split('/');
  return { tab: ['today', 'toolkit', 'reflect'].includes(tab) ? tab : 'today', view: tab === 'toolkit' ? view || null : null };
}

export default function App() {
  const settings = useStore((s) => s.settings);
  const [route, setRoute] = useState(parseHash);
  const [active, setActive] = useState(() => {
    const a = loadActive();
    if (!a) return null;
    const over = (Date.now() - a.start) / 1000 - a.phases.reduce((n, p) => n + p.min, 0) * 60;
    if (over > 3600) { saveActive(null); return null; } // a sit left open for over an hour is dropped
    return a;
  });
  const [done, setDone] = useState(null);
  const [buddy, setBuddy] = useState({ open: false, starter: null });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [askBook, setAskBook] = useState(null);

  // Theme: scheme + light/dark, re-applied when the phone's setting changes or the sit screen exits.
  useEffect(() => {
    const apply = () => applyTheme(getState().settings);
    apply();
    const off = onSystemThemeChange(apply);
    window.addEventListener('bmo:theme', apply);
    return () => { off(); window.removeEventListener('bmo:theme', apply); };
  }, [settings.scheme, settings.mode]);

  useEffect(() => { preloadBells(settings.bell); }, [settings.bell]);

  useEffect(() => {
    const on = () => setRoute(parseHash());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);

  const go = useCallback((tab, view = null) => {
    const h = '#' + tab + (view ? '/' + view : '');
    if (location.hash !== h) location.hash = h; else setRoute(parseHash());
    window.scrollTo(0, 0);
  }, []);

  function begin(plan) {
    unlockAudio();
    const t = getState().today;
    const a = {
      kind: plan.kind, label: plan.label, day: plan.day || 0,
      phases: plan.phases.map((p) => ({ label: p.label, min: p.min, text: p.text, name: p.name, body: p.body })),
      start: Date.now(), idx: 0, rough: false,
      feel: t?.feel || null,
    };
    saveActive(a); setActive(a);
    ring(getState().settings.bell, 1);
  }

  function end({ completed, secs, active: a }) {
    setActive(null);
    if (!completed && secs < 60) return; // stopped straight away: nothing to log
    const bodyPhase = a.phases.find((p) => p.body);
    const sit = addSit({
      at: new Date(a.start).toISOString(), kind: a.kind, label: a.label, minutes: Math.max(1, Math.round(secs / 60)),
      done: completed && !a.rough, rough: a.rough, feel: a.feel, bodyName: bodyPhase ? bodyOption(bodyPhase.body).name : null,
    });
    setDone({ completed, secs, active: a, sit });
  }

  if (active) return <Sit active={active} bell={settings.bell} onEnd={end} />;
  if (done) return (
    <div className="app">
      <Done result={done} onSave={(note) => {
        if (note) addEntry({ text: note, kind: 'sit', sitId: done.sit.id, at: done.sit.at });
        setDone(null); go('today');
      }} />
    </div>
  );

  return (
    <div className="app">
      {route.tab === 'today' && <Today onBegin={begin} onSettings={() => setSettingsOpen(true)} onBuddy={(starter) => setBuddy({ open: true, starter })} />}
      {route.tab === 'toolkit' && route.view === 'library' && (
        <Library onBack={() => go('toolkit')} focusBook={askBook} onSettings={() => setSettingsOpen(true)} />
      )}
      {route.tab === 'toolkit' && route.view !== 'library' && (
        <Toolkit view={route.view} onView={(v) => go('toolkit', v)} onBegin={begin} onAskBook={(id) => { setAskBook(id); go('toolkit', 'library'); }} />
      )}
      {route.tab === 'reflect' && <Reflect onBuddy={(starter) => setBuddy({ open: true, starter })} />}
      <TabBar tab={route.tab} onTab={(t) => go(t)} />
      <Buddy open={buddy.open} starter={buddy.starter} onClose={() => setBuddy({ open: false, starter: null })} onSettings={() => { setBuddy({ open: false, starter: null }); setSettingsOpen(true); }} />
      <Settings open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <Toaster />
      {import.meta.env.DEV && <DevDataToggle />}
    </div>
  );
}
