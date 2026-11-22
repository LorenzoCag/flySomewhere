// Airport facts (id, name, city, state, coordinates, longest runway) are generated from the OurAirports
// CSVs in src/data/ (see scripts/build-airports.mjs). Interests and attractions are hand-curated in
// ./attractions.ts and merged on by airport id. Airports without curated entries get interests and attractions
// derived from OpenStreetMap data (src/data/airports.osm.json, see scripts/enrich-airports.mjs).
import generated from "@/data/airports.generated.json";
import osm from "@/data/airports.osm.json";
import { CURATION } from "./attractions";
import { deriveFromOsm, type OsmEnrichment } from "./enrich";

export type Interest = "restaurants" | "beaches" | "nature" | "museums" | "cities" | "scenic";
export const INTERESTS: { id: Interest; label: string }[] = [
  { id: "restaurants", label: "Restaurants" },
  { id: "beaches", label: "Beaches" },
  { id: "nature", label: "Nature" },
  { id: "museums", label: "Museums" },
  { id: "cities", label: "Cities" },
  { id: "scenic", label: "Scenic Airports" },
];
export type Attraction = { name: string; type: Interest; distanceMi: number; note?: string };
export type Airport = {
  id: string; name: string; city: string; state: string; lat: number; lon: number;
  runwayFt: number; elevationFt: number | null; interests: Interest[]; attractions: Attraction[];
};

type GeneratedAirport = Omit<Airport, "interests" | "attractions">;

/** Every airport in the CSV-derived dataset; searchable as a departure field. */
export const AIRPORTS: Airport[] = (generated as GeneratedAirport[]).map((ap) => {
  // Hand-curated data always wins over what we derived from OpenStreetMap.
  const { interests, attractions } = CURATION[ap.id] ?? deriveFromOsm((osm as Record<string, OsmEnrichment>)[ap.id]);
  return { ...ap, interests, attractions };
});

/** Uncurated airports need at least this long a runway to be recommended as destinations (skips tiny private strips). */
export const MIN_DESTINATION_RUNWAY_FT = 3000;

/** Recommendable destinations: every curated airport, plus any other airport with a decent runway. */
export const DESTINATIONS: Airport[] = AIRPORTS.filter(
  (ap) => ap.attractions.length > 0 || ap.runwayFt >= MIN_DESTINATION_RUNWAY_FT,
);

const BY_ID = new Map(AIRPORTS.map((ap) => [ap.id, ap]));

export function findAirport(q: string): Airport | undefined {
  const s = q.trim().toLowerCase();
  if (!s) return undefined;
  // Accept FAA-style ids without the leading K (e.g. "FDK" for "KFDK").
  const byId = BY_ID.get(s.toUpperCase()) ?? BY_ID.get(`K${s.toUpperCase()}`);
  if (byId) return byId;
  // Otherwise match on name/city, preferring airports we have curated content for.
  const hits = AIRPORTS.filter((x) => x.name.toLowerCase().includes(s) || x.city.toLowerCase().includes(s));
  return hits.find((x) => x.attractions.length > 0) ?? hits[0];
}

/** Autocomplete: id prefix matches first, then name/city matches; curated airports first within each group. */
export function searchAirports(q: string, limit = 10): Airport[] {
  const s = q.trim().toLowerCase();
  if (!s) return DESTINATIONS.filter((ap) => ap.attractions.length > 0).slice(0, limit);
  const rank = (ap: Airport) => {
    const id = ap.id.toLowerCase();
    const idScore = id.startsWith(s) || id.startsWith(`k${s}`) ? 0 : 2;
    const textHit = ap.name.toLowerCase().includes(s) || ap.city.toLowerCase().includes(s);
    if (idScore && !textHit) return -1;
    return idScore + (ap.attractions.length > 0 ? 0 : 1);
  };
  return AIRPORTS.map((ap) => ({ ap, r: rank(ap) })).filter((x) => x.r >= 0)
    .sort((a, b) => a.r - b.r).slice(0, limit).map((x) => x.ap);
}
