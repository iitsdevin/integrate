import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useStore, getState, addSit, addEntry, useSaveFailed, flush } from './lib/store.js';
import { applyTheme, onSystemThemeChange } from './lib/theme.js';
import { ring, unlockAudio, preloadBells } from './lib/bells.js';
import { bodyOption } from './data/daily.js';
import { TabBar, Toaster, toast } from './components/bits.jsx';
import Today from './screens/Today.jsx';
import Reflect from './screens/Reflect.jsx';
import Settings from './screens/Settings.jsx';
import Sit, { Done, saveActive, loadActive } from './screens/Sit.jsx';
import DevDataToggle from './dev/DevDataToggle.jsx';

// Today and Reflect load with the app. The Toolkit (with the course and workbook
// content), the library and the buddy arrive as their own chunks when first opened;
// the service worker has already cached them, so this works offline too.
const Toolkit = lazy(() => import('./screens/Toolkit.jsx'));
const Library = lazy(() => import('./screens/Library.jsx'));
const Buddy = lazy(() => import('./screens/Buddy.jsx'));

try { history.scrollRestoration = 'manual'; } catch { /* older browsers */ }
// Where each page was scrolled to, so coming back to a list lands where you left it.
const scrollPos = new Map();

// Routes live in the hash so the Android back button and reloads behave: #today, #toolkit/zen, #reflect
function parseHash() {
  const [tab, view] = location.hash.replace(/^#\/?/, '').split('/');
  return { tab: ['today', 'toolkit', 'reflect'].includes(tab) ? tab : 'today', view: tab === 'toolkit' ? view || null : null };
}

export default function App() {
  const settings = useStore((s) => s.settings);
  const [route, setRoute] = useState(parseHash);
  const [nav, setNav] = useState('tab'); // how we arrived: 'tab' | 'push' | 'pop'
  const routeRef = useRef(route);
  const saveFailed = useSaveFailed();
  const [active, setActive] = useState(() => {
    const a = loadActive();
    if (!a) return null;
    const over = (Date.now() - a.start) / 1000 - a.phases.reduce((n, p) => n + p.min, 0) * 60;
    if (over > 3600) { saveActive(null); return null; } // a sit left open for over an hour is dropped
    return a;
  });
  const [done, setDone] = useState(null);
  const [buddy, setBuddy] = useState({ open: false, starter: null });
  const [buddyUsed, setBuddyUsed] = useState(false); // load the buddy only once it is first opened
  const openBuddy = (starter) => { setBuddyUsed(true); setBuddy({ open: true, starter }); };
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
    const on = () => {
      const next = parseHash(), prev = routeRef.current;
      const deeper = (next.view ? 1 : 0) - (prev.view ? 1 : 0);
      setNav(next.tab !== prev.tab ? 'tab' : deeper > 0 ? 'push' : deeper < 0 ? 'pop' : 'tab');
      routeRef.current = next;
      setRoute(next);
    };
    const onScroll = () => scrollPos.set(location.hash || '#today', window.scrollY);
    window.addEventListener('hashchange', on);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('hashchange', on); window.removeEventListener('scroll', onScroll); };
  }, []);

  // New page: start at the top. Back to a parent page: return to where it was.
  // Read the saved position before the new page can clamp it, apply it after the
  // page's own effects have run.
  const wanted = useRef(0);
  useLayoutEffect(() => {
    wanted.current = nav === 'pop' ? scrollPos.get(location.hash || '#today') || 0 : 0;
  }, [route, nav]);
  useEffect(() => {
    const y = wanted.current;
    window.scrollTo(0, y);
    if (!y) return undefined;
    const id = requestAnimationFrame(() => window.scrollTo(0, y)); // again once lazy content has laid out
    return () => cancelAnimationFrame(id);
  }, [route]);

  const go = useCallback((tab, view = null) => {
    const h = '#' + tab + (view ? '/' + view : '');
    if (location.hash !== h) location.hash = h;
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
    if (!completed && secs < 60) { toast('Stopped before a minute, so nothing was logged.'); return; }
    const bodyPhase = a.phases.find((p) => p.body);
    const sit = addSit({
      at: new Date(a.start).toISOString(), kind: a.kind, label: a.label, minutes: Math.max(1, Math.round(secs / 60)),
      done: completed && !a.rough, rough: a.rough, feel: a.feel, bodyName: bodyPhase ? bodyOption(bodyPhase.body).name : null,
    });
    flush(); // a finished sit is written straight away
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
    <div className="app" data-nav={nav}>
      {saveFailed && (
        <button type="button" className="save-warn" role="alert" onClick={() => setSettingsOpen(true)}>
          This browser isn’t saving your changes. Tap to export a backup before you close the app.
        </button>
      )}
      {route.tab === 'today' && <Today onBegin={begin} onSettings={() => setSettingsOpen(true)} onBuddy={openBuddy} />}
      <Suspense fallback={<main className="screen" aria-busy="true"><p className="mono caps mute">Opening…</p></main>}>
        {route.tab === 'toolkit' && route.view === 'library' && (
          <Library onBack={() => go('toolkit')} focusBook={askBook} onSettings={() => setSettingsOpen(true)} />
        )}
        {route.tab === 'toolkit' && route.view !== 'library' && (
          <Toolkit view={route.view} onView={(v) => go('toolkit', v)} onBegin={begin} onAskBook={(id) => { setAskBook(id); go('toolkit', 'library'); }} />
        )}
      </Suspense>
      {route.tab === 'reflect' && <Reflect onBuddy={openBuddy} />}
      <TabBar tab={route.tab} onTab={(t) => go(t)} />
      <Suspense fallback={null}>
        {buddyUsed && <Buddy open={buddy.open} starter={buddy.starter} onClose={() => setBuddy({ open: false, starter: null })} onSettings={() => { setBuddy({ open: false, starter: null }); setSettingsOpen(true); }} />}
      </Suspense>
      <Settings open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <Toaster />
      {import.meta.env.DEV && <DevDataToggle />}
    </div>
  );
}
