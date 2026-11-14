// Export and import. Your API key and your books are never included.
import { getState, setState, uid, localDate, dayDiff } from './store.js';
import { PLAN_START, DEFAULT_PLAN } from '../data/daily.js';

export function exportJson() {
  const s = getState();
  return JSON.stringify({ format: 'bmo2', exportedAt: new Date().toISOString(), data: s }, null, 2);
}

export async function shareOrDownload() {
  const text = exportJson();
  const name = `integrate-backup-${localDate()}.json`;
  const file = typeof File === 'function' ? new File([text], name, { type: 'application/json' }) : null;
  if (file && navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: 'Integrate backup' }); markBackedUp(); return 'shared'; }
    catch (e) { if (e?.name === 'AbortError') return 'cancelled'; }
  }
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url; a.download = name; document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  markBackedUp();
  return 'downloaded';
}

// Backup reminder: due when there's something to lose and the last backup is 3+ weeks old (or never).
const DAY = 864e5;
export function markBackedUp() { setState((s) => ({ ...s, backup: { ...(s.backup || {}), lastAt: new Date().toISOString(), snoozeUntil: null } })); }
export function snoozeBackup(days = 7) { setState((s) => ({ ...s, backup: { ...(s.backup || {}), snoozeUntil: new Date(Date.now() + days * DAY).toISOString() } })); }
export function backupDue(s) {
  if (!s.sits.length && !s.journal.length) return false;
  const b = s.backup || {};
  if (b.snoozeUntil && new Date(b.snoozeUntil) > new Date()) return false;
  return !b.lastAt || Date.now() - new Date(b.lastAt) > 21 * DAY;
}
export function daysSinceBackup(s) { return s.backup?.lastAt ? Math.floor((Date.now() - new Date(s.backup.lastAt)) / DAY) : null; }

const MOODS = { forest: ['moss'], dawn: ['apricot'], clay: ['apricot'], dusk: ['cobalt'], ink: ['paper', 'dark'] };

// The old Claude page stored { days: { 'YYYY-MM-DD': { sits: [...] } }, extra: {...} }.
function fromArtifact(raw) {
  const sits = [], journal = [];
  for (const sit of Object.values(raw.days || {}).flatMap((d) => d.sits || [])) {
    const id = uid();
    sits.push({ id, at: sit.at, kind: sit.kind, label: sit.label === 'Body, Mantra, Open' ? 'Connect, Dive, Integrate' : sit.label, minutes: sit.minutes || 0, done: !!sit.done, rough: !!sit.rough, feel: sit.feel || null, bodyName: sit.ground ? 'Feet, Weight, Earth' : sit.wired ? 'Slow walking or long exhales' : null });
    if (sit.note) journal.push({ id: uid(), at: sit.at, kind: 'sit', sitId: id, text: sit.note });
  }
  const checkins = {};
  for (const [w, c] of Object.entries(raw.extra?.checkins || {})) checkins['W' + w] = { ...c, at: c.at || null };
  const checks = { ...(raw.extra?.setup || {}), ...(raw.extra?.todos || {}) };
  const settings = {};
  if (raw.extra?.bell) settings.bell = raw.extra.bell;
  const m = MOODS[raw.extra?.mood];
  if (m) { settings.scheme = m[0]; if (m[1]) settings.mode = m[1]; }
  return { sits, journal, checkins, checks, settings };
}

// Merge: nothing you already have is lost; duplicates (same time) are skipped.
export function importText(text) {
  let raw;
  try { raw = JSON.parse(text); } catch { throw new Error("That doesn't look like a backup. Paste the whole thing, including the first { and last }."); }
  let inc;
  if (raw?.format === 'bmo-artifact-v1' || raw?.days) inc = fromArtifact(raw);
  else if (raw?.format === 'bmo2' && raw.data) inc = raw.data;
  else throw new Error("That doesn't look like an Integrate backup.");
  if (!inc || typeof inc !== 'object' || (inc.sits && !Array.isArray(inc.sits)) || (inc.journal && !Array.isArray(inc.journal))) throw new Error("That backup is damaged and can't be read.");

  const s = getState();
  const haveSit = new Set(s.sits.map((x) => x.at));
  const newSits = (inc.sits || []).filter((x) => x.at && !haveSit.has(x.at));
  const keepIds = new Set(newSits.map((x) => x.id));
  const haveEntry = new Set(s.journal.map((j) => j.at + '|' + j.text));
  const newEntries = (inc.journal || []).filter((j) => !haveEntry.has(j.at + '|' + j.text) && (!j.sitId || keepIds.has(j.sitId) || s.sits.some((x) => x.id === j.sitId)));
  setState({
    ...s,
    sits: [...s.sits, ...newSits].sort((a, b) => (a.at < b.at ? -1 : 1)),
    journal: [...s.journal, ...newEntries],
    checkins: { ...(inc.checkins || {}), ...s.checkins },
    checks: { ...(inc.checks || {}), ...s.checks },
    plan: s.plan || inc.plan || null,
    pins: [...new Set([...(s.pins || []), ...(Array.isArray(inc.pins) ? inc.pins : [])])],
    backup: s.backup || null,
    course: Object.fromEntries(['done', 'stepdown', 'values', 'bullseye', 'sheets', 'practiced', 'quiz'].map((k) => [k, { ...(inc.course?.[k] || {}), ...(s.course?.[k] || {}) }])),
    wb: (() => { const a = inc.wb || {}, b = s.wb || {}; const ans = { ...(a.ans || {}) }; for (const [l, v] of Object.entries(b.ans || {})) ans[l] = { ...(ans[l] || {}), ...v }; return { done: { ...(a.done || {}), ...(b.done || {}) }, practiced: { ...(a.practiced || {}), ...(b.practiced || {}) }, saved: { ...(a.saved || {}), ...(b.saved || {}) }, ans }; })(),
    settings: { ...s.settings, ...(inc.settings || {}) },
    buddy: { sessions: [...s.buddy.sessions, ...((inc.buddy?.sessions) || []).filter((x) => !s.buddy.sessions.some((y) => y.id === x.id))] },
  });
  return { sits: newSits.length, entries: newEntries.length };
}

// Week of a plan for a date (1-based). Null before the plan starts and after it ends,
// so check-ins and the "WK 02/08" label stop when the plan does.
export function planWeek(plan = DEFAULT_PLAN, date = localDate()) {
  const p = plan || DEFAULT_PLAN;
  const d = dayDiff(p.from || PLAN_START, date);
  if (!(d >= 0)) return null;
  if (p.to && date > p.to) return null;
  const wk = Math.floor(d / 7) + 1;
  return p.weeks ? Math.min(wk, p.weeks) : wk;
}
// Check-ins are stored per plan week. The built-in plan keeps its original 'W3' keys.
export const checkinKey = (plan, wk) => (!plan || plan.source === 'default' ? 'W' + wk : `${plan.id || plan.from}:W${wk}`);
export const checkinWeek = (key) => (/W(\d+)$/.exec(key) || [])[1] || '';
