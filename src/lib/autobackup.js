// Automatic backup to a file you choose once (Android and desktop Chrome/Edge).
// The browser hands us a lasting handle to that file; after that the app rewrites
// it by itself a little after anything changes. iPhones do not offer this, so there
// the three-weekly reminder on Today stays as the way to back up.
import { useSyncExternalStore } from 'react';
import { subscribe as onStore, getState } from './store.js';
import { exportJson, AUTO_KEY } from './backup.js';

const DB = 'integrate-kv', STORE = 'kv', KEY = 'backup-file';
export const autoBackupSupported = () => typeof window !== 'undefined' && typeof window.showSaveFilePicker === 'function' && typeof indexedDB !== 'undefined';

function db() {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
async function kv(mode, fn) {
  const d = await db();
  return new Promise((res, rej) => {
    const t = d.transaction(STORE, mode), req = fn(t.objectStore(STORE));
    t.oncomplete = () => res(req?.result);
    t.onerror = () => rej(t.error);
  });
}

// status: 'off' | 'ok' | 'ask' (the browser wants permission again) | 'error'
let st = { status: 'off', name: '', lastAt: null };
let handle = null, timer = null, written = null, busy = false;
const listeners = new Set();
const set = (patch) => { st = { ...st, ...patch }; listeners.forEach((l) => l()); };
export function useAutoBackup() {
  return useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l); }, () => st);
}

function remember(name) {
  const lastAt = new Date().toISOString();
  try { localStorage.setItem(AUTO_KEY, JSON.stringify({ lastAt, name })); } catch { /* private mode */ }
  set({ status: 'ok', name, lastAt });
}

async function write() {
  if (!handle || busy) return false;
  const snapshot = getState();
  if (snapshot === written) return true; // nothing new since the last write
  busy = true;
  try {
    if ((await handle.queryPermission({ mode: 'readwrite' })) !== 'granted') { set({ status: 'ask' }); return false; }
    const w = await handle.createWritable();
    await w.write(exportJson());
    await w.close();
    written = snapshot;
    remember(handle.name);
    return true;
  } catch (e) {
    set({ status: e?.name === 'NotAllowedError' || e?.name === 'SecurityError' ? 'ask' : 'error' });
    return false;
  } finally { busy = false; }
}
const schedule = () => { clearTimeout(timer); timer = setTimeout(write, 20000); };

async function init() {
  if (!autoBackupSupported()) return;
  try {
    handle = (await kv('readonly', (s) => s.get(KEY))) || null;
    if (!handle) return;
    let last = null;
    try { last = JSON.parse(localStorage.getItem(AUTO_KEY) || 'null'); } catch { /* ignore */ }
    const ok = (await handle.queryPermission({ mode: 'readwrite' })) === 'granted';
    set({ status: ok ? 'ok' : 'ask', name: handle.name, lastAt: last?.lastAt || null });
    if (ok) schedule();
  } catch { /* stay off */ }
}
if (typeof window !== 'undefined') {
  init();
  onStore(() => { if (handle && st.status === 'ok') schedule(); });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && handle && st.status === 'ok') { clearTimeout(timer); write(); } });
}

// From a tap: pick (or create) the file, then write it straight away.
export async function chooseBackupFile() {
  try {
    handle = await window.showSaveFilePicker({ suggestedName: 'integrate-backup.json', types: [{ description: 'Integrate backup', accept: { 'application/json': ['.json'] } }] });
  } catch (e) { return e?.name === 'AbortError' ? 'cancelled' : 'failed'; }
  await kv('readwrite', (s) => s.put(handle, KEY)).catch(() => {});
  written = null;
  return (await write()) ? 'ok' : 'failed';
}
// From a tap: the browser asks again for permission to write the file.
export async function reconnectBackupFile() {
  if (!handle) return 'failed';
  try { if ((await handle.requestPermission({ mode: 'readwrite' })) !== 'granted') return 'cancelled'; } catch { return 'failed'; }
  written = null;
  return (await write()) ? 'ok' : 'failed';
}
export async function stopAutoBackup() {
  clearTimeout(timer); handle = null; written = null;
  await kv('readwrite', (s) => s.delete(KEY)).catch(() => {});
  try { localStorage.removeItem(AUTO_KEY); } catch { /* ignore */ }
  set({ status: 'off', name: '', lastAt: null });
}
