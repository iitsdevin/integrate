// The reflection buddy: Claude, called straight from this device with your own API key.
// It can look things up through tools: your sits, journal, plan, toolkit and library.
import { getState, getApiKey, localDate, dayDiff } from './store.js';
import { allPractices, allReadings } from '../data/content.js';
import { DEFAULT_PLAN } from '../data/daily.js';
import { searchLibrary, listBooks } from './library.js';
import { COURSE, MODULES, VALUES, DOMAINS } from '../data/course.js';
import { WORKBOOK, MODULES as WB_MODULES, lessonById as wbLesson } from '../data/workbook.js';
import { answersText } from '../components/WorkbookTools.jsx';

const API = 'https://api.anthropic.com/v1/messages';

export class BuddyError extends Error {}

async function call(body) {
  const key = getApiKey();
  if (!key) throw new BuddyError('Add your Anthropic API key in Settings first.');
  let res;
  try {
    res = await fetch(API, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({ model: getState().settings.model || 'claude-sonnet-5-5', ...body }),
    });
  } catch {
    throw new BuddyError("Couldn't reach Claude. Check your connection and try again.");
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err?.error?.message || '';
    if (res.status === 401) throw new BuddyError("That API key didn't work. Check it in Settings.");
    if (res.status === 404 || /model/i.test(msg)) throw new BuddyError(`The model "${getState().settings.model}" wasn't found. Change it in Settings.`);
    if (res.status === 429) throw new BuddyError('Too many requests just now. Wait a moment and try again.');
    if (res.status === 529 || res.status >= 500) throw new BuddyError('Claude is busy right now. Try again in a minute.');
    throw new BuddyError(msg || 'Something went wrong (' + res.status + ').');
  }
  return res.json();
}

// ---------- context ----------
function planNow(s) { return s.plan || DEFAULT_PLAN; }

function systemPrompt() {
  const s = getState();
  const today = localDate();
  const plan = planNow(s);
  const recent = s.sits.filter((x) => dayDiff(localDate(new Date(x.at)), today) <= 14).length;
  return [
    'You are a reflection buddy inside "Integrate", a personal meditation app. You are a practice companion — like a friend who has also sat on the cushion — not a therapist and not a coach selling a programme.',
    'Tone: warm, direct, plain, occasionally poetic, never performative or wellness-speak. Keep replies short to moderate. Ask at most one question. Trust silence.',
    'The daily sit is three phases: Connect (a 3-minute somatic practice), Dive (14 minutes with their personal Vedic mantra from The Broad Place), Integrate (3 minutes of open, whole-body awareness). The Toolkit holds Regulation, Somatic, Zen, Kundalini (Desirée Pais), The Broad Place (Jacqui), Imaginal (Rob Burbea), Vajrayana and Earth & kin.',
    'They tend to accumulate practices and courses rather than consolidate. Gently notice this when it shows up, with warmth not judgement. Prefer fewer, smaller, repeatable things. "Coming back counts" — never shame missed days, and never mention streaks.',
    'Use the tools to look things up rather than guessing. When you quote or draw on a book from their library, cite it like (Title, p. 12) using the reference the tool gives. If the library does not cover something, say so; you may then offer what you know generally, clearly marked as general knowledge.',
    'When they ask for a plan, look at their practice history, recent journal and check-ins first, then call propose_plan with something small and specific. Plans should build on the daily sit, not replace it, and should respect any rule like "start nothing new until a date".',
    'If something sounds like a mental health crisis, panic that is not settling, dissociation, or anything unsafe, step out of companion mode: say so kindly and suggest they contact their psychiatrist, therapist or, in Australia, Lifeline on 13 11 14.',
    '',
    `Today is ${new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}. They are in Perth, Western Australia.`,
    `Current plan: ${plan.title} (${plan.from} to ${plan.to}). ${plan.summary}`,
    `Sits in the last 14 days: ${recent}. Total sits recorded: ${s.sits.length}.`,
    `They are doing a course in the Toolkit, "ACT for ADHD": ${MODULES.map((m) => m.no + ' ' + m.name + ' (' + m.lessons.filter((l) => s.course?.done?.[l.id]).length + '/' + m.lessons.length + ' done)').join('; ')}. Their worksheet and reflection answers are journal entries starting "ACT for ADHD". Link what they bring to a lesson or exercise when it genuinely helps (e.g. Leaves on a stream, Dropping anchor, Urge surfing, the Unhooking lab, the step-down), using the course's language: away and towards moves, hooks, unhooking, making room, values, the tiny first step. Never treat ADHD struggles as a willpower problem.`,
    (() => { const v = VALUES.filter((w) => s.course?.values?.[w] === 'very'); const b = DOMAINS.map(([d, n]) => s.course?.bullseye?.[d] ? `${n}: ${s.course.bullseye[d].text || '(no words yet)'} — ${s.course.bullseye[d].score ?? '?'}/10 close` : null).filter(Boolean); return (v.length ? `Their values card sort, matters most: ${v.join(', ')}.` : '') + (b.length ? ` Their bull's-eye: ${b.join('; ')}.` : ''); })(),
    `They are also working through "${WORKBOOK.title}", an interactive companion to ${WORKBOOK.book} by ${WORKBOOK.authors}: ${WB_MODULES.map((m) => m.no + ' ' + m.name + ' (' + m.lessons.filter((l) => s.wb?.done?.[l.id]).length + '/' + m.lessons.length + ')').join('; ')}. Use get_workbook_answers to read what they wrote (their safety plan, burnout signs, values, boundaries, action plan and so on) when it would help. Its language: spiky profile, spins, burnout, masking and unmasking, PRIMA (pause, regulate, identify, meaning, allow), soothing rhythm breathing, Compassionate Other, strawberry people, NICE tasks, gentle returns. If they are close to a meltdown, their safety and soothing plan comes first.`,
    s.settings.aboutMe ? `\nWhat they've told the app about themselves:\n${s.settings.aboutMe}` : '',
  ].join('\n');
}

export const TOOLS = [
  { name: 'get_practice_history', description: 'Their recorded sits: date, time, which sit, minutes, how they felt beforehand, whether they finished, and any note they wrote after.',
    input_schema: { type: 'object', properties: { days: { type: 'integer', description: 'How many days back to look. Default 28.' } } } },
  { name: 'get_journal', description: 'Their journal entries and weekly check-ins, newest first.',
    input_schema: { type: 'object', properties: { limit: { type: 'integer', description: 'How many entries. Default 15.' } } } },
  { name: 'get_current_plan', description: 'The plan they are following now, with its items.', input_schema: { type: 'object', properties: {} } },
  { name: 'search_toolkit', description: 'Search the practices and readings in their Toolkit by keyword. Returns names, categories and short descriptions.',
    input_schema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] } },
  { name: 'list_library_books', description: 'The books they have added to their library (full text is searchable).', input_schema: { type: 'object', properties: {} } },
  { name: 'search_library', description: 'Search the full text of the books in their library. Returns the most relevant passages with title and page or section reference. Use specific words likely to appear in the book.',
    input_schema: { type: 'object', properties: { query: { type: 'string' }, book_id: { type: 'string', description: 'Optional: limit to one book.' } }, required: ['query'] } },
  { name: 'get_workbook_answers', description: 'What they have written in the Neurodivergence Skills workbook. With no lesson_id, lists the lessons that have answers. With a lesson_id, returns that lesson\'s answers as text.',
    input_schema: { type: 'object', properties: { lesson_id: { type: 'string', description: 'e.g. wb-safety, wb-burnout, wb-qualities, wb-action' } } } },
  { name: 'propose_plan', description: 'Show them a draft practice plan as a card with "Use this plan" and "Change it" buttons. Use after looking at their history.',
    input_schema: { type: 'object', properties: {
      title: { type: 'string', description: 'Short, e.g. "Weeks 2–3".' },
      weeks: { type: 'integer' },
      summary: { type: 'string', description: 'One sentence.' },
      items: { type: 'array', items: { type: 'object', properties: { label: { type: 'string' }, text: { type: 'string' } }, required: ['label', 'text'] } },
    }, required: ['title', 'weeks', 'summary', 'items'] } },
];

async function runTool(name, input) {
  const s = getState();
  const today = localDate();
  switch (name) {
    case 'get_practice_history': {
      const days = input.days || 28;
      const sits = s.sits.filter((x) => dayDiff(localDate(new Date(x.at)), today) <= days);
      const notes = Object.fromEntries(s.journal.filter((j) => j.sitId).map((j) => [j.sitId, j.text]));
      return { count: sits.length, sits: sits.map((x) => ({ when: new Date(x.at).toLocaleString('en-AU', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }), sit: x.label, minutes: x.minutes, felt: x.feel || null, body: x.bodyName || null, finished: !!x.done, rough: !!x.rough, note: notes[x.id] || null })) };
    }
    case 'get_journal': {
      const entries = [...s.journal].sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, input.limit || 15);
      const checkins = Object.entries(s.checkins).map(([week, c]) => ({ week, cameBack: !!c.back, settled: c.settled ?? null, connected: c.connected ?? null }));
      return { entries: entries.map((e) => ({ when: new Date(e.at).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' }), kind: e.kind, text: e.text })), checkins };
    }
    case 'get_current_plan': return planNow(s);
    case 'search_toolkit': {
      const q = String(input.query || '').toLowerCase().split(/\s+/).filter(Boolean);
      const hit = (t) => q.some((w) => t.toLowerCase().includes(w));
      const practices = allPractices().filter((x) => hit([x.name, x.summary, x.intro, x.who, x.category].join(' '))).slice(0, 10)
        .map((x) => ({ name: x.name, category: x.category, who: x.who, length: x.mins, summary: x.summary }));
      const readings = allReadings().filter((x) => hit([x.title, x.author, x.seed, x.category].join(' '))).slice(0, 8)
        .map((x) => ({ title: x.title, author: x.author, category: x.category, idea: x.seed, practice: x.practice }));
      const lessons = COURSE.lessons.filter((l) => hit([l.title, l.short, ...(l.body || []), ...(l.steps || []), l.week || ''].join(' '))).slice(0, 8).map((l) => ({ lesson: `${l.moduleName} › ${l.title}`, kind: l.kind, about: l.short, steps: l.steps, thisWeek: l.week }));
      const wbl = WORKBOOK.lessons.filter((l) => hit([l.title, l.short, ...(l.body || []), ...(l.steps || [])].join(' '))).slice(0, 8).map((l) => ({ id: l.id, lesson: `${l.moduleName} › ${l.title}`, kind: l.kind, about: l.short, book_pages: l.pg, steps: l.steps }));
      return { practices, readings, actForAdhdLessons: lessons, workbookLessons: wbl };
    }
    case 'list_library_books': {
      const books = await listBooks();
      return books.length ? books.map((b) => ({ id: b.id, title: b.title, author: b.author, passages: b.passages })) : { note: 'No books added yet. They can add PDFs or EPUBs in Toolkit › Your library.' };
    }
    case 'search_library': {
      const hits = await searchLibrary(input.query || '', { bookId: input.book_id, limit: 6 });
      return hits.length ? hits.map((h) => ({ book: h.title, author: h.author, ref: h.ref, passage: h.text })) : { note: 'Nothing in the library matched. Try different words, or say the library does not cover it.' };
    }
    case 'get_workbook_answers': {
      const ans = s.wb?.ans || {};
      if (!input.lesson_id) return { lessons: WORKBOOK.lessons.filter((l) => ans[l.id] && answersText(l, ans[l.id]).trim()).map((l) => ({ id: l.id, module: `${l.moduleNo} ${l.moduleName}`, title: l.title, done: !!s.wb?.done?.[l.id] })) };
      const l = wbLesson(input.lesson_id);
      if (!l) return { error: 'No lesson with that id. Call without lesson_id to list them.' };
      return { lesson: `${l.moduleName} › ${l.title}`, book_pages: l.pg, answers: answersText(l, ans[l.id] || {}) || '(nothing written yet)' };
    }
    case 'propose_plan': return { shown: true, note: 'The plan is on screen as a card. Wait for them to use it or ask for changes.' };
    default: return { error: 'Unknown tool' };
  }
}

const TOOL_LABELS = {
  get_practice_history: () => 'looked at your sits',
  get_journal: () => 'read your journal',
  get_current_plan: () => 'checked your plan',
  search_toolkit: (i) => `searched the toolkit for “${i.query}”`,
  list_library_books: () => 'checked your library',
  get_workbook_answers: (i) => (i.lesson_id ? 'read your workbook answers' : 'looked at your workbook'),
  search_library: (i) => `searched your books for “${i.query}”`,
};

// Runs one turn. `api` is the running API transcript. Calls onEvent for each thing to show.
export async function buddyTurn(api, onEvent) {
  let messages = api;
  for (let round = 0; round < 7; round++) {
    const res = await call({ max_tokens: 1400, system: systemPrompt(), tools: TOOLS, messages });
    messages = [...messages, { role: 'assistant', content: res.content }];
    for (const block of res.content) {
      if (block.type === 'text' && block.text.trim()) onEvent({ role: 'assistant', text: block.text.trim() });
      if (block.type === 'tool_use') {
        if (block.name === 'propose_plan') onEvent({ role: 'plan', plan: { ...block.input, id: block.id } });
        else onEvent({ role: 'tool', text: (TOOL_LABELS[block.name] || (() => block.name))(block.input || {}) });
      }
    }
    if (res.stop_reason !== 'tool_use') return messages;
    const results = [];
    for (const block of res.content) if (block.type === 'tool_use') {
      let out;
      try { out = await runTool(block.name, block.input || {}); } catch (e) { out = { error: String(e.message || e) }; }
      results.push({ type: 'tool_result', tool_use_id: block.id, content: JSON.stringify(out) });
    }
    messages = [...messages, { role: 'user', content: results }];
  }
  return messages;
}

// One-shot question to the library: retrieve passages here, ask Claude to answer only from them.
export async function askLibrary(question, bookId) {
  const passages = await searchLibrary(question, { bookId, limit: 8 });
  if (!passages.length) return { answer: null, passages };
  const context = passages.map((p, i) => `[${i + 1}] ${p.title}${p.author ? ' — ' + p.author : ''}, ${p.ref}\n${p.text}`).join('\n\n');
  const res = await call({
    max_tokens: 900,
    system: 'You answer questions about books using only the numbered passages provided. Quote briefly where it helps. Cite every claim like (Title, p. 12) using the reference shown. If the passages do not answer the question, say plainly that these books do not seem to cover it. Plain language, no preamble, short paragraphs.',
    messages: [{ role: 'user', content: `Passages:\n\n${context}\n\nQuestion: ${question}` }],
  });
  return { answer: res.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim(), passages };
}
