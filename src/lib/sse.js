// Reading a streamed Messages API reply (server-sent events) into the same shape a
// non-streamed reply has: { content: [...blocks], stop_reason, usage }.
// Kept apart from the network code so it can be tested.

// Feed chunks of text in; get parsed event objects out.
export function sseParser(onEvent) {
  let buf = '';
  return (chunk) => {
    buf += chunk;
    let i;
    while ((i = buf.search(/\r?\n\r?\n/)) !== -1) {
      const frame = buf.slice(0, i);
      buf = buf.slice(i).replace(/^\r?\n\r?\n/, '');
      const data = frame.split(/\r?\n/).filter((l) => l.startsWith('data:')).map((l) => l.slice(5).trimStart()).join('\n');
      if (!data) continue;
      try { onEvent(JSON.parse(data)); } catch { /* a keep-alive or partial frame */ }
    }
  };
}

// Builds the message from stream events. Every block is kept exactly as sent
// (thinking blocks and their signatures included) because the next request must
// hand them back unchanged.
export function messageBuilder({ onText } = {}) {
  const msg = { content: [], stop_reason: null, stop_details: null, usage: null, error: null };
  const json = {};
  const apply = (ev) => {
    switch (ev.type) {
      case 'message_start': msg.usage = ev.message?.usage || null; break;
      case 'content_block_start': msg.content[ev.index] = { ...ev.content_block }; if (ev.content_block.type === 'tool_use') json[ev.index] = ''; break;
      case 'content_block_delta': {
        const b = msg.content[ev.index], d = ev.delta;
        if (!b || !d) break;
        if (d.type === 'text_delta') { b.text = (b.text || '') + d.text; onText?.(d.text, ev.index); }
        else if (d.type === 'input_json_delta') json[ev.index] += d.partial_json;
        else if (d.type === 'thinking_delta') b.thinking = (b.thinking || '') + d.thinking;
        else if (d.type === 'signature_delta') b.signature = d.signature;
        break;
      }
      case 'content_block_stop': {
        const b = msg.content[ev.index];
        if (b?.type === 'tool_use') { try { b.input = json[ev.index] ? JSON.parse(json[ev.index]) : {}; } catch { b.input = {}; Object.defineProperty(b, 'badInput', { value: true, enumerable: false }); /* not enumerable: never sent back */ } }
        break;
      }
      case 'message_delta':
        if (ev.delta?.stop_reason) msg.stop_reason = ev.delta.stop_reason;
        if (ev.delta?.stop_details) msg.stop_details = ev.delta.stop_details;
        if (ev.usage) msg.usage = { ...(msg.usage || {}), ...ev.usage };
        break;
      case 'error': msg.error = ev.error || { message: 'stream error' }; break;
      default: break;
    }
  };
  return { apply, message: () => ({ ...msg, content: msg.content.filter(Boolean) }) };
}
