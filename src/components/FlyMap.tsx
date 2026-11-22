import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Airport } from "@/lib/airports";

type Props = { from: Airport; maxNm: number; results: Airport[]; selected: string | null; onSelect: (id: string) => void };

function css(name: string) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }

export default function FlyMap({ from, maxNm, results, selected, onSelect }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);
  const markers = useRef<Record<string, L.CircleMarker>>({});
  const cb = useRef(onSelect); cb.current = onSelect;

  useEffect(() => {
    if (!el.current) return;
    const m = L.map(el.current, { zoomControl: true }).setView([from.lat, from.lon], 7);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap contributors", maxZoom: 18 }).addTo(m);
    map.current = m; layer.current = L.layerGroup().addTo(m);
    return () => { m.remove(); map.current = null; };
  }, []);

  useEffect(() => {
    const m = map.current, g = layer.current; if (!m || !g) return;
    g.clearLayers(); markers.current = {};
    const navy = css("--primary"), sky = css("--sky");
    const circle = L.circle([from.lat, from.lon], { radius: maxNm * 1852, color: sky, weight: 1.5, fillColor: sky, fillOpacity: 0.06, dashArray: "6 6" }).addTo(g);
    L.circleMarker([from.lat, from.lon], { radius: 9, color: "#fff", weight: 3, fillColor: navy, fillOpacity: 1 }).bindTooltip(`${from.id} · Departure`, { permanent: true, direction: "top", offset: [0, -8] }).addTo(g);
    for (const ap of results) {
      const mk = L.circleMarker([ap.lat, ap.lon], { radius: 7, color: "#fff", weight: 2, fillColor: sky, fillOpacity: 1 })
        .bindTooltip(`${ap.id} · ${ap.city}`, { direction: "top" }).on("click", () => cb.current(ap.id)).addTo(g);
      markers.current[ap.id] = mk;
    }
    m.fitBounds(circle.getBounds(), { padding: [20, 20] });
  }, [from, maxNm, results]);

  useEffect(() => {
    const navy = css("--primary"), sky = css("--sky");
    for (const [id, mk] of Object.entries(markers.current)) {
      const on = id === selected;
      mk.setStyle({ fillColor: on ? navy : sky, radius: on ? 10 : 7 });
      if (on) { mk.bringToFront(); mk.openTooltip(); map.current?.panTo(mk.getLatLng()); }
    }
  }, [selected, results]);

  return <div ref={el} className="h-full w-full" />;
}
