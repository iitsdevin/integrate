import { useEffect, useRef, useState } from 'react';
import { listBooks, addBookFromFile, deleteBook, renameBook, onLibraryChange, searchLibrary, askPersist } from '../lib/library.js';
import { askLibrary, BuddyError } from '../lib/buddy.js';
import { getApiKey } from '../lib/store.js';
import { usePacks } from '../lib/packs.js';
import Markdown from '../components/Markdown.jsx';
import { Icon, toast } from '../components/bits.jsx';
import Sheet from '../components/Sheet.jsx';

export default function Library({ onBack, focusBook, onSettings }) {
  const [books, setBooks] = useState(null);
  const [busy, setBusy] = useState(null); // { name, progress }
  const [err, setErr] = useState('');
  const [bookId, setBookId] = useState(focusBook || '');
  const [q, setQ] = useState('');
  const [asking, setAsking] = useState(false);
  const [result, setResult] = useState(null);
  const [edit, setEdit] = useState(null);
  const [confirmDel, setConfirmDel] = useState(false);
  const fileRef = useRef(null), qRef = useRef(null);
  const no = 11 + usePacks().length; // matches its tile in the Toolkit

  useEffect(() => { const load = () => listBooks().then(setBooks).catch(() => setBooks([])); load(); return onLibraryChange(load); }, []);
  useEffect(() => { if (focusBook) { setBookId(focusBook); setTimeout(() => qRef.current?.focus(), 300); } }, [focusBook]);
  useEffect(() => { window.scrollTo(0, 0); }, []);

  async function onFiles(files) {
    setErr('');
    for (const f of files) {
      setBusy({ name: f.name, progress: 0 });
      try {
        const b = await addBookFromFile(f, (p) => setBusy({ name: f.name, progress: p }));
        toast(`Added ${b.title}`);
        askPersist();
      } catch (e) { setErr(`${f.name}: ${e.message || 'could not be read.'}`); }
    }
    setBusy(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  async function ask(e) {
    e?.preventDefault();
    const question = q.trim();
    if (!question || asking) return;
    setAsking(true); setResult(null);
    try {
      if (!getApiKey()) {
        const passages = await searchLibrary(question, { bookId: bookId || undefined, limit: 6 });
        setResult({ question, answer: null, passages, noKey: true });
      } else {
        const r = await askLibrary(question, bookId || undefined);
        setResult({ question, ...r });
      }
    } catch (e2) {
      setResult({ question, error: e2 instanceof BuddyError ? e2.message : 'Something went wrong. Try again.' });
    } finally { setAsking(false); }
  }

  const current = books?.find((b) => b.id === bookId);

  return (
    <main className="screen">
      <button type="button" className="link-btn" style={{ alignSelf: 'flex-start' }} onClick={onBack}><Icon.back /> Toolkit</button>
      <header>
        <p className="mono caps">{no} — kept on this phone, never uploaded</p>
        <h1 className="word" style={{ fontSize: 'clamp(4.4rem, 23vw, 6rem)', marginTop: 6 }}>library</h1>
      </header>

      <form className="card card-ink stack" onSubmit={ask} aria-labelledby="askH">
        <h2 id="askH" className="word" style={{ fontSize: '1.9rem' }}>Ask your books</h2>
        <label className="sr" htmlFor="askBook">Which book</label>
        <select id="askBook" className="field" value={bookId} onChange={(e) => setBookId(e.target.value)} style={{ background: 'var(--ground)', color: 'var(--ink)' }} disabled={!books?.length}>
          <option value="">All books</option>
          {books?.map((b) => <option key={b.id} value={b.id}>{b.title}</option>)}
        </select>
        <label className="sr" htmlFor="askQ">Your question</label>
        <textarea id="askQ" ref={qRef} className="field" style={{ minHeight: 80, background: 'var(--ground)', color: 'var(--ink)' }} value={q}
          onChange={(e) => setQ(e.target.value)} placeholder={books?.length ? 'e.g. What does she mean by labelling thoughts?' : 'Add a book first'} disabled={!books?.length} enterKeyHint="send"
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(); } }} />
        <button type="submit" className="btn btn-lime btn-block" disabled={!q.trim() || asking || !books?.length}>{asking ? 'Reading…' : 'Ask'}</button>
      </form>

      {result && (
        <section className="stack" aria-live="polite">
          <p className="mono caps mute">Q · {result.question}</p>
          {result.error && <p className="notice">{result.error}</p>}
          {result.noKey && (
            <p className="notice">Here are the closest passages. To get an answer written from them, add your Anthropic API key in <button type="button" style={{ textDecoration: 'underline' }} onClick={onSettings}>Settings</button>.</p>
          )}
          {result.answer && <Markdown className="prose" text={result.answer} />}
          {result.answer === null && !result.noKey && !result.error && <p className="notice">Nothing in {current ? current.title : 'your books'} matched. Try other words, or a different book.</p>}
          {result.passages?.length > 0 && (
            <details className="card">
              <summary className="mono caps" style={{ minHeight: 44, display: 'flex', alignItems: 'center', cursor: 'pointer' }}>{result.noKey ? 'Passages' : 'Passages used'} · {result.passages.length}</summary>
              <div className="stack" style={{ marginTop: 8 }}>
                {result.passages.map((p, i) => (
                  <div key={i} className="entry">
                    <p className="mono-s caps">[{i + 1}] {p.title} · {p.ref}</p>
                    <p>{p.text}</p>
                  </div>
                ))}
              </div>
            </details>
          )}
        </section>
      )}

      <section aria-labelledby="booksH">
        <div className="group-title">
          <h2 id="booksH">Your books</h2>
          <button type="button" className="btn btn-mono" onClick={() => fileRef.current?.click()} disabled={!!busy}><Icon.plus /> Add</button>
        </div>
        <input ref={fileRef} type="file" accept=".pdf,.epub,.txt,.md,application/pdf,application/epub+zip,text/plain" multiple hidden onChange={(e) => onFiles([...e.target.files])} />
        {busy && <p className="notice" role="status" style={{ marginTop: 10 }}>Reading {busy.name}… {busy.progress ? Math.round(busy.progress * 100) + '%' : ''}</p>}
        {err && <p className="notice" role="alert" style={{ marginTop: 10 }}>{err}</p>}
        {books && !books.length && !busy && (
          <p className="group-note">PDFs, EPUBs or text files you own — from your Drive folder through the Files app works. Scanned PDFs that are only page images can’t be read.</p>
        )}
        <div className="list">
          {books?.map((b) => (
            <button key={b.id} type="button" className="item" onClick={() => setEdit({ ...b })}>
              <span className="n">▤</span>
              <span className="t">{b.title}</span>
              <span className="m">{b.pages ? `${b.pages} ${b.unit === 'page' ? 'pp' : 'secs'}` : ''}</span>
              <span className="d">{b.author || 'Unknown author'} · {Math.round(b.words / 1000)}k words</span>
            </button>
          ))}
        </div>
      </section>

      <Sheet open={!!edit} onClose={() => { setEdit(null); setConfirmDel(false); }} title="book" kicker="Edit details">
        {edit && (
          <div className="stack">
            <label className="mono caps" htmlFor="bt">Title</label>
            <input id="bt" className="field" value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} />
            <label className="mono caps" htmlFor="ba">Author</label>
            <input id="ba" className="field" value={edit.author} onChange={(e) => setEdit({ ...edit, author: e.target.value })} />
            <p className="mono soft">From {edit.file}. {edit.passages} passages.</p>
            <button type="button" className="btn btn-ink btn-block" onClick={async () => { await renameBook(edit.id, { title: edit.title.trim() || edit.file, author: edit.author.trim() }); setEdit(null); }}>Save</button>
            <button type="button" className="btn btn-block" onClick={() => { setBookId(edit.id); setEdit(null); setTimeout(() => qRef.current?.focus(), 450); }}>Ask this book</button>
            <button type="button" className="btn btn-block" onClick={async () => { if (!confirmDel) { setConfirmDel(true); return; } await deleteBook(edit.id); if (bookId === edit.id) setBookId(''); setEdit(null); setConfirmDel(false); }}>
              {confirmDel ? 'Tap again to remove it from this phone' : 'Remove book'}
            </button>
          </div>
        )}
      </Sheet>
    </main>
  );
}
