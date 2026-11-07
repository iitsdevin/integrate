// App state. Small, synchronous, saved to localStorage on every change.
// Books live in IndexedDB (see library.js); the API key lives in its own key and is never exported.
import { useSyncExternalStore } from 'react';
import { fixture } from '../dev/fixtures.js';

// Dev only: ?data=worst|empty|one swaps in a stress-test dataset and turns saving off.
export const DEV_DATA = import.meta.env.DEV ? new URLSearchParams(location.search).get('data') : null;

const KEY = 'bmo2';
const KEY_API = 'bmo2.apikey';

export const DEFAULT_SETTINGS = {
  scheme: 'paper', mode: 'auto', bell: 'bowl', body: 'shake',
  aboutMe: '', model: 'claude-sonnet-5-5',
};

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
});

function safeGet(k) { try { return localStorage.getItem(k); } catch { return null; } }
function safeSet(k, v) { try { localStorage.setItem(k, v); return true; } catch { return false; } }

function load() {
  if (import.meta.env.DEV && DEV_DATA) return fixture(DEV_DATA, empty());
  const raw = safeGet(KEY);
  if (!raw) return empty();
  try {
    const s = JSON.parse(raw);
    const base = empty();
    return { ...base, ...s, settings: { ...base.settings, ...(s.settings || {}) }, buddy: { ...base.buddy, ...(s.buddy || {}) } };
  } catch { return empty(); }
}

let state = load();
let saveFailed = false;
const listeners = new Set();

export function getState() { return state; }
export function setState(fn) {
  const next = typeof fn === 'function' ? fn(state) : { ...state, ...fn };
  if (next === state) return;
  state = next;
  if (!(import.meta.env.DEV && DEV_DATA)) saveFailed = !safeSet(KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
}
export function subscribe(l) { listeners.add(l); return () => listeners.delete(l); }
export function useStore(selector = (s) => s) {
  return useSyncExternalStore(subscribe, () => selector(state));
}
export const lastSaveFailed = () => saveFailed;

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
export function removeSit(id) {
  setState((s) => ({ ...s, sits: s.sits.filter((x) => x.id !== id), journal: s.journal.filter((j) => j.sitId !== id) }));
}
export function addEntry(entry) {
  const full = { id: uid(), at: new Date().toISOString(), kind: 'note', ...entry };
  setState((s) => ({ ...s, journal: [...s.journal, full] }));
  return full;
}
export function updateEntry(id, patch) {
  setState((s) => ({ ...s, journal: s.journal.map((j) => (j.id === id ? { ...j, ...patch } : j)) }));
}
export function removeEntry(id) { setState((s) => ({ ...s, journal: s.journal.filter((j) => j.id !== id) })); }
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
