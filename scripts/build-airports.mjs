// Builds src/data/airports.generated.json from the OurAirports CSVs in src/data/.
// Run with: npm run data:airports   (re-run whenever airports.csv / runways.csv change)
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const dir = new URL("../src/data/", import.meta.url);

// Regions and airport types to keep. Edit these to widen the app's coverage.
const STATES = new Set(["MD", "DE", "NJ", "VA", "PA", "NC", "WV", "DC"]);
const TYPES = new Set(["small_airport", "medium_airport", "large_airport"]);

/** Minimal RFC 4180 CSV parser (quoted fields, escaped quotes, embedded newlines). */
function parseCsv(text) {
  const rows = [];
  let row = [], field = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else quoted = false; }
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  const [header, ...body] = rows;
  return body.map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ""])));
}

const read = (name) => parseCsv(readFileSync(new URL(name, dir), "utf8").replace(/^\uFEFF/, ""));

// Longest non-closed runway per airport, keyed by airport ident.
const longest = new Map();
for (const r of read("runways.csv")) {
  if (r.closed === "1") continue;
  const ft = parseInt(r.length_ft, 10);
  if (!ft) continue;
  if (ft > (longest.get(r.airport_ident) ?? 0)) longest.set(r.airport_ident, ft);
}

const round = (n, p = 4) => Math.round(n * 10 ** p) / 10 ** p;
const airports = [];
for (const a of read("airports.csv")) {
  if (a.iso_country !== "US" || !TYPES.has(a.type)) continue;
  const state = a.iso_region.replace(/^US-/, "");
  if (!STATES.has(state)) continue;
  const runwayFt = longest.get(a.ident);
  if (!runwayFt) continue; // no usable runway data
  airports.push({
    id: a.ident,
    name: a.name.replace(/\s+(Airport|Airfield)$/i, ""),
    city: a.municipality,
    state,
    lat: round(parseFloat(a.latitude_deg)),
    lon: round(parseFloat(a.longitude_deg)),
    runwayFt,
    elevationFt: a.elevation_ft ? parseInt(a.elevation_ft, 10) : null,
  });
}
airports.sort((x, y) => x.id.localeCompare(y.id));

const out = fileURLToPath(new URL("airports.generated.json", dir));
writeFileSync(out, JSON.stringify(airports) + "\n");
console.log(`Wrote ${airports.length} airports to ${out}`);
