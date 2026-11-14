// App state. Small and synchronous in memory; written to localStorage shortly after a
// change (and at once when the page is hidden), so typing does not rewrite it per key.
// Books live in IndexedDB (see library.js); the API key lives in its own key and is never exported.
import { useSyncExternalStore } from 'react';
import { fixture } from '../dev/fixtures.js';

// Dev only: ?data=worst|empty|one swaps in a stress-test dataset and turns saving off.
export const DEV_DATA = import.meta.env.DEV && typeof location !== 'undefined' ? new URLSearchParams(location.search).get('data') : null;

const KEY = 'bmo2';
const KEY_API = 'bmo2.apikey';

export const DEFAULT_SETTINGS = {
  scheme: 'paper', mode: 'auto', bell: 'bowl', body: 'shake',
  aboutMe: '', model: 'claude-sonnet-5-5',
  sit: { connect: 3, dive: 14, integrate: 3 }, // minutes of the daily sit
  voice: false, // speak each phase aloud
  ambient: 'off', // sound under the sit: off | drone | rain | room
};
export const SIT_LIMITS = { connect: [1, 10], dive: [3, 45], integrate: [1, 15] };
export function sitLengths(settings = state.settings) {
  const out = {};
  for (const [k, [lo, hi]] of Object.entries(SIT_LIMITS)) {
    const n = Math.round(Number(settings?.sit?.[k]));
    out[k] = Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : DEFAULT_SETTINGS.sit[k];
  }
  return out;
}

const empty = () => ({
  v: 1,
  sits: [],
  journal: [],
  checkins: {},
  checks: {},
  plan: null,
  settings: { ...DEFAULT_SETTINGS },
  buddy: { sessions: [] },
  today: null, // { date, feel, body }
  course: { done: {}, stepdown: {} },
  wb: { done: {}, ans: {}, practiced: {} },
  pins: [], // ids of practices pinned to Today
});

function safeGet(k) { try { return localStorage.getItem(k); } catch { return null; } }
function safeSet(k, v) { try { localStorage.setItem(k, v); return true; } catch { return false; } }

function parse(raw) {
  const s = JSON.parse(raw);
  const base = empty();
  return { ...base, ...s, settings: { ...base.settings, ...(s.settings || {}) }, buddy: { ...base.buddy, ...(s.buddy || {}) }, pins: Array.isArray(s.pins) ? s.pins : [] };
}
function load() {
  if (import.meta.env.DEV && DEV_DATA) return fixture(DEV_DATA, empty());
  const raw = safeGet(KEY);
  if (!raw) return empty();
  try { return parse(raw); } catch { return empty(); }
}

let state = load();
let saveFailed = false;
let dirty = false, timer = null;
const listeners = new Set();
const saveListeners = new Set();
const READ_ONLY = !!(import.meta.env.DEV && DEV_DATA);

// Buddy conversations are the bulky part. If the browser refuses a save, drop their
// raw API transcripts (the readable conversation is kept) and try once more.
const slim = (s) => ({ ...s, buddy: { ...s.buddy, sessions: (s.buddy?.sessions || []).map((x) => ({ ...x, api: null })) } });

function write() {
  if (timer) { clearTimeout(timer); timer = null; }
  if (!dirty || READ_ONLY) return;
  dirty = false;
  let ok = safeSet(KEY, JSON.stringify(state));
  if (!ok) { ok = safeSet(KEY, JSON.stringify(slim(state))); if (ok) state = slim(state); }
  if (saveFailed !== !ok) { saveFailed = !ok; saveListeners.forEach((l) => l()); }
}
export const flush = write;

export function getState() { return state; }
export function setState(fn) {
  const next = typeof fn === 'function' ? fn(state) : { ...state, ...fn };
  if (next === state) return;
  state = next;
  dirty = true;
  if (!timer) timer = setTimeout(write, 250);
  listeners.forEach((l) => l());
}
export function subscribe(l) { listeners.add(l); return () => listeners.delete(l); }
export function useStore(selector = (s) => s) {
  return useSyncExternalStore(subscribe, () => selector(state));
}
export const lastSaveFailed = () => saveFailed;
export function useSaveFailed() {
  return useSyncExternalStore((l) => { saveListeners.add(l); return () => saveListeners.delete(l); }, () => saveFailed);
}

if (typeof window !== 'undefined' && window.addEventListener) {
  // Nothing may be left unsaved when the app goes to the background or closes.
  window.addEventListener('pagehide', write);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') write(); });
  // Another tab or window of the app saved: take its copy rather than overwrite it later.
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY || !e.newValue || READ_ONLY) return;
    try { state = parse(e.newValue); dirty = false; listeners.forEach((l) => l()); } catch { /* ignore a bad write */ }
  });
}

export const getApiKey = () => safeGet(KEY_API) || '';
export const setApiKey = (k) => { try { k ? localStorage.setItem(KEY_API, k) : localStorage.removeItem(KEY_API); } catch { /* private mode */ } };

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

// ---------- helpers that read and write slices ----------
export const updateSettings = (patch) => setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));

export function addSit(sit) {
  const full = { id: uid(), ...sit };
  setState((s) => ({ ...s, sits: [...s.sits, full].sort((a, b) => (a.at < b.at ? -1 : 1)) }));
  return full;
}
// Removing returns a function that puts back exactly what was taken, for Undo.
export function updateSit(id, patch) {
  setState((s) => ({ ...s, sits: s.sits.map((x) => (x.id === id ? { ...x, ...patch } : x)) }));
}
export function removeSit(id) {
  const sit = state.sits.find((x) => x.id === id);
  const notes = state.journal.filter((j) => j.sitId === id);
  setState((s) => ({ ...s, sits: s.sits.filter((x) => x.id !== id), journal: s.journal.filter((j) => j.sitId !== id) }));
  return () => {
    if (!sit) return;
    setState((s) => (s.sits.some((x) => x.id === id) ? s : {
      ...s,
      sits: [...s.sits, sit].sort((a, b) => (a.at < b.at ? -1 : 1)),
      journal: [...s.journal, ...notes.filter((n) => !s.journal.some((j) => j.id === n.id))],
    }));
  };
}
export function addEntry(entry) {
  const full = { id: uid(), at: new Date().toISOString(), kind: 'note', ...entry };
  setState((s) => ({ ...s, journal: [...s.journal, full] }));
  return full;
}
export function updateEntry(id, patch) {
  setState((s) => ({ ...s, journal: s.journal.map((j) => (j.id === id ? { ...j, ...patch } : j)) }));
}
export function removeEntry(id) {
  const i = state.journal.findIndex((j) => j.id === id);
  const entry = state.journal[i];
  setState((s) => ({ ...s, journal: s.journal.filter((j) => j.id !== id) }));
  return () => {
    if (!entry) return;
    setState((s) => {
      if (s.journal.some((j) => j.id === id)) return s;
      const journal = [...s.journal]; journal.splice(Math.min(i, journal.length), 0, entry);
      return { ...s, journal };
    });
  };
}
export function togglePin(id) {
  let on = false;
  setState((s) => { const has = (s.pins || []).includes(id); on = !has; return { ...s, pins: has ? s.pins.filter((x) => x !== id) : [...(s.pins || []), id] }; });
  return on;
}
export function setCheck(id, on) { setState((s) => ({ ...s, checks: { ...s.checks, [id]: on } })); }
export function setCheckin(week, data) {
  setState((s) => ({ ...s, checkins: { ...s.checkins, [week]: { ...(s.checkins[week] || {}), ...data, at: new Date().toISOString() } } }));
}
export function setPlan(plan) { setState((s) => ({ ...s, plan })); }
export function setToday(patch) {
  setState((s) => ({ ...s, today: { ...(s.today?.date === localDate() ? s.today : { date: localDate() }), ...patch } }));
}

// ---------- dates ----------
const pad = (n) => String(n).padStart(2, '0');
export const localDate = (d = new Date()) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
export const dayDiff = (a, b) => Math.round((Date.UTC(...ymd(b)) - Date.UTC(...ymd(a))) / 864e5);
function ymd(s) { const [y, m, d] = s.split('-').map(Number); return [y, m - 1, d]; }
export const timeOf = (iso) => new Date(iso).toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' });
export const shortDate = (iso) => new Date(iso).toLocaleDateString('en-AU', { weekday: 'short', day: '2-digit', month: 'short' }).toUpperCase().replace(/,/g, '');
