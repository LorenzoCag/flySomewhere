import { describe, it, expect } from "vitest";
import { DESTINATIONS as AIRPORTS, findAirport } from "./airports";
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
