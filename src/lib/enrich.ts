// Turns raw OpenStreetMap results (src/data/airports.osm.json, produced by scripts/enrich-airports.mjs)
// into the interest tags and attractions the recommender uses. Pure so the rules are easy to test and tune.
import type { Attraction, Interest } from "./airports";

type Place = { name: string; mi: number; aviation?: boolean; city?: boolean };
export type OsmEnrichment = Partial<Record<"restaurants" | "museums" | "beaches" | "nature" | "cities", Place[]>>;

/** How close (miles) something must be to count toward an interest tag. */
export const INTEREST_RADIUS_MI = { restaurants: 2, museums: 5, beaches: 5, nature: 10, cities: 10 } as const;
/** Restaurants this close are described as being on the field. */
export const ON_FIELD_MI = 0.5;
const MAX_ATTRACTIONS = 6;

export function deriveFromOsm(e: OsmEnrichment | undefined): { interests: Interest[]; attractions: Attraction[] } {
  if (!e) return { interests: [], attractions: [] };
  const within = (list: Place[] | undefined, mi: number) => (list ?? []).filter((p) => p.mi <= mi);
  const restaurants = within(e.restaurants, INTEREST_RADIUS_MI.restaurants);
  // Aviation museums first: they're the classic reason to fly somewhere.
  const museums = within(e.museums, INTEREST_RADIUS_MI.museums).sort((a, b) => Number(!!b.aviation) - Number(!!a.aviation) || a.mi - b.mi);
  const beaches = within(e.beaches, INTEREST_RADIUS_MI.beaches);
  const nature = within(e.nature, INTEREST_RADIUS_MI.nature);
  const cities = within(e.cities, INTEREST_RADIUS_MI.cities).filter((c) => c.city);

  const interests: Interest[] = [];
  if (restaurants.length) interests.push("restaurants");
  if (museums.length) interests.push("museums");
  if (beaches.length) interests.push("beaches");
  if (nature.length) interests.push("nature");
  if (cities.length) interests.push("cities");

  const at = (p: Place, type: Interest, note?: string): Attraction => ({ name: p.name, type, distanceMi: p.mi, ...(note ? { note } : {}) });
  const attractions: Attraction[] = [
    ...restaurants.slice(0, 2).map((p) => at(p, "restaurants", p.mi <= ON_FIELD_MI ? "On or next to the field" : undefined)),
    ...museums.slice(0, 2).map((p) => at(p, "museums", p.aviation ? "Aviation museum" : undefined)),
    ...beaches.slice(0, 1).map((p) => at(p, "beaches")),
    ...nature.slice(0, 1).map((p) => at(p, "nature")),
    ...cities.slice(0, 1).map((p) => at(p, "cities")),
  ].slice(0, MAX_ATTRACTIONS);
  return { interests, attractions };
}
