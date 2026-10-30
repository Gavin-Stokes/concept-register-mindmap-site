# Concept Register mind map

A public website that shows the Concept Register as a mind map and keeps itself up to date.

```
Notion Concept Register ──(every 15 min, scripts/sync.mjs)──> site/data.json ──> site/index.html
```

The page itself is static. A scheduled job copies the register out of Notion into `data.json`, and the page reads that file. Visitors never touch Notion and need no account.

## What goes public

Everything in `site/data.json` is public once deployed. By default it contains each concept’s term, public wording, definition, legal reference, synonyms, status, service areas, owner role title, review dates and related concepts.

It does **not** contain "Disputes & notes" or "Systems using this term". Those usually hold internal discussion and system field names. Set `PUBLISH_INTERNAL_FIELDS: "true"` in the workflow only if you want them public.

To publish only settled terms, set `PUBLISH_STATUSES: "Agreed"` in the workflow. Draft and contested concepts, and any links to them, then stay off the site.

The page asks search engines not to index it (`noindex` in `site/index.html`). Remove that line if you want it findable.

## Set it up (about 15 minutes)

1. **Create the repository.** On GitHub, create a new repository and upload everything in this folder, including the hidden `.github` folder. Use the `main` branch.

2. **Create a Notion integration.**
   - Go to https://www.notion.so/profile/integrations and choose *New integration* (internal).
   - Under *Capabilities*, tick **Read content** only. Leave insert and update unticked.
   - Copy the *Internal Integration Secret*.

3. **Let the integration see the register.** Open the Concept Register in Notion, choose ••• → *Connections* and add your integration. Without this step the sync fails with a 404.

4. **Add the secret to GitHub.** In the repository: *Settings → Secrets and variables → Actions → New repository secret*. Name it `NOTION_TOKEN` and paste the secret. Never put the token in a file.

5. **Turn on Pages.** *Settings → Pages → Build and deployment → Source: GitHub Actions*.

6. **Run it.** *Actions → Copy register from Notion and deploy → Run workflow*. When it finishes, the site address appears in the run summary and under *Settings → Pages*.

After that it refreshes by itself every 15 minutes. A change in Notion shows on the site within about 15 minutes, plus up to a minute for an open page to notice.

## Things to know

- GitHub pauses scheduled workflows in a repository with no activity for 60 days. If the site stops updating, open the Actions tab and re-enable the workflow, or make any small commit.
- Scheduled runs can start a few minutes late when GitHub is busy.
- If a sync fails (token expired, register not shared), the job fails and the previous version of the site stays up. GitHub emails the repository owner about failed runs.
- Renamed a property in Notion? Update the names in the `P` block at the top of `scripts/sync.mjs`.
- To run it on your own machine: `NOTION_TOKEN=... node scripts/sync.mjs`, then serve the `site` folder, for example `npx serve site`.

## Hosting somewhere else

Only `site/` is deployed. Any static host works (Azure Static Web Apps, Netlify, S3 with CloudFront, an internal web server). Run `node scripts/sync.mjs` on a schedule there, with `NOTION_TOKEN` as a secret, and publish the `site` folder afterwards. To put the site behind a login instead of leaving it public, use the host’s own authentication, for example Azure Static Web Apps authentication or Cloudflare Access.

## Files

- `site/index.html` the mind map page
- `scripts/sync.mjs` copies the register from Notion to `site/data.json`
- `.github/workflows/sync-and-deploy.yml` schedule, build and deploy
