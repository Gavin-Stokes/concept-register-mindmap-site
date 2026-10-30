# Concept Register mind map

## What this is
A public website that shows the Concept Register as a mind map. The register is a shared-language taxonomy for the Irish Government's Life Events programme (Central Design Unit, DPER). It exists so staff and the public get consistent terms across Departments.

Source of truth: a Notion database called "Concept Register".
- Database: https://app.notion.com/p/342d7907ed9380b886b2c57e3132b39b
- Data source ID: 342d7907-ed93-8171-9045-000b084c9d16
- Never treat the website or data.json as the source of truth. Edits to concepts happen in Notion.

## How it fits together
Notion register -> scripts/sync.mjs (Notion API, version 2025-09-03) -> site/data.json -> site/index.html

- `site/index.html`: the whole mind map. One file, plain HTML/CSS/JS, no libraries, no build step. It fetches `data.json` and re-checks every 60 seconds.
- `scripts/sync.mjs`: Node 20+ script, no dependencies. Reads the register and writes `site/data.json`. The `P` block at the top maps Notion property names to fields.
- `.github/workflows/sync-and-deploy.yml`: every 15 minutes it runs the sync and deploys `site/` to GitHub Pages.
- `site/data.json` is generated and gitignored.

## Notion properties used
Staff-facing term (the title property), Concept ID (text, CON-XXXX), Public-facing term, Concept definition, Legal / statutory term, Synonyms & variants, Confidence status (select: Agreed, Contested, Draft), Service areas (multi-select), Public term tested? (checkbox), Owner role title, Next review due, Last reviewed, Related concepts (self-relation), Disputes & notes, Systems using this term.

Staff-facing term is the title on purpose, so Related concepts are chosen by staff term in Notion. Do not change that.

## Rules
- Never read, print, log, store or commit the Notion token. It is only ever the `NOTION_TOKEN` environment variable locally and a GitHub Actions secret in CI. If you need it run, ask me to run the command.
- The site is public. By default `data.json` leaves out "Disputes & notes" and "Systems using this term". Do not publish more fields, and do not remove `noindex`, without asking me.
- Do not change the Notion database schema or its content without asking me first.
- Keep it dependency-free and self-contained: no CDN scripts, no remote fonts, no build tooling unless I ask.
- User-facing text: plain English, Irish/British spelling (organisation, programme, prioritise), typographic apostrophes (’), no exclamation marks.
- Keep it accessible: keyboard operable, readable contrast in light and dark mode, works on a phone.
- Service areas imported as combined values like "Housing; Adult Social Care". The page splits on semicolons, so it works either way. Keep that behaviour.

## Current state
- The page and sync script were tested only with mock data in jsdom. They have not yet been run against the real Notion register or in a real browser.
- Last attempt to run the sync returned a 401, which means the token was wrong. I am fixing that myself.
- Not yet pushed to GitHub or deployed.
- Reference version running inside claude.ai (not a dependency): https://claude.ai/artifact/PqhkwdBq7dRvT8SGVLtxhf

## Known open items
- Notion: Service areas options should be split into single areas; Confidence status has no Deprecated option. These are Notion changes, so ask me first.
- `index.html` still contains a dormant "Open in Notion" link block. It never shows because `url` is empty. Remove it if it simplifies things.

## Definition of done
1. `node scripts/sync.mjs` writes `site/data.json` from the real register.
2. The page loads from a local web server (not file://) with no console errors.
3. Grouping by service area and by status, status filters, related links, the detail panel, pan and zoom, and keyboard use all work, including at phone width.
4. Repo pushed to GitHub, `NOTION_TOKEN` secret set by me, Pages enabled, workflow run succeeds, public URL loads.