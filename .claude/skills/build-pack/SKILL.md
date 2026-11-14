---
name: build-pack
description: Turn a book, PDF, EPUB, article, course notes or the owner's own writing into a private pack for the Integrate app — an interactive workbook of lessons, exercises and guided practices imported in Settings. Use when asked to "make a pack", "build tools from this book", "turn this into a workbook", or when a book or document is supplied for the app.
---

# Build a private pack

A private pack is one `.json` file the owner imports on their phone (**Settings → Private packs → Import a pack**).
It shows in the Toolkit beside the built-in workbook, and the reflection buddy can read the answers.
The format is in `docs/packs.md`. Read it before writing anything.

## Rules that do not bend

- **The source and the pack never enter git.** `books/`, `packs/` and `*.integrate-pack.json` are ignored. Work only
  inside `packs/<pack-id>/`. Never `git add -f` them, never paste long passages into a commit, PR or chat.
- **Write in the app's own words.** A pack is a companion to the source, not a copy. Explain each idea afresh, keep any
  direct quotation to a sentence or two, attribute it, and give page (or section) references in `pg` so the owner can
  go back to the book. Name the source fully in `source`.
- **Only material the owner has the right to use**: something they bought, were given, or wrote. If that is unclear, ask.
- **Stay inside the source.** Do not invent exercises and present them as the author's. If you add a bridging
  exercise of your own, say so in a `note` item.
- **Care over cleverness.** For therapy, trauma, medication, diet or crisis material: keep the author's cautions, add a
  `help` block (who to contact; Lifeline 13 11 14 in Australia), and mark the lessons it applies to with `"help": true`.
  Never present a pack as treatment.

## Steps

1. **Find out what is wanted.** Which file, and what the owner hopes to get from it: the whole book or some chapters,
   mostly exercises or mostly ideas, how much time per lesson. One short round of questions; then proceed.
2. **Get the text.** Put the file under `books/` and run:
   ```bash
   node scripts/book-text.mjs books/<file> packs/<pack-id>/book.txt
   ```
   It writes plain text with `===== p. 12 =====` (PDF) or `===== section 3: Title =====` (EPUB) markers. If it warns
   that most pages are empty, the PDF is a scan: say so and stop, it needs OCR first. For a web article or pasted
   notes, save them as a `.md` file and run the same command. Read the whole text before outlining; for a long book
   read it in parts rather than skimming.
3. **Propose an outline and wait for a yes.** Modules follow the book's own structure (usually chapters). For each
   module list the lessons with their kind — `learn` (ideas), `exercise` (interactive items), `practice` (guided
   `steps`) — and the page range. Keep lessons small: three to six minutes each. Show the outline to the owner and
   adjust before writing. This is the one checkpoint; a wrong outline wastes everything after it.
4. **Write `packs/<pack-id>/<pack-id>.integrate-pack.json`.** Guidance:
   - `id`: short kebab-case, stable. Re-importing a pack with the same id updates it and keeps the owner's answers,
     so never change lesson ids or item `k` keys once a pack has been used.
   - `body`: short paragraphs in plain language. Use `{ "t": "h" }` sparingly, lists for lists.
   - Turn the book's exercises into the richest fitting item type rather than a blank text box: a checklist for
     "tick the ones that apply", `chips` with `star` for "choose your top three", `scale`/`scales` for ratings,
     `table` with `repeat: true` for a log to fill in again and again, `rows` for a table that grows, `pair` for
     either/or, `rank`, `rewrite`, and the maps (`radial`, `sensemap`, `window`, `feelwheel`, `circles`, `pins`) where
     the book has a matching diagram. Chain lessons with `show` and `blanks.suggest` so later lessons build on
     earlier answers.
   - A guided practice gets `steps` (one sentence each, spoken pace) and `stepSecs`.
   - `needs` + per-lesson `needs` give the "What do I need right now?" chips: five to eight states, each lesson
     tagged with the ones it helps.
   - `short` on every lesson: it is what the Toolkit search and the lists show.
   - Images only as `data:image/...` URLs with `alt` text, and only the owner's own images or simple diagrams you
     draw; do not embed scans of the book's pages.
5. **Check it.**
   ```bash
   node scripts/check-pack.mjs packs/<pack-id>/<pack-id>.integrate-pack.json
   ```
   Fix every error. Read the warnings and fix the ones that matter.
6. **Look at it in the app** when the change is more than a small edit: `npm run dev`, open Settings → Private packs
   → Import a pack, then open it from the Toolkit and step through a few lessons of each kind.
7. **Hand it over.** Send the `.integrate-pack.json` file to the owner (it cannot be committed). Tell them: save it
   to Files or Drive, then in the app go to Settings → Private packs → Import a pack. Remind them the pack is left
   out of backups, so they should keep the file; their answers are backed up as usual.

## Updating a pack later

Ask for the current pack file (or find it in `packs/`), edit it, keep the `id`, lesson ids and item keys, run the
check, and send the new file. Importing it replaces the old content and keeps the answers.
