// Airport facts (id, name, city, state, coordinates, longest runway) are generated from the OurAirports
// CSVs in src/data/ (see scripts/build-airports.mjs). Interests and attractions are hand-curated in
// ./attractions.ts and merged on by airport id.
import generated from "@/data/airports.generated.json";
import { CURATION } from "./attractions";

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
export const AIRPORTS: Airport[] = (generated as GeneratedAirport[]).map((ap) => ({
  ...ap,
  interests: CURATION[ap.id]?.interests ?? [],
  attractions: CURATION[ap.id]?.attractions ?? [],
}));

/** Airports with curated attractions; these are the ones we recommend as destinations. */
export const DESTINATIONS: Airport[] = AIRPORTS.filter((ap) => ap.attractions.length > 0);

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
