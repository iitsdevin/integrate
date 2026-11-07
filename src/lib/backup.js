// Export and import. Your API key and your books are never included.
import { getState, setState, uid, localDate, dayDiff } from './store.js';
import { PLAN_START } from '../data/daily.js';

export function exportJson() {
  const s = getState();
  return JSON.stringify({ format: 'bmo2', exportedAt: new Date().toISOString(), data: s }, null, 2);
}

export async function shareOrDownload() {
  const text = exportJson();
  const name = `integrate-backup-${localDate()}.json`;
  const file = typeof File === 'function' ? new File([text], name, { type: 'application/json' }) : null;
  if (file && navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: 'Integrate backup' }); return 'shared'; }
    catch (e) { if (e?.name === 'AbortError') return 'cancelled'; }
  }
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url; a.download = name; document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return 'downloaded';
}

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
    course: { done: { ...(inc.course?.done || {}), ...(s.course?.done || {}) }, stepdown: { ...(inc.course?.stepdown || {}), ...(s.course?.stepdown || {}) } },
    settings: { ...s.settings, ...(inc.settings || {}) },
    buddy: { sessions: [...s.buddy.sessions, ...((inc.buddy?.sessions) || []).filter((x) => !s.buddy.sessions.some((y) => y.id === x.id))] },
  });
  return { sits: newSits.length, entries: newEntries.length };
}

// Week number of the 8-week plan for a date (1-based), or null outside it.
export function planWeek(date = localDate()) {
  const d = dayDiff(PLAN_START, date);
  if (d < 0) return null;
  return Math.floor(d / 7) + 1;
}
