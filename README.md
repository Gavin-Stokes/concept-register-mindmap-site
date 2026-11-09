# Concept Register Mind Map

A public website that shows the Concept Register as a mind map.

```
concept-register-db.html (localStorage) ──> site/index.html
```

The DB editor (`concept-register-db.html`) stores all concepts in your browser's localStorage. The mind map reads from the same localStorage key and refreshes live as you make changes.

## What goes public

Everything stored in the DB editor is visible in the mind map. By default, "Disputes & notes" and "Systems using this term" are hidden from the public site. The page asks search engines not to index it (`noindex` in `site/index.html`). Remove that line if you want it findable.

## Set it up

1. **Clone or download this repository.**

2. **Open the DB editor** — open `concept-register-db.html` in Chrome (or any browser that supports `localStorage` across `file://` pages). It pre-loads 15 seed concepts on first use.

3. **Add and edit concepts** using the DB editor. Changes appear in the mind map immediately.

4. **Open the mind map locally** — open `site/index.html` in the same browser. It reads from the same localStorage as the DB editor.

5. **Deploy to GitHub Pages** — push to `main`. The workflow deploys `site/` automatically. The mind map at the Pages URL will load from `localStorage` if concepts are present in the visitor's browser, or from a static `site/data.json` if one is provided as a fallback.

## Export and import

Use the **Export** button in the DB editor to download a JSON backup. Use **Import** to restore from a backup file. This is the recommended way to transfer data between machines or share a snapshot.

## Things to know

- `localStorage` is per-browser. Data entered in one browser is not automatically shared with others. Use Export/Import to move data, or publish a `site/data.json` as a static fallback.
- The deployed Pages site at `gavin-stokes.github.io/concept-register-mindmap-site` shows whatever is in the visitor's own localStorage, falling back to `data.json` if present.
- The DB editor is local only and is not deployed to GitHub Pages.

## Files

- `site/index.html` — the mind map page
- `concept-register-db.html` — local CRUD editor for the Concept Register
- `.github/workflows/sync-and-deploy.yml` — deploys `site/` to GitHub Pages on push
