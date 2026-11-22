import { describe, it, expect } from "vitest";
import { AIRPORTS as ALL, DESTINATIONS as AIRPORTS, findAirport, searchAirports } from "./airports";
import { deriveFromOsm } from "./enrich";
import { recommend, flightMinutes, distanceNm } from "./recommend";
const fdk = findAirport("KFDK")!;
describe("recommendations", () => {
  it("assumes 110 knots", () => expect(flightMinutes(110)).toBe(60));
  it("respects max distance", () => {
    for (const r of recommend(fdk, AIRPORTS, 50, [], "nearest")) expect(r.nm).toBeLessThanOrEqual(50);
  });
  it("filters by interest", () => {
    const r = recommend(fdk, AIRPORTS, 300, ["beaches"], "recommended");
    expect(r.length).toBeGreaterThan(0);
    for (const x of r) expect(x.airport.interests).toContain("beaches");
  });
  it("sorts nearest first", () => {
    const r = recommend(fdk, AIRPORTS, 300, [], "nearest");
    expect(r[0]!.nm).toBeLessThanOrEqual(r[1]!.nm);
    expect(distanceNm(fdk, fdk)).toBe(0);
  });
});

describe("airport data", () => {
  it("every curated airport id exists in the CSV-derived data", async () => {
    const { CURATION } = await import("./attractions");
    const ids = new Set(AIRPORTS.map((a) => a.id));
    for (const id of Object.keys(CURATION)) expect(ids.has(id), id).toBe(true);
  });
});

describe("continental US coverage", () => {
  it("includes airports from across the country but not AK/HI", () => {
    for (const id of ["KLAX", "KSEA", "KMIA", "KORD", "KDEN"]) expect(findAirport(id), id).toBeDefined();
    expect(ALL.some((a) => a.state === "AK" || a.state === "HI")).toBe(false);
  });
  it("recommends destinations away from the Mid-Atlantic", () => {
    const r = recommend(findAirport("KDEN")!, AIRPORTS, 100, [], "nearest");
    expect(r.length).toBeGreaterThan(0);
  });
  it("autocompletes by id and by name", () => {
    expect(searchAirports("KFD")[0]!.id).toBe("KFDK");
    expect(searchAirports("frederick").some((a) => a.id === "KFDK")).toBe(true);
    expect(searchAirports("", 5)).toHaveLength(5);
  });
});

describe("OpenStreetMap enrichment", () => {
  it("derives interests and attractions from nearby places", () => {
    const r = deriveFromOsm({
      restaurants: [{ name: "Runway Grill", mi: 0.2 }, { name: "Far Diner", mi: 4 }],
      museums: [{ name: "Town Museum", mi: 2 }, { name: "Air Museum", mi: 3, aviation: true }],
      cities: [{ name: "Smallville", mi: 3 }, { name: "Metropolis", mi: 8, city: true }],
      beaches: [{ name: "Too Far Beach", mi: 9 }],
    });
    expect(r.interests).toEqual(["restaurants", "museums", "cities"]);
    expect(r.attractions.map((a) => a.name)).toEqual(["Runway Grill", "Air Museum", "Town Museum", "Metropolis"]);
    expect(r.attractions[0]!.note).toMatch(/on or next to/i);
  });
  it("returns nothing when there is no data", () => {
    expect(deriveFromOsm(undefined)).toEqual({ interests: [], attractions: [] });
    expect(deriveFromOsm({})).toEqual({ interests: [], attractions: [] });
  });
});
