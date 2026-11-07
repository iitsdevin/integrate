# Body, Mantra, Open

A daily sit in three phases — **Body** (a 3-minute somatic practice), **Mantra**, **Open** — with a toolkit of practices by lineage, a journal, and a reflection buddy.

- **Today** — the sit, the 108-bead mala, a feeling check-in.
- **Toolkit** — Regulation, Somatic, Zen, Kundalini, The Broad Place, Imaginal, Vajrayana, Earth & kin, and *Your library*: add PDFs or EPUBs you own and ask them questions.
- **Reflect** — journal, weekly check-ins, your plan, and the buddy (Claude, via your own Anthropic API key) that can read your sits, notes, toolkit and library and draft a plan.

Everything is stored in the browser on your device. Books and the API key never leave it except when you ask the buddy something. Settings → Your data exports and imports a JSON backup.

Installable PWA (Add to Home Screen), works offline once loaded. Four colour schemes, each with a light and dark version.

## Develop

```
npm install
npm run dev        # add ?data=worst, ?data=empty or ?data=one to stress-test the UI
npm run build
```

Pushing to `main` deploys to GitHub Pages via `.github/workflows/deploy.yml`.
