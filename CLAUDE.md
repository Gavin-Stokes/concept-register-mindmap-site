# Concept Register mind map

## What this is
A public website that shows the Concept Register as a mind map. The register is a shared-language taxonomy for the Irish Government's Life Events programme (Central Design Unit, DPER). It exists so staff and the public get consistent terms across Departments.

Source of truth: the Concept Register database, edited locally using `concept-register-db.html`.

## How it fits together
`concept-register-db.html` (localStorage) → `site/index.html` reads from localStorage on load and syncs live via storage events.

A `site/data.json` fallback is also supported: if present, the page loads it on first visit before checking localStorage.

- `site/index.html`: the whole mind map. One file, plain HTML/CSS/JS, no libraries, no build step. Loads from the `concept-register-db` localStorage key; re-checks every 60 seconds and syncs across tabs via storage events.
- `concept-register-db.html`: local CRUD editor. Stores all concepts in localStorage. Export/import JSON for backup and transfer.
- `.github/workflows/sync-and-deploy.yml`: on push to main, deploys `site/` to GitHub Pages.
- `site/data.json`: optional static fallback. Not committed; can be generated externally if needed.

## Database fields
Staff-facing term (title), Concept ID (CON-XXXX), Public-facing term, Concept definition, Legal / statutory term, Synonyms & variants, Confidence status (Agreed / Contested / Draft), Service areas, Public term tested?, Owner role title, Next review due, Last reviewed, Related concepts (self-relation), Disputes & notes, Systems using this term.

## Rules
- The site is public. By default `data.json` leaves out "Disputes & notes" and "Systems using this term". Do not publish more fields, and do not remove `noindex`, without asking me.
- Keep it dependency-free and self-contained: no CDN scripts, no remote fonts, no build tooling unless I ask.
- User-facing text: plain English, Irish/British spelling (organisation, programme, prioritise), typographic apostrophes ('), no exclamation marks.
- Keep it accessible: keyboard operable, readable contrast in light and dark mode, works on a phone.
- Service areas stored as combined values like "Housing; Adult Social Care". The page splits on semicolons. Keep that behaviour.

## Current state
- Site is live at https://gavin-stokes.github.io/concept-register-mindmap-site/
- Data is loaded from localStorage, populated via `concept-register-db.html`.
- 15 seed concepts are pre-loaded in the DB editor on first use.
- `concept-register-db.html` is local only (not deployed).

## Known open items
- `index.html` still contains a dormant "Open in Notion" link block. It never shows because `url` is empty. Remove it if it simplifies things.

## Definition of done
1. `concept-register-db.html` opens locally, all concepts visible, CRUD works, export/import works.
2. `site/index.html` opens locally (or via Pages URL), loads concepts from localStorage, mind map renders correctly.
3. Grouping by service area and by status, related links, the detail panel, pan and zoom, and keyboard use all work at phone width.
4. Changes made in the DB editor appear in the mind map within a second (live localStorage sync).
