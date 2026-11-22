import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense, useMemo, useRef, useState, useEffect } from "react";
import { AIRPORTS, DESTINATIONS, INTERESTS, findAirport, type Interest } from "@/lib/airports";
import { recommend, flightMinutes, type Sort } from "@/lib/recommend";
import { AirportDetail } from "@/components/AirportDetail";

const FlyMap = lazy(() => import("@/components/FlyMap"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FlySomewhere — Find your next reason to fly" },
      { name: "description", content: "Discover airports worth visiting from your home field: restaurants, beaches, museums and scenic strips within your range." },
      { property: "og:title", content: "FlySomewhere — Find your next reason to fly" },
      { property: "og:description", content: "Where should I fly this weekend? Discover GA destinations by distance and interests." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [query, setQuery] = useState("KFDK");
  const [maxNm, setMaxNm] = useState(120);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [search, setSearch] = useState({ from: findAirport("KFDK")!, maxNm: 120, interests: [] as Interest[] });
  const [error, setError] = useState("");
  const [sort, setSort] = useState<Sort>("recommended");
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<string | null>(null);
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});

  const results = useMemo(() => recommend(search.from, DESTINATIONS, search.maxNm, search.interests, sort), [search, sort]);
  const mapAirports = useMemo(() => results.map((r) => r.airport), [results]);
  const detailRes = results.find((r) => r.airport.id === detail);

  useEffect(() => { if (selected) cardRefs.current[selected]?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [selected]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const from = findAirport(query);
    if (!from) { setError("Airport not found in our Mid-Atlantic data. Try KFDK, KESN or Lancaster."); return; }
    setError(""); setSelected(null); setQuery(from.id);
    setSearch({ from, maxNm, interests });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-hero text-primary-foreground">
        <div className="mx-auto max-w-7xl px-5 pt-8 pb-10">
          <div className="font-display text-2xl">FlySomewhere<span className="text-sky">.</span></div>
          <h1 className="mt-8 max-w-2xl font-display text-5xl leading-[1.05] sm:text-6xl">Find your next reason to fly.</h1>
          <p className="mt-3 max-w-xl text-primary-foreground/70">Where should you fly this weekend? Pick your home field, your range and what you're in the mood for.</p>
          <form onSubmit={submit} className="mt-8 grid gap-4 rounded-2xl bg-background p-5 text-foreground shadow-xl lg:grid-cols-[1fr_1.2fr_auto] lg:items-end">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Departure airport</span>
              <input list="airports" value={query} onChange={(e) => setQuery(e.target.value)} className="mt-1 w-full rounded-lg border bg-secondary px-3 py-2.5 font-mono uppercase outline-none focus:ring-2 focus:ring-ring" />
              <datalist id="airports">{AIRPORTS.map((a) => <option key={a.id} value={a.id}>{a.name}, {a.city} {a.state}</option>)}</datalist>
            </label>
            <label className="block">
              <span className="flex justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground"><span>Max distance</span><span className="text-foreground">{maxNm} nm · ~{flightMinutes(maxNm)} min</span></span>
              <input type="range" min={25} max={300} step={5} value={maxNm} onChange={(e) => setMaxNm(+e.target.value)} className="mt-3 w-full accent-[var(--sky)]" />
            </label>
            <button className="rounded-lg bg-sky px-6 py-3 font-semibold text-primary transition hover:brightness-105">Find Destinations</button>
            <div className="flex flex-wrap gap-2 lg:col-span-3">
              {INTERESTS.map((i) => {
                const on = interests.includes(i.id);
                return <button type="button" key={i.id} onClick={() => setInterests(on ? interests.filter((x) => x !== i.id) : [...interests, i.id])}
                  className={`rounded-full border px-3.5 py-1.5 text-sm transition ${on ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary"}`}>{i.label}</button>;
              })}
            </div>
            {error && <p className="text-sm text-destructive lg:col-span-3">{error}</p>}
          </form>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-5 px-5 py-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="h-[55vh] overflow-hidden rounded-2xl border lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
          <ClientOnly fallback={<div className="h-full bg-secondary" />}>
            <Suspense fallback={<div className="h-full bg-secondary" />}>
              <FlyMap from={search.from} maxNm={search.maxNm} results={mapAirports} selected={selected} onSelect={setSelected} />
            </Suspense>
          </ClientOnly>
        </div>
        <section>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-muted-foreground"><b className="text-foreground">{results.length}</b> destinations from {search.from.id}</p>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="rounded-lg border bg-background px-2 py-1.5 text-sm">
              <option value="recommended">Recommended</option><option value="nearest">Nearest</option><option value="farthest">Farthest</option>
            </select>
          </div>
          {results.length === 0 && <p className="rounded-2xl bg-secondary p-6 text-muted-foreground">No matches. Try a longer range or fewer interests.</p>}
          <div className="space-y-3">
            {results.map(({ airport: ap, nm }) => (
              <article key={ap.id} ref={(n) => { cardRefs.current[ap.id] = n; }} onMouseEnter={() => setSelected(ap.id)} onClick={() => { setSelected(ap.id); setDetail(ap.id); }}
                className={`cursor-pointer rounded-2xl border bg-card p-5 transition hover:shadow-lg ${selected === ap.id ? "border-sky ring-2 ring-sky/40" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs tracking-widest text-sky">{ap.id}</p>
                    <h3 className="font-display text-2xl leading-tight">{ap.name}</h3>
                    <p className="text-sm text-muted-foreground">{ap.city}, {ap.state}</p>
                  </div>
                  <div className="text-right text-sm"><div className="font-semibold">{Math.round(nm)} nm</div><div className="text-muted-foreground">~{flightMinutes(nm)} min*</div></div>
                </div>
                <ul className="mt-3 space-y-1 text-sm">
                  {ap.attractions.slice(0, 3).map((t) => <li key={t.name} className="flex justify-between gap-3"><span>{t.name}</span><span className="shrink-0 text-muted-foreground">{t.distanceMi <= 1 ? "Walkable" : `~${t.distanceMi} mi`}</span></li>)}
                </ul>
                <p className="mt-3 text-xs text-muted-foreground">Longest runway {ap.runwayFt.toLocaleString()} ft</p>
              </article>
            ))}
          </div>
          <p className="mt-6 text-xs text-muted-foreground">*Estimated flight times assume 110 knots, straight line, no wind. Approximate only — not intended for operational flight planning. Mid-Atlantic region MVP.</p>
        </section>
      </main>
      {detailRes && <AirportDetail ap={detailRes.airport} nm={detailRes.nm} onClose={() => setDetail(null)} />}
    </div>
  );
}
