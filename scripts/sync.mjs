// Copies the Concept Register from Notion into site/data.json.
// Needs Node 20 or later. No packages to install.
//
// Environment:
//   NOTION_TOKEN              required. Internal integration token (read access only).
//   NOTION_DATA_SOURCE_ID     optional. Defaults to the Concept Register data source.
//   PUBLISH_STATUSES          optional. Comma-separated, e.g. "Agreed" to publish only agreed concepts.
//                             Empty means every status.
//   PUBLISH_INTERNAL_FIELDS   optional. "true" also publishes "Disputes & notes" and
//                             "Systems using this term". Off by default because the site is public.
//   OUT_FILE                  optional. Defaults to site/data.json.
//   ALLOW_EMPTY               optional. "true" lets the job succeed when the register has no rows.

import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const TOKEN = process.env.NOTION_TOKEN;
const DATA_SOURCE_ID = process.env.NOTION_DATA_SOURCE_ID || "342d7907-ed93-8171-9045-000b084c9d16";
const OUT_FILE = process.env.OUT_FILE || "site/data.json";
const NOTION_VERSION = "2025-09-03";
const PUBLISH_STATUSES = (process.env.PUBLISH_STATUSES || "").split(",").map((s) => s.trim()).filter(Boolean);
const INTERNAL = process.env.PUBLISH_INTERNAL_FIELDS === "true";
const ALLOW_EMPTY = process.env.ALLOW_EMPTY === "true";

// Property names in the Notion database. Change here if you rename them in Notion.
const P = {
  title: "Staff-facing term",
  conceptId: "Concept ID",
  pub: "Public-facing term",
  def: "Concept definition",
  legal: "Legal / statutory term",
  syn: "Synonyms & variants",
  status: "Confidence status",
  areas: "Service areas",
  tested: "Public term tested?",
  owner: "Owner role title",
  next: "Next review due",
  last: "Last reviewed",
  related: "Related concepts",
  disputes: "Disputes & notes",
  systems: "Systems using this term",
};

function fail(message) {
  console.error(`sync failed: ${message}`);
  process.exit(1);
}

if (!TOKEN) { fail("NOTION_TOKEN is not set."); }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function notion(path, body, attempt = 1) {
  const res = await fetch(`https://api.notion.com/v1${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if ((res.status === 429 || res.status >= 500) && attempt < 4) {
    const wait = Number(res.headers.get("retry-after")) * 1000 || attempt * 2000;
    await sleep(wait);
    return notion(path, body, attempt + 1);
  }
  if (!res.ok) {
    const text = await res.text();
    if (res.status === 401) { fail("Notion rejected the token (401). Check the NOTION_TOKEN secret."); }
    if (res.status === 404) { fail("Notion can’t find the register (404). Share the database with your integration: open it in Notion, then ••• → Connections → add the integration."); }
    fail(`Notion returned ${res.status}: ${text.slice(0, 300)}`);
  }
  return res.json();
}

const plain = (arr) => (Array.isArray(arr) ? arr.map((t) => t.plain_text || "").join("") : "").trim();
const prop = (page, name) => page.properties?.[name];
const text = (page, name) => {
  const p = prop(page, name);
  if (!p) { return ""; }
  if (p.type === "title") { return plain(p.title); }
  if (p.type === "rich_text") { return plain(p.rich_text); }
  if (p.type === "select") { return p.select?.name || ""; }
  return "";
};
const dateOf = (page, name) => prop(page, name)?.date?.start || "";
const multi = (page, name) => (prop(page, name)?.multi_select || []).map((o) => o.name);
const rels = (page, name) => (prop(page, name)?.relation || []).map((r) => r.id.replace(/-/g, "").toLowerCase());

function toConcept(page) {
  const c = {
    id: page.id.replace(/-/g, "").toLowerCase(),
    conceptId: text(page, P.conceptId),
    name: text(page, P.title),
    pub: text(page, P.pub),
    def: text(page, P.def),
    legal: text(page, P.legal),
    syn: text(page, P.syn),
    status: text(page, P.status),
    areas: multi(page, P.areas),
    tested: prop(page, P.tested)?.checkbox === true,
    owner: text(page, P.owner),
    next: dateOf(page, P.next),
    last: dateOf(page, P.last),
    related: rels(page, P.related),
  };
  if (INTERNAL) {
    c.disputes = text(page, P.disputes);
    c.systems = text(page, P.systems);
  }
  return c;
}

const pages = [];
let cursor;
do {
  const body = { page_size: 100 };
  if (cursor) { body.start_cursor = cursor; }
  const data = await notion(`/data_sources/${DATA_SOURCE_ID}/query`, body);
  pages.push(...data.results.filter((r) => r.object === "page" && !r.in_trash && !r.archived));
  cursor = data.has_more ? data.next_cursor : undefined;
} while (cursor);

let concepts = pages.map(toConcept);
if (PUBLISH_STATUSES.length) {
  concepts = concepts.filter((c) => PUBLISH_STATUSES.includes(c.status));
}
const kept = new Set(concepts.map((c) => c.id));
concepts.forEach((c) => { c.related = c.related.filter((id) => kept.has(id)); });
concepts.sort((a, b) => a.conceptId.localeCompare(b.conceptId, "en", { numeric: true }) || a.name.localeCompare(b.name, "en"));

if (!concepts.length && !ALLOW_EMPTY) {
  fail("the register returned no concepts, so nothing was written. Set ALLOW_EMPTY=true if that is intended.");
}

await mkdir(dirname(OUT_FILE), { recursive: true });
await writeFile(OUT_FILE, JSON.stringify({ generatedAt: new Date().toISOString(), concepts }, null, 2) + "\n");
console.log(`Wrote ${concepts.length} concepts to ${OUT_FILE}`);
