// Enriches airports with nearby points of interest from OpenStreetMap (via the Overpass API) and writes
// src/data/airports.osm.json. The app turns that into interest tags + attractions (see src/lib/enrich.ts).
//
//   npm run data:enrich                         # every airport with a runway >= 3000 ft (resumable)
//   npm run data:enrich -- --states DE,NJ       # only some states (good for a quick quality check)
//   npm run data:enrich -- --limit 40           # only the first N airports still missing
//   npm run data:enrich -- --force              # re-fetch airports that already have data
//
// Already-fetched airports are skipped, so you can stop (Ctrl-C) and re-run at any time.
// Be polite to the public Overpass servers: one request at a time, with a pause between batches.
import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const dir = new URL("../src/data/", import.meta.url);
const airportsPath = fileURLToPath(new URL("airports.generated.json", dir));
const outPath = fileURLToPath(new URL("airports.osm.json", dir));

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1] ?? true;
};
const STATES = opt("states", "") ? new Set(String(opt("states", "")).toUpperCase().split(",")) : null;
const LIMIT = Number(opt("limit", Infinity));
const BATCH = Number(opt("batch", 15));
const MIN_RUNWAY = Number(opt("min-runway", 3000));
const FORCE = args.includes("--force");
const PAUSE_MS = Number(opt("pause", 3000));

// The public Overpass servers are meant for light use and are often at capacity. For a full national run,
// point this at your own instance:  OVERPASS_URL=http://localhost:12345/api/interpreter npm run data:enrich
const ENDPOINTS = process.env.OVERPASS_URL
  ? [process.env.OVERPASS_URL]
  : ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"];

const M_PER_MI = 1609.344;
/** What we look for around each airport. Radii are in metres. */
const CATEGORIES = [
  { key: "restaurants", radius: 3200, filter: '[amenity~"^(restaurant|cafe)$"][name]' },
  { key: "museums", radius: 8000, filter: '[tourism=museum][name]' },
  { key: "beaches", radius: 8000, filter: '[natural=beach][name]' },
  { key: "nature", radius: 16000, filter: '[~"^(leisure|boundary)$"~"^(nature_reserve|national_park)$"][name]' },
  { key: "cities", radius: 16000, filter: '[place~"^(city|town)$"][name]' },
];
/** Max entries kept per category. Nearest first. */
const KEEP = { restaurants: 4, museums: 3, beaches: 2, nature: 3, cities: 2 };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const rad = Math.PI / 180;
function miles(aLat, aLon, bLat, bLon) {
  const dLat = (bLat - aLat) * rad, dLon = (bLon - aLon) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * rad) * Math.cos(bLat * rad) * Math.sin(dLon / 2) ** 2;
  return (2 * 3958.761 * Math.asin(Math.sqrt(h)));
}

function buildQuery(batch) {
  let q = "[out:json][timeout:180];\n";
  for (const ap of batch) {
    for (const c of CATEGORIES) {
      // Each block outputs its elements and then a "count" element, which lets us split the flat response.
      q += `nwr(around:${c.radius},${ap.lat},${ap.lon})${c.filter};out tags center;out count;\n`;
    }
  }
  return q;
}

async function overpass(query) {
  let lastErr;
  for (let attempt = 0; attempt < 5; attempt++) {
    const url = ENDPOINTS[attempt % ENDPOINTS.length];
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "flysomewhere-enrich/1.0" },
        body: "data=" + encodeURIComponent(query),
        signal: AbortSignal.timeout(200_000),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.remark && /error|timed out|out of memory/i.test(json.remark)) throw new Error(json.remark);
        return json;
      }
      lastErr = new Error(`${res.status} from ${url}`);
    } catch (e) {
      lastErr = e;
    }
    const wait = 10_000 * 2 ** attempt;
    console.warn(`  retry ${attempt + 1} (${lastErr.message}); waiting ${wait / 1000}s`);
    await sleep(wait);
  }
  throw lastErr;
}

/** Splits the flat Overpass response into one list of elements per (airport, category) block. */
function splitBlocks(elements, expected) {
  const blocks = [];
  let cur = [];
  for (const el of elements) {
    if (el.type === "count") { blocks.push(cur); cur = []; } else cur.push(el);
  }
  if (blocks.length !== expected) throw new Error(`expected ${expected} blocks, got ${blocks.length}`);
  return blocks;
}

function summarize(ap, cat, els) {
  const seen = new Map();
  for (const el of els) {
    const name = el.tags?.name;
    if (!name) continue;
    const lat = el.lat ?? el.center?.lat, lon = el.lon ?? el.center?.lon;
    if (lat == null || lon == null) continue;
    // Areas (parks, beaches) are reported by centre point, which can be far from the airport even when the
    // area reaches it; they matched the search radius, so cap the distance at that radius.
    let mi = miles(ap.lat, ap.lon, lat, lon);
    mi = Math.min(mi, cat.radius / M_PER_MI);
    const entry = { name, mi: Math.round(mi * 10) / 10 };
    if (cat.key === "museums" && /aviation|aero|air museum|air & space|aircraft|airplane|flight|wright|warbird/i.test(name)) entry.aviation = true;
    if (cat.key === "cities" && el.tags.place === "city") entry.city = true;
    const prev = seen.get(name);
    if (!prev || entry.mi < prev.mi) seen.set(name, entry);
  }
  return [...seen.values()].sort((a, b) => a.mi - b.mi).slice(0, KEEP[cat.key]);
}

function load() {
  return existsSync(outPath) ? JSON.parse(readFileSync(outPath, "utf8")) : {};
}
function save(data) {
  const tmp = outPath + ".tmp";
  writeFileSync(tmp, JSON.stringify(data) + "\n");
  renameSync(tmp, outPath);
}

const all = JSON.parse(readFileSync(airportsPath, "utf8"));
const data = load();
let todo = all
  .filter((a) => a.runwayFt >= MIN_RUNWAY)
  .filter((a) => !STATES || STATES.has(a.state))
  .filter((a) => FORCE || !(a.id in data));
// Group geographically so each batch covers a compact area.
todo.sort((a, b) => a.state.localeCompare(b.state) || a.lat - b.lat);
todo = todo.slice(0, LIMIT);

console.log(`${todo.length} airports to fetch (${Object.keys(data).length} already done), batch size ${BATCH}`);
const started = Date.now();
for (let i = 0; i < todo.length; i += BATCH) {
  const batch = todo.slice(i, i + BATCH);
  const blocks = splitBlocks((await overpass(buildQuery(batch))).elements, batch.length * CATEGORIES.length);
  batch.forEach((ap, bi) => {
    const entry = {};
    CATEGORIES.forEach((cat, ci) => {
      const list = summarize(ap, cat, blocks[bi * CATEGORIES.length + ci]);
      if (list.length) entry[cat.key] = list;
    });
    data[ap.id] = entry; // empty object = "checked, nothing found"
  });
  save(data);
  const done = Math.min(i + BATCH, todo.length);
  const mins = ((Date.now() - started) / 60000).toFixed(1);
  console.log(`  ${done}/${todo.length} (${batch[0].state}) – ${mins} min elapsed`);
  if (done < todo.length) await sleep(PAUSE_MS);
}
console.log(`Done. ${Object.keys(data).length} airports in ${outPath}`);
