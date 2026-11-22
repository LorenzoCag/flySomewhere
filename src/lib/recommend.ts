import type { Airport, Interest } from "./airports";
export const CRUISE_KTS = 110;
export function distanceNm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const R = 3440.065, r = Math.PI / 180;
  const dLat = (b.lat - a.lat) * r, dLon = (b.lon - a.lon) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
export function flightMinutes(nm: number) { return Math.round((nm / CRUISE_KTS) * 60); }
export type Sort = "recommended" | "nearest" | "farthest";
export type Result = { airport: Airport; nm: number; score: number };

/** Rules: within range, matches any selected interest (all if none). Score = interest matches + nearby-attraction bonus (walkable ≤1mi counts most). */
export function recommend(from: Airport, all: Airport[], maxNm: number, interests: Interest[], sort: Sort): Result[] {
  const out: Result[] = [];
  for (const ap of all) {
    if (ap.id === from.id) continue;
    const nm = distanceNm(from, ap);
    if (nm > maxNm) continue;
    const matches = interests.length ? ap.interests.filter((i) => interests.includes(i)).length : 1;
    if (!matches) continue;
    let score = matches * 3;
    for (const at of ap.attractions) score += at.distanceMi <= 1 ? 3 : at.distanceMi <= 5 ? 1.5 : 0.5;
    out.push({ airport: ap, nm, score });
  }
  return out.sort((x, y) => sort === "nearest" ? x.nm - y.nm : sort === "farthest" ? y.nm - x.nm : y.score - x.score || x.nm - y.nm);
}
