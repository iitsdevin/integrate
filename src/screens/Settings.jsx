import { useEffect, useRef, useState } from 'react';
import Sheet from '../components/Sheet.jsx';
import { toast } from '../components/bits.jsx';
import { useStore, updateSettings, getApiKey, setApiKey, DEFAULT_SETTINGS, lastSaveFailed, sitLengths, SIT_LIMITS } from '../lib/store.js';
import { SCHEMES, resolveDark } from '../lib/theme.js';
import { SOUNDS, unlockAudio, ring, preloadBells } from '../lib/bells.js';
import { voiceSupported, speak, hush } from '../lib/voice.js';
import { shareOrDownload, importText, daysSinceBackup } from '../lib/backup.js';
import { storageEstimate, askPersist } from '../lib/library.js';
import { usePacks, importPackText, removePack } from '../lib/packs.js';

const MODELS = [['claude-sonnet-5-5', 'Claude Sonnet 5.5 — quick, the default'], ['claude-opus-5-5', 'Claude Opus 5.5 — more thorough, costs more'], ['claude-haiku-5-5', 'Claude Haiku 5.5 — fastest, cheapest']];

export default function Settings({ open, onClose }) {
  const settings = useStore((s) => s.settings);
  const sitsCount = useStore((s) => s.sits.length);
  const lastBackup = useStore((s) => daysSinceBackup(s));
  const [key, setKey] = useState('');
  const [hasKey, setHasKey] = useState(!!getApiKey());
  const [paste, setPaste] = useState('');
  const [importOpen, setImportOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const [store, setStore] = useState({});
  const [about, setAbout] = useState(settings.aboutMe);
  const fileRef = useRef(null);
  const packRef = useRef(null);
  const packs = usePacks();
  const [packMsg, setPackMsg] = useState('');
  const [confirmRm, setConfirmRm] = useState(null);

  useEffect(() => { if (open) { setHasKey(!!getApiKey()); setAbout(settings.aboutMe); storageEstimate().then(setStore); setMsg(''); } }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const dark = resolveDark(settings.mode);
  const mins = sitLengths(settings);

  function doImport(text) {
    try {
      const r = importText(text);
      setMsg(`Imported ${r.sits} sit${r.sits === 1 ? '' : 's'} and ${r.entries} note${r.entries === 1 ? '' : 's'}. Nothing you already had was changed.`);
      setPaste(''); setImportOpen(false);
    } catch (e) { setMsg(e.message); }
  }

  return (
    <Sheet open={open} onClose={onClose} title="settings" kicker="Saved on this phone">
      <div className="stack" style={{ gap: 26 }}>
        <section className="stack" aria-labelledby="schemeH">
          <h3 id="schemeH" className="mono caps">Colour scheme</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
            {SCHEMES.map((sc) => {
              const c = dark ? sc.dark : sc.light, on = settings.scheme === sc.id;
              return (
                <button key={sc.id} type="button" aria-pressed={on} onClick={() => updateSettings({ scheme: sc.id })}
                  className="tile" style={{ minHeight: 96, background: c[0], color: c[1], borderColor: on ? 'var(--ink)' : 'color-mix(in srgb, var(--ink) 30%, transparent)', boxShadow: on ? '4px 4px 0 var(--ink)' : 'none' }}>
                  <span className="row" style={{ gap: 4 }}>{c.slice(2).map((x) => <i key={x} style={{ width: 16, height: 16, background: x, border: `1.5px solid ${c[1]}` }} />)}</span>
                  <span><b style={{ fontSize: '1.5rem' }}>{sc.name}</b><span className="mono-s">{on ? '● in use' : sc.note}</span></span>
                </button>
              );
            })}
          </div>
          <div className="seg" role="radiogroup" aria-label="Light or dark" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
            {[['light', 'Light'], ['dark', 'Dark'], ['auto', 'Follow phone']].map(([id, label]) => (
              <button key={id} type="button" role="radio" aria-checked={settings.mode === id} aria-selected={settings.mode === id} onClick={() => updateSettings({ mode: id })}>{label}</button>
            ))}
          </div>
        </section>

        <section className="stack" aria-labelledby="lenH">
          <h3 id="lenH" className="mono caps">Daily sit · {mins.connect + mins.dive + mins.integrate} minutes</h3>
          {[['connect', 'Connect'], ['dive', 'Dive'], ['integrate', 'Integrate']].map(([k, name]) => (
            <div key={k} className="stepper">
              <span>{name}</span>
              <button type="button" className="btn icon-btn" aria-label={`${name}: one minute less`} disabled={mins[k] <= SIT_LIMITS[k][0]} onClick={() => updateSettings({ sit: { ...mins, [k]: mins[k] - 1 } })}>−</button>
              <output className="mono" aria-live="polite">{mins[k]} min</output>
              <button type="button" className="btn icon-btn" aria-label={`${name}: one minute more`} disabled={mins[k] >= SIT_LIMITS[k][1]} onClick={() => updateSettings({ sit: { ...mins, [k]: mins[k] + 1 } })}>+</button>
            </div>
          ))}
          <p className="mono soft">A plan drafted with your buddy can set these too.</p>
        </section>

        <section className="stack" aria-labelledby="bellH">
          <h3 id="bellH" className="mono caps">Bell</h3>
          <div className="chips">
            {[...Object.entries(SOUNDS).map(([id, s]) => [id, s.name]), ['silent', 'Silent']].map(([id, name]) => (
              <button key={id} type="button" className="chip" style={{ fontSize: '0.8125rem' }} aria-pressed={settings.bell === id}
                onClick={() => { updateSettings({ bell: id }); unlockAudio(); preloadBells(id); ring(id, 1); }}>{name}</button>
            ))}
          </div>
          <p className="mono soft">{settings.bell === 'silent' ? "No sound. The screen glows at each change, so you'd need to glance at it. Android phones also vibrate; iPhones don't allow that." : 'Tap one to hear it. One bell between phases, two for the last stretch, three at the end.'}</p>
        </section>

        {voiceSupported() && (
          <section className="stack" aria-labelledby="voiceH">
            <h3 id="voiceH" className="mono caps">Spoken cues</h3>
            <label className="check">
              <input type="checkbox" checked={!!settings.voice} onChange={(e) => {
                updateSettings({ voice: e.target.checked });
                if (e.target.checked) speak('Connect. Feel your feet and spread your toes.'); else hush();
              }} />
              <span>Read each phase aloud after its bell, so you can keep your eyes closed. Uses this phone’s own voice; nothing is sent anywhere.</span>
            </label>
          </section>
        )}

        <section className="stack" aria-labelledby="aboutH">
          <h3 id="aboutH" className="mono caps">About you, for the buddy</h3>
          <p className="soft" style={{ fontSize: '0.875rem' }}>Anything you want your reflection buddy to keep in mind. It stays on this phone and is sent to Claude only with your buddy conversations.</p>
          <label className="sr" htmlFor="aboutIn">About you</label>
          <textarea id="aboutIn" className="field" value={about} onChange={(e) => setAbout(e.target.value)} onBlur={() => updateSettings({ aboutMe: about })} placeholder="e.g. what your practice is for, what tends to get in the way, teachers you trust" />
        </section>

        <section className="stack" aria-labelledby="keyH">
          <h3 id="keyH" className="mono caps">Anthropic API key</h3>
          {hasKey ? (
            <div className="between"><p>Saved on this phone. Never exported.</p><button type="button" className="btn btn-mono" onClick={() => { setApiKey(''); setHasKey(false); toast('Key removed'); }}>Remove</button></div>
          ) : (
            <>
              <label className="sr" htmlFor="keyIn2">API key</label>
              <input id="keyIn2" className="field" type="password" autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false} placeholder="sk-ant-…" value={key} onChange={(e) => setKey(e.target.value)} />
              <button type="button" className="btn btn-ink" disabled={!key.trim().startsWith('sk-')} onClick={() => { setApiKey(key.trim()); setKey(''); setHasKey(true); toast('Key saved'); }}>Save key</button>
            </>
          )}
          <label className="mono caps mute" htmlFor="modelIn" style={{ marginTop: 6 }}>Model</label>
          <select id="modelIn" className="field" value={settings.model} onChange={(e) => updateSettings({ model: e.target.value || DEFAULT_SETTINGS.model })}>
            {MODELS.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
            {!MODELS.some(([id]) => id === settings.model) && <option value={settings.model}>{settings.model}</option>}
          </select>
        </section>

        <section className="stack" aria-labelledby="backupH">
          <h3 id="backupH" className="mono caps">Your data</h3>
          <p className="soft" style={{ fontSize: '0.875rem' }}>{sitsCount.toLocaleString('en-AU')} {sitsCount === 1 ? 'sit' : 'sits'}. Everything lives in this browser on this phone, so back it up now and then. Backups leave out your API key and your books.</p>
          <button type="button" className="btn btn-ink" onClick={async () => { const r = await shareOrDownload(); if (r !== 'cancelled') toast(r === 'shared' ? 'Backed up' : 'Backup downloaded'); }}>Export a backup</button>
          <p className="mono-s mute">{lastBackup === null ? 'No backup yet.' : lastBackup === 0 ? 'Last backup: today.' : `Last backup: ${lastBackup} day${lastBackup === 1 ? '' : 's'} ago.`} On iPhone, choose Save to Files in the share sheet. A reminder shows on Today every three weeks.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button type="button" className="btn" onClick={() => fileRef.current?.click()}>Import a file</button>
            <button type="button" className="btn" onClick={() => setImportOpen((x) => !x)} aria-expanded={importOpen}>Paste text</button>
          </div>
          <input ref={fileRef} type="file" accept="application/json,.json,text/plain" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (f) doImport(await f.text()); e.target.value = ''; }} />
          {importOpen && (
            <>
              <label className="sr" htmlFor="pasteIn">Paste your data</label>
              <textarea id="pasteIn" className="field" value={paste} onChange={(e) => setPaste(e.target.value)} placeholder="Paste what “Copy my data” gave you on the old page" />
              <button type="button" className="btn btn-ink" disabled={!paste.trim()} onClick={() => doImport(paste)}>Import</button>
            </>
          )}
          {msg && <p className="notice" role="status">{msg}</p>}
          {lastSaveFailed() && <p className="notice" role="alert">This browser isn't letting the app save. Private browsing does this. Export a backup before you close it.</p>}
          {store.persisted === false && (
            <button type="button" className="link-btn" onClick={async () => { const ok = await askPersist(); setStore({ ...store, persisted: ok }); toast(ok ? 'Storage protected' : 'The browser said no'); }}>Ask the browser to keep my data</button>
          )}
        </section>

        <section className="stack" aria-labelledby="packH">
          <h3 id="packH" className="mono caps">Private packs</h3>
          <p className="soft" style={{ fontSize: '0.875rem' }}>Workbooks made for you from material you own. A pack lives only on this phone. It isn't part of the app or the website, and it's left out of backups, so keep the pack file in Files. Your answers are backed up as usual.</p>
          {packs.map((b) => (
            <div key={b.id} className="between" style={{ gap: 10, padding: '8px 0', borderBottom: '1px solid color-mix(in srgb, var(--ink) 22%, transparent)' }}>
              <span style={{ minWidth: 0 }}><b style={{ overflowWrap: 'anywhere' }}>{b.title}</b><span className="mono-s mute" style={{ display: 'block' }}>{b.modules.length} module{b.modules.length > 1 ? 's' : ''} · {b.lessons.length} lessons</span></span>
              <button type="button" className="btn btn-mono btn-tight" onClick={async () => {
                if (confirmRm !== b.id) { setConfirmRm(b.id); return; }
                await removePack(b.id); setConfirmRm(null); toast('Pack removed. Your answers are kept.');
              }}>{confirmRm === b.id ? 'Tap to confirm' : 'Remove'}</button>
            </div>
          ))}
          <button type="button" className="btn" onClick={() => packRef.current?.click()}>Import a pack</button>
          <input ref={packRef} type="file" accept="application/json,.json" hidden onChange={async (e) => {
            const f = e.target.files?.[0]; e.target.value = '';
            if (!f) return;
            try { const r = await importPackText(await f.text()); setPackMsg(`${r.replaced ? 'Updated' : 'Added'} ${r.title}: ${r.modules} module${r.modules > 1 ? 's' : ''}, ${r.lessons} lessons. It's in Toolkit.`); }
            catch (err) { setPackMsg(err.message || "Couldn't read that pack."); }
          }} />
          {packMsg && <p className="notice" role="status">{packMsg}</p>}
        </section>

        <p className="mono-s mute">Integrate · works offline once loaded · add it to your home screen from the share menu</p>
      </div>
    </Sheet>
  );
}
