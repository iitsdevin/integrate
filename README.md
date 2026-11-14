# Integrate

A daily sit in three phases — **Connect** (a 3-minute somatic practice), **Dive** (the mantra), **Integrate** (open, whole-body awareness) — with a toolkit of practices by lineage, a journal, and a reflection buddy.

- **Today** — the sit, the 108-bead mala, a feeling check-in, a daily thread (a reading seed, a practice to try, or a note of your own from weeks back), and a gentler start after days away. Optional spoken cues read each phase aloud.
- **Toolkit** — Regulation, Somatic, Zen, Kundalini, The Broad Place, Imaginal, Vajrayana, Earth & kin, an *ACT for ADHD* course, a *Neurodivergence Skills* workbook (an interactive companion to Kemp and Mitchelson's *The Neurodivergence Skills Workbook for Autism and ADHD*, written in the app's own words with page references to the book), and *Your library*: add PDFs or EPUBs you own and ask them questions.
- **Reflect** — journal (searchable), weekly check-ins, a patterns view of your weeks (no streaks), your plan, and the buddy (Claude, via your own Anthropic API key) that can read your sits, notes, toolkit and library and draft a plan.

Everything is stored in the browser on your device. Books and the API key never leave it except when you ask the buddy something. Settings → Your data exports and imports a JSON backup.

Installable PWA (Add to Home Screen). The service worker caches every built file on install, so it works offline from the first visit. Four colour schemes, each with a light and dark version.

## Develop

```
npm install
npm run dev        # add ?data=worst, ?data=empty or ?data=one to stress-test the UI
npm test           # unit tests: sit timing, plan weeks, import/merge, undo, streamed replies
npm run build
```

Pushing to `main` runs the tests, then deploys to GitHub Pages via `.github/workflows/deploy.yml`.
