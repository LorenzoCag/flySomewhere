import { useEffect, useState } from "react";
import type { Airport } from "@/lib/airports";
import { flightMinutes } from "@/lib/recommend";

type Poi = { id: number; name: string; kind: string; mi: number };

function useNearbyPois(ap: Airport) {
  const [pois, setPois] = useState<Poi[] | null>(null);
  const [err, setErr] = useState(false);
  useEffect(() => {
    let live = true; setPois(null); setErr(false);
    const q = `[out:json][timeout:20];(node(around:3200,${ap.lat},${ap.lon})[amenity~"^(restaurant|cafe)$"][name];node(around:8000,${ap.lat},${ap.lon})[tourism~"^(museum|attraction|viewpoint)$"][name];);out 40;`;
    fetch("https://overpass-api.de/api/interpreter", { method: "POST", body: "data=" + encodeURIComponent(q) })
      .then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
      .then((d: { elements: { id: number; lat: number; lon: number; tags: Record<string, string> }[] }) => {
        if (!live) return;
        const r = Math.PI / 180;
        setPois(d.elements.map((e) => {
          const dx = (e.lon - ap.lon) * Math.cos(ap.lat * r) * 69.17, dy = (e.lat - ap.lat) * 69.17;
          return { id: e.id, name: e.tags["name"] ?? "", kind: e.tags["amenity"] ?? e.tags["tourism"] ?? "", mi: Math.hypot(dx, dy) };
        }).sort((a, b) => a.mi - b.mi).slice(0, 12));
      })
      .catch(() => live && setErr(true));
    return () => { live = false; };
  }, [ap]);
  return { pois, err };
}

export function AirportDetail({ ap, nm, onClose }: { ap: Airport; nm: number; onClose: () => void }) {
  const { pois, err } = useNearbyPois(ap);
  return (
    <div className="fixed inset-0 z-[1000] flex justify-end bg-primary/40 backdrop-blur-sm" onClick={onClose}>
      <aside className="h-full w-full max-w-lg overflow-y-auto bg-background p-6 shadow-2xl sm:p-8" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="mb-6 text-sm text-muted-foreground hover:text-foreground">← Back to results</button>
        <p className="font-mono text-sm tracking-widest text-sky">{ap.id}</p>
        <h2 className="font-display text-4xl leading-tight">{ap.name}</h2>
        <p className="text-muted-foreground">{ap.city}, {ap.state}</p>
        <dl className="mt-6 grid grid-cols-3 gap-3">
          {[["Distance", `${Math.round(nm)} nm`], ["Est. flight", `~${flightMinutes(nm)} min`], ["Longest rwy", `${ap.runwayFt.toLocaleString()} ft`]].map(([k, v]) => (
            <div key={k} className="rounded-xl bg-secondary p-3"><dt className="text-xs text-muted-foreground">{k}</dt><dd className="font-semibold">{v}</dd></div>
          ))}
        </dl>
        <p className="mt-2 text-xs text-muted-foreground">Flight time is approximate (110 kt, straight line). Not for operational flight planning.</p>
        <h3 className="mt-8 mb-3 font-display text-2xl">Things to do</h3>
        <ul className="space-y-2">
          {ap.attractions.map((t) => (
            <li key={t.name} className="flex items-baseline justify-between gap-4 border-b pb-2">
              <span>{t.name}{t.note && <span className="block text-xs text-muted-foreground">{t.note}</span>}</span>
              <span className="shrink-0 text-sm text-muted-foreground">{t.distanceMi <= 1 ? "Walkable" : `~${t.distanceMi} mi`}</span>
            </li>
          ))}
        </ul>
        <h3 className="mt-8 mb-1 font-display text-2xl">Nearby on OpenStreetMap</h3>
        <p className="mb-3 text-xs text-muted-foreground">Places to eat within 2 mi and sights within 5 mi, straight-line distance.</p>
        {err ? <p className="text-sm text-muted-foreground">Couldn't load live map data right now.</p>
          : !pois ? <p className="text-sm text-muted-foreground">Loading nearby places…</p>
          : pois.length === 0 ? <p className="text-sm text-muted-foreground">No listed places found nearby.</p>
          : <ul className="space-y-1.5">{pois.map((p) => (
              <li key={p.id} className="flex justify-between gap-4 text-sm"><span>{p.name} <span className="text-muted-foreground capitalize">· {p.kind}</span></span><span className="shrink-0 text-muted-foreground">{p.mi.toFixed(1)} mi</span></li>
            ))}</ul>}
      </aside>
    </div>
  );
}
