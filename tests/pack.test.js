import { describe, it, expect } from 'vitest';
import { checkPack } from '../scripts/check-pack.mjs';

export const SAMPLE = {
  format: 'integrate-pack', id: 'sample-pack', title: 'Sample pack', blurb: 'A tiny pack used by the tests.',
  source: { title: 'Notes of my own', authors: 'Me' },
  needs: [['wired', 'Wired'], ['flat', 'Flat']],
  help: { title: 'If this is too much', lines: ['Stop and contact someone you trust.'] },
  modules: [{
    id: 'm1', name: 'Arriving', intro: 'Start here.',
    lessons: [
      { id: 'idea', title: 'One idea', short: 'What arriving means.', pg: '3', body: ['A paragraph.', { t: 'h', text: 'A heading' }, { t: 'list', items: ['one', 'two'] }] },
      { id: 'sort', title: 'Sort it', short: 'Name what is here.', needs: ['wired'], help: true, items: [
        { t: 'note', text: 'Take your time.' },
        { t: 'list', k: 'people', label: 'People who steady me', n: 3 },
        { t: 'circles', k: 'near', label: 'How close', from: 'people', rings: ['Closest', 'Close', 'Around'] },
        { t: 'chips', k: 'words', label: 'Pick the words that fit', options: ['tired', 'tense', 'open'], star: 2 },
        { t: 'scale', k: 'calm', label: 'How calm?', left: 'not at all', right: 'very' },
        { t: 'table', k: 'log', label: 'A log', rows: [['when', 'When', 'e.g. 7am'], ['what', 'What happened']], repeat: true },
      ] },
      { id: 'sit', title: 'A short practice', short: 'Three breaths.', needs: ['flat'], steps: ['Breathe in.', 'Breathe out, slowly.'], stepSecs: 20,
        items: [{ t: 'show', from: 'sort', keys: [['words', 'Your words']], label: 'From before' }] },
    ],
  }],
};
const clone = (x) => JSON.parse(JSON.stringify(x));

describe('pack checker', () => {
  it('passes a well-formed pack', () => {
    const r = checkPack(SAMPLE);
    expect(r.errors).toEqual([]);
    expect([r.modules, r.lessons]).toEqual([1, 3]);
  });
  it('names the lesson and item at fault', () => {
    const p = clone(SAMPLE);
    p.id = 'Bad Id';
    p.modules[0].lessons[1].items[3].k = 'people';            // duplicate key
    p.modules[0].lessons[1].items[2].from = 'nobody';         // circles needs a list key
    p.modules[0].lessons[1].items.push({ t: 'sparkle', k: 'x' });
    p.modules[0].lessons[2].items[0].from = 'missing-lesson';
    p.modules[0].lessons[2].needs = ['sleepy'];
    p.modules[0].lessons[0].id = 'sort';                      // duplicate lesson id
    p.modules[0].lessons.push({ id: 'empty', title: 'Nothing here', short: 'x' });
    const e = checkPack(p).errors.join('\n');
    expect(e).toMatch(/"id" must be/);
    expect(e).toMatch(/key "people" is already used/);
    expect(e).toMatch(/"from": "nobody" must be the key of a list item/);
    expect(e).toMatch(/unknown item type "sparkle"/);
    expect(e).toMatch(/points at lesson "missing-lesson"/);
    expect(e).toMatch(/needs "sleepy" is not in the pack/);
    expect(e).toMatch(/id "sort" is used by another lesson/);
    expect(e).toMatch(/"Nothing here": is empty/);
  });
  it('rejects things that are not packs', () => {
    expect(checkPack({}).errors.length).toBeGreaterThan(2);
    expect(checkPack({ format: 'integrate-pack', id: 'ok', title: 'T', modules: [] }).errors.join()).toMatch(/at least one module/);
  });
});
