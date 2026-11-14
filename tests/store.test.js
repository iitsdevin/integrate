import { describe, it, expect, beforeEach } from 'vitest';
import { getState, setState, addSit, removeSit, addEntry, removeEntry, togglePin, sitLengths } from '../src/lib/store.js';
import { importText, exportJson } from '../src/lib/backup.js';

beforeEach(() => setState((s) => ({ ...s, sits: [], journal: [], checkins: {}, pins: [], plan: null, buddy: { sessions: [] } })));

describe('undo', () => {
  it('removing a sit takes its note with it, and undo puts both back', () => {
    const a = addSit({ at: '2026-11-10T07:00:00.000Z', label: 'A', minutes: 20 });
    const b = addSit({ at: '2026-11-11T07:00:00.000Z', label: 'B', minutes: 20 });
    addEntry({ text: 'note for a', sitId: a.id, at: a.at });
    addEntry({ text: 'free note' });
    const undo = removeSit(a.id);
    expect(getState().sits.map((x) => x.id)).toEqual([b.id]);
    expect(getState().journal.map((j) => j.text)).toEqual(['free note']);
    undo();
    expect(getState().sits.map((x) => x.label)).toEqual(['A', 'B']); // back in date order
    expect(getState().journal.map((j) => j.text).sort()).toEqual(['free note', 'note for a']);
    undo(); // a second undo changes nothing
    expect(getState().sits).toHaveLength(2);
  });
  it('removing a note can be undone, in its old place', () => {
    const one = addEntry({ text: 'one' }); addEntry({ text: 'two' });
    const undo = removeEntry(one.id);
    expect(getState().journal.map((j) => j.text)).toEqual(['two']);
    undo();
    expect(getState().journal.map((j) => j.text)).toEqual(['one', 'two']);
  });
});

describe('pins and sit lengths', () => {
  it('toggles a pin', () => {
    expect(togglePin('zazen')).toBe(true);
    expect(getState().pins).toEqual(['zazen']);
    expect(togglePin('zazen')).toBe(false);
    expect(getState().pins).toEqual([]);
  });
  it('falls back to 3/14/3 and keeps lengths within limits', () => {
    expect(sitLengths({})).toEqual({ connect: 3, dive: 14, integrate: 3 });
    expect(sitLengths({ sit: { connect: 0, dive: 500, integrate: 'x' } })).toEqual({ connect: 1, dive: 45, integrate: 3 });
  });
});

describe('import', () => {
  it('merges a backup without duplicating or losing anything', () => {
    const mine = addSit({ at: '2026-11-10T07:00:00.000Z', label: 'Mine', minutes: 20 });
    addEntry({ text: 'kept', at: '2026-11-10T08:00:00.000Z' });
    const backup = JSON.parse(exportJson());
    backup.data.sits.push({ id: 'x1', at: '2026-11-09T07:00:00.000Z', label: 'Older', minutes: 12 });
    backup.data.journal.push({ id: 'j9', at: '2026-11-09T07:30:00.000Z', kind: 'sit', sitId: 'x1', text: 'older note' });
    backup.data.pins = ['tapping'];
    const r = importText(JSON.stringify(backup));
    expect(r).toEqual({ sits: 1, entries: 1 });
    expect(getState().sits.map((x) => x.label)).toEqual(['Older', 'Mine']);
    expect(getState().sits.filter((x) => x.id === mine.id)).toHaveLength(1);
    expect(getState().pins).toEqual(['tapping']);
    expect(importText(JSON.stringify(backup))).toEqual({ sits: 0, entries: 0 }); // importing twice adds nothing
  });
  it('refuses text that is not a backup', () => {
    expect(() => importText('hello')).toThrow();
    expect(() => importText('{"a":1}')).toThrow();
    expect(() => importText(JSON.stringify({ format: 'bmo2', data: { sits: 'nope' } }))).toThrow();
  });
});
