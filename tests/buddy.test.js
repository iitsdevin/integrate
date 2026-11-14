import { describe, it, expect } from 'vitest';
import { sseParser, messageBuilder } from '../src/lib/sse.js';
import { parseBlocks } from '../src/components/Markdown.jsx';
import { summarise } from '../src/components/Patterns.jsx';

const frame = (o) => `event: ${o.type}\ndata: ${JSON.stringify(o)}\n\n`;

describe('streamed replies', () => {
  it('rebuilds text, thinking and a tool call from events split across chunks', () => {
    const seen = [];
    const b = messageBuilder({ onText: (t) => seen.push(t) });
    const feed = sseParser(b.apply);
    const stream = [
      { type: 'message_start', message: { usage: { input_tokens: 10 } } },
      { type: 'content_block_start', index: 0, content_block: { type: 'thinking', thinking: '', signature: '' } },
      { type: 'content_block_delta', index: 0, delta: { type: 'thinking_delta', thinking: 'hm' } },
      { type: 'content_block_delta', index: 0, delta: { type: 'signature_delta', signature: 'SIG' } },
      { type: 'content_block_stop', index: 0 },
      { type: 'content_block_start', index: 1, content_block: { type: 'text', text: '' } },
      { type: 'content_block_delta', index: 1, delta: { type: 'text_delta', text: 'Let me ' } },
      { type: 'ping' },
      { type: 'content_block_delta', index: 1, delta: { type: 'text_delta', text: 'look.' } },
      { type: 'content_block_stop', index: 1 },
      { type: 'content_block_start', index: 2, content_block: { type: 'tool_use', id: 'toolu_1', name: 'get_journal', input: {} } },
      { type: 'content_block_delta', index: 2, delta: { type: 'input_json_delta', partial_json: '{"lim' } },
      { type: 'content_block_delta', index: 2, delta: { type: 'input_json_delta', partial_json: 'it": 5}' } },
      { type: 'content_block_stop', index: 2 },
      { type: 'message_delta', delta: { stop_reason: 'tool_use' }, usage: { output_tokens: 7 } },
      { type: 'message_stop' },
    ].map(frame).join('');
    for (let i = 0; i < stream.length; i += 13) feed(stream.slice(i, i + 13)); // awkward chunk boundaries
    const m = b.message();
    expect(seen.join('')).toBe('Let me look.');
    expect(m.stop_reason).toBe('tool_use');
    expect(m.content).toEqual([
      { type: 'thinking', thinking: 'hm', signature: 'SIG' },
      { type: 'text', text: 'Let me look.' },
      { type: 'tool_use', id: 'toolu_1', name: 'get_journal', input: { limit: 5 } },
    ]);
    expect(m.usage).toEqual({ input_tokens: 10, output_tokens: 7 });
  });
  it('a tool call with no input becomes an empty object, and errors are surfaced', () => {
    const b = messageBuilder();
    b.apply({ type: 'content_block_start', index: 0, content_block: { type: 'tool_use', id: 't', name: 'get_current_plan', input: {} } });
    b.apply({ type: 'content_block_stop', index: 0 });
    b.apply({ type: 'error', error: { type: 'overloaded_error', message: 'Overloaded' } });
    expect(b.message().content[0].input).toEqual({});
    expect(b.message().error.type).toBe('overloaded_error');
    expect(JSON.stringify(b.message().content)).not.toContain('badInput');
  });
});

describe('markdown', () => {
  it('splits paragraphs, lists and headings', () => {
    expect(parseBlocks('Hi **there**.\nSecond line.\n\n- one\n- two\n\n1. a\n2. b\n\n## Next\n> quoted').map((b) => [b.type, b.items.length]))
      .toEqual([['p', 2], ['ul', 2], ['ol', 2], ['h', 1], ['quote', 1]]);
  });
  it('copes with nothing', () => expect(parseBlocks('')).toEqual([]));
});

describe('patterns', () => {
  it('buckets sits into Monday weeks and counts feels', () => {
    const now = new Date(2026, 10, 14, 12); // Sat 14 Nov 2026
    const at = (y, m, d, h) => new Date(y, m, d, h).toISOString();
    const p = summarise([
      { at: at(2026, 10, 9, 7), minutes: 20, feel: 'okay' },   // Mon this week
      { at: at(2026, 10, 14, 6), minutes: 20, feel: 'wired' }, // Sat this week
      { at: at(2026, 10, 8, 7), minutes: 12, feel: 'okay' },   // Sun last week
      { at: at(2026, 5, 1, 7), minutes: 20, feel: 'flat' },    // months ago: outside the window
    ], { W1: { at: at(2026, 10, 8, 9), settled: 4, connected: 6, back: true }, W2: { at: at(2026, 10, 14, 9), settled: 7 } }, now);
    expect(p.buckets).toHaveLength(8);
    expect(p.buckets[7].count).toBe(2);
    expect(p.buckets[7].minutes).toBe(40);
    expect(p.buckets[6].count).toBe(1);
    expect(p.recent).toBe(3);
    expect(p.feels).toEqual({ okay: 2, wired: 1, flat: 0, foggy: 0 });
    expect(p.usual).toBe('in the morning');
    expect(p.checkins.map((c) => [c.week, c.settled, c.connected])).toEqual([['1', 4, 6], ['2', 7, undefined]]);
  });
});
