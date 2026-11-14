# Private packs

A private pack is a workbook kept only on one phone. It's a single `.json` file the owner imports in
**Settings → Private packs**. The app stores it in IndexedDB (`integrate-packs`). It is never part of
this repo, the website, or backups. Answers to pack lessons are saved with the built-in workbook's
answers (`state.wb`), under lesson ids prefixed `pk-<pack id>:`, so they are backed up.

Packs are for material the owner has bought or been given. Don't commit pack files here.

## Shape

```json
{
  "format": "integrate-pack",
  "id": "short-kebab-id",
  "title": "Display title",
  "big": "word",            // optional: the big header word
  "sub": "smaller line",    // optional
  "eyebrow": "private pack",// optional
  "blurb": "One or two sentences.",
  "pageLabel": "p.",        // optional; "" hides page numbers
  "source": { "title": "", "authors": "", "publisher": "", "note": "" },
  "needs": [["id", "Chip label"]],          // optional "What do I need right now?" chips
  "help": { "title": "", "lines": [""], "note": "" },   // optional; shown on lessons with "help": true
  "modules": [
    {
      "id": "m1", "no": "01", "name": "Module name", "skill": "", "pages": "1-10", "intro": "",
      "lessons": [
        {
          "id": "unique-in-pack", "title": "", "short": "", "pg": "3", "mins": 5,
          "kind": "learn | exercise | practice",   // optional; inferred
          "needs": ["id"], "help": true, "share": true,
          "body": ["Paragraph", { "t": "h", "text": "Heading" }, { "t": "list", "items": [""] },
                   { "t": "ol", "items": [""] }, { "t": "quote", "text": "" }, { "t": "note", "text": "" }],
          "images": [{ "src": "data:image/png;base64,...", "alt": "", "caption": "" }],
          "fig": "spiky",                          // optional built-in figure id (components/WorkbookFigures.jsx)
          "steps": ["Guided step"], "stepSecs": 25,
          "items": [ /* see below */ ]
        }
      ]
    }
  ]
}
```

## Item types

Every item has `t` and (except `note`, `head`, `prefix`, `show`) a `k` key that is unique within the lesson.

| t | fields |
|---|---|
| `note` | `text` |
| `head` | `text` |
| `text` | `label`, `hint`, `short` (single line) |
| `list` | `label`, `n`, `hint` |
| `blanks` | `label`, `n`, `suggest: { lesson, k }` (chips from another lesson's starred/selected chips) |
| `chips` | `label`, `options` or `groups: [[name, [words], note]]`, `star` (max starred), `own` |
| `one` | `label`, `options` (single choice) |
| `freq` | `label` (Never … Always) |
| `scale` | `label`, `left`, `right` (0–10 slider) |
| `scales` | `label`, `left`, `right`, `rows` |
| `check` | `label`, `groups: [[name, [items]]]` or a flat list, `star` (second-tap meaning), `tally` |
| `rank` | `label`, `options`, `n` |
| `table` | `label`, `rows: [[key, label, example]]`, `repeat` (save to journal and clear) |
| `rows` | `label`, `cols: [[key, label, hint or "tick"]]`, `min`, `pre` (fixed first-column labels) |
| `pick` | `label`, `rows`, `options` (one choice per row) |
| `pair` | `label`, `rows: [[a, b]]` (tap either or both) |
| `strike` | `from` (a `list` key in the same lesson), `label` |
| `prefix` | `from` (a `list` key), `steps: [[title, prefix]]` |
| `show` | `from` (lesson id), `keys: [[k, label]]`, `label` |
| `rewrite` | `label`, `rows: [[before, suggestion]]` |
| `plan` | (objective, three goals with values and actions) |
| `radial` | `label`, `hub`, `levels`, `cap`, `axes: [[name, shortLabel, [levelLabels]]]` |
| `sensemap` | `label`, `rows`, `zones: [left, middle, right]`, `cap` |
| `window` | `label`, `cap`, `tags: [top, middle, bottom]`, `bands: [[min, title, text]]` |
| `feelwheel` | `label`, `groups` (as chips), `short` (slice labels), `cap` |
| `circles` | `label`, `from` (a `list` key), `rings: [inner, middle, outer]`, `cap` |
| `spoonday` | `label` |
| `pins` | `label`, `image` (`"body"` or a `data:image/...` URL), `h` (viewBox height, width is 300), `tags`, `hint`, `cap` |

## Making one

The `build-pack` skill (`.claude/skills/build-pack/SKILL.md`) is the recipe: give Claude Code a book or document
you own and ask it to build a pack. Two scripts do the mechanical parts:

```
npm run pack:text -- books/my-book.pdf packs/my-book/book.txt     # PDF, EPUB, .txt or .md to text with page markers
npm run pack:check -- packs/my-book/my-book.integrate-pack.json   # every rule above, with the lesson and item at fault
```

`books/` and `packs/` are ignored by git.
