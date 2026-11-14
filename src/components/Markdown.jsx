// A small, safe renderer for the handful of Markdown the buddy writes: paragraphs,
// bullet and numbered lists, headings, **bold**, *italic* and `code`. It builds React
// elements only (no HTML strings), so nothing the model sends can inject markup.
const INLINE = /(\*\*[^*\n]+\*\*|__[^_\n]+__|\*[^*\s][^*\n]*\*|`[^`\n]+`)/g;

function inline(text, key) {
  return text.split(INLINE).map((part, i) => {
    const k = key + '-' + i;
    if (/^\*\*.+\*\*$/.test(part) || /^__.+__$/.test(part)) return <strong key={k}>{part.slice(2, -2)}</strong>;
    if (/^\*.+\*$/.test(part)) return <em key={k}>{part.slice(1, -1)}</em>;
    if (/^`.+`$/.test(part)) return <code key={k}>{part.slice(1, -1)}</code>;
    return part;
  });
}

// Text -> blocks: { type: 'p' | 'h' | 'ul' | 'ol' | 'quote', lines | items }
export function parseBlocks(src) {
  const blocks = [];
  let cur = null;
  const push = (type, line) => {
    if (cur && cur.type === type) cur.items.push(line);
    else { cur = { type, items: [line] }; blocks.push(cur); }
  };
  for (const raw of String(src || '').replace(/\r/g, '').split('\n')) {
    const line = raw.trimEnd();
    let m;
    if (!line.trim()) { cur = null; continue; }
    if ((m = /^\s*#{1,6}\s+(.*)$/.exec(line))) { blocks.push({ type: 'h', items: [m[1]] }); cur = null; }
    else if ((m = /^\s*[-*•]\s+(.*)$/.exec(line))) push('ul', m[1]);
    else if ((m = /^\s*\d+[.)]\s+(.*)$/.exec(line))) push('ol', m[1]);
    else if ((m = /^\s*>\s?(.*)$/.exec(line))) push('quote', m[1]);
    else if (/^\s*([-*_])\1{2,}\s*$/.test(line)) cur = null; // a rule: just a break
    else if (cur && (cur.type === 'ul' || cur.type === 'ol') && /^\s{2,}\S/.test(raw)) cur.items[cur.items.length - 1] += ' ' + line.trim();
    else push('p', line);
  }
  return blocks;
}

export default function Markdown({ text, className = '' }) {
  return (
    <div className={'md ' + className}>
      {parseBlocks(text).map((b, i) => {
        if (b.type === 'h') return <p key={i} className="md-h">{inline(b.items[0], i)}</p>;
        if (b.type === 'ul') return <ul key={i}>{b.items.map((x, j) => <li key={j}>{inline(x, i + '-' + j)}</li>)}</ul>;
        if (b.type === 'ol') return <ol key={i}>{b.items.map((x, j) => <li key={j}>{inline(x, i + '-' + j)}</li>)}</ol>;
        if (b.type === 'quote') return <blockquote key={i}>{b.items.map((x, j) => <span key={j}>{inline(x, i + '-' + j)}{j < b.items.length - 1 ? <br /> : null}</span>)}</blockquote>;
        return <p key={i}>{b.items.map((x, j) => <span key={j}>{inline(x, i + '-' + j)}{j < b.items.length - 1 ? <br /> : null}</span>)}</p>;
      })}
    </div>
  );
}
