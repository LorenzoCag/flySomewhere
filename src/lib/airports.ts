// Curated Mid-Atlantic GA airports. Coordinates, identifiers and longest runway from FAA airport data;
// attractions are well-known real places with approximate ground distances.
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
  runwayFt: number; interests: Interest[]; attractions: Attraction[];
};

const a = (name: string, type: Interest, distanceMi: number, note?: string): Attraction => ({ name, type, distanceMi, ...(note ? { note } : {}) });

export const AIRPORTS: Airport[] = [
  { id: "KFDK", name: "Frederick Municipal", city: "Frederick", state: "MD", lat: 39.4176, lon: -77.3743, runwayFt: 5220, interests: ["cities", "restaurants"], attractions: [a("Downtown Frederick", "cities", 2.5, "Historic district, Carroll Creek"), a("Airport Café", "restaurants", 0.1)] },
  { id: "KESN", name: "Easton / Newnam Field", city: "Easton", state: "MD", lat: 38.8042, lon: -76.069, runwayFt: 5500, interests: ["restaurants", "cities"], attractions: [a("Historic Downtown Easton", "cities", 2.5), a("Chesapeake Bay Maritime Museum (St. Michaels)", "museums", 11)] },
  { id: "KCGE", name: "Cambridge-Dorchester Regional", city: "Cambridge", state: "MD", lat: 38.5393, lon: -76.0304, runwayFt: 4477, interests: ["nature", "restaurants"], attractions: [a("Blackwater National Wildlife Refuge", "nature", 10), a("Downtown Cambridge waterfront", "restaurants", 3), a("Harriet Tubman Underground Railroad Visitor Center", "museums", 12)] },
  { id: "W29", name: "Bay Bridge", city: "Stevensville", state: "MD", lat: 38.9764, lon: -76.33, runwayFt: 2913, interests: ["restaurants", "scenic"], attractions: [a("Kent Narrows waterfront restaurants", "restaurants", 3), a("Chesapeake Bay Bridge views", "scenic", 1)] },
  { id: "KOXB", name: "Ocean City Municipal", city: "Ocean City", state: "MD", lat: 38.3104, lon: -75.1239, runwayFt: 4074, interests: ["beaches", "restaurants", "scenic"], attractions: [a("Ocean City Boardwalk & Beach", "beaches", 3), a("Assateague Island National Seashore", "nature", 9, "Wild horses")] },
  { id: "KGED", name: "Delaware Coastal", city: "Georgetown", state: "DE", lat: 38.6892, lon: -75.3589, runwayFt: 5500, interests: ["restaurants", "beaches"], attractions: [a("Arena's Deli (on field)", "restaurants", 0.1), a("Rehoboth Beach", "beaches", 16)] },
  { id: "KMIV", name: "Millville Municipal", city: "Millville", state: "NJ", lat: 39.3678, lon: -75.0722, runwayFt: 6002, interests: ["museums", "restaurants"], attractions: [a("Millville Army Air Field Museum", "museums", 0.3), a("Wheaton Arts glass village", "museums", 3)] },
  { id: "KWWD", name: "Cape May County", city: "Wildwood", state: "NJ", lat: 38.949, lon: -74.896, runwayFt: 4998, interests: ["museums", "beaches", "restaurants"], attractions: [a("Naval Air Station Wildwood Aviation Museum", "museums", 0.2), a("Wildwood Beach & Boardwalk", "beaches", 4), a("Victorian Cape May", "cities", 6)] },
  { id: "KACY", name: "Atlantic City International", city: "Atlantic City", state: "NJ", lat: 39.4576, lon: -74.5772, runwayFt: 10000, interests: ["cities", "beaches"], attractions: [a("Atlantic City Boardwalk", "beaches", 10), a("Historic Smithville", "cities", 6)] },
  { id: "N14", name: "Flying W", city: "Lumberton", state: "NJ", lat: 39.9343, lon: -74.8069, runwayFt: 3496, interests: ["restaurants", "scenic"], attractions: [a("Flying W restaurant & pool (on field)", "restaurants", 0.1)] },
  { id: "KCJR", name: "Culpeper Regional", city: "Culpeper", state: "VA", lat: 38.5267, lon: -77.8589, runwayFt: 5000, interests: ["restaurants", "cities"], attractions: [a("Downtown Culpeper", "restaurants", 3), a("Old House Vineyards", "restaurants", 4)] },
  { id: "KLUA", name: "Luray Caverns", city: "Luray", state: "VA", lat: 38.6671, lon: -78.5006, runwayFt: 3125, interests: ["nature", "scenic"], attractions: [a("Luray Caverns", "nature", 3), a("Shenandoah National Park", "nature", 8), a("Car & Carriage Caravan Museum", "museums", 3)] },
  { id: "KOKV", name: "Winchester Regional", city: "Winchester", state: "VA", lat: 39.1435, lon: -78.1444, runwayFt: 5498, interests: ["cities", "museums"], attractions: [a("Old Town Winchester walking mall", "cities", 3), a("Museum of the Shenandoah Valley", "museums", 4)] },
  { id: "KJYO", name: "Leesburg Executive", city: "Leesburg", state: "VA", lat: 39.078, lon: -77.5575, runwayFt: 5500, interests: ["cities", "restaurants"], attractions: [a("Historic Downtown Leesburg", "cities", 1.5), a("Morven Park", "museums", 3)] },
  { id: "KHEF", name: "Manassas Regional", city: "Manassas", state: "VA", lat: 38.7214, lon: -77.5154, runwayFt: 6200, interests: ["museums", "cities"], attractions: [a("Old Town Manassas", "cities", 3), a("Manassas National Battlefield Park", "museums", 7)] },
  { id: "KCHO", name: "Charlottesville-Albemarle", city: "Charlottesville", state: "VA", lat: 38.1386, lon: -78.4529, runwayFt: 6801, interests: ["cities", "museums", "restaurants"], attractions: [a("Downtown Mall", "cities", 8), a("Monticello", "museums", 11), a("University of Virginia", "cities", 8)] },
  { id: "KHSP", name: "Ingalls Field", city: "Hot Springs", state: "VA", lat: 37.9514, lon: -79.8339, runwayFt: 5600, interests: ["scenic", "nature", "restaurants"], attractions: [a("The Omni Homestead Resort", "restaurants", 4), a("Allegheny Mountain ridgetop runway", "scenic", 0)] },
  { id: "KLNS", name: "Lancaster", city: "Lititz", state: "PA", lat: 40.1217, lon: -76.2961, runwayFt: 6934, interests: ["restaurants", "cities"], attractions: [a("Fiorentino's (on field)", "restaurants", 0.1), a("Downtown Lititz", "cities", 3), a("Lancaster Central Market", "cities", 6)] },
  { id: "KRDG", name: "Reading Regional", city: "Reading", state: "PA", lat: 40.3785, lon: -75.9652, runwayFt: 6350, interests: ["museums", "restaurants"], attractions: [a("Mid-Atlantic Air Museum", "museums", 0.3), a("Klein's Café (on field)", "restaurants", 0.1)] },
  { id: "KMQS", name: "Chester County G.O. Carlson", city: "Coatesville", state: "PA", lat: 39.979, lon: -75.8655, runwayFt: 5400, interests: ["restaurants", "nature"], attractions: [a("Flyers Restaurant (on field)", "restaurants", 0.1), a("Longwood Gardens", "nature", 15)] },
  { id: "KHGR", name: "Hagerstown Regional", city: "Hagerstown", state: "MD", lat: 39.7079, lon: -77.7295, runwayFt: 7000, interests: ["museums"], attractions: [a("Hagerstown Aviation Museum", "museums", 0.5), a("Antietam National Battlefield", "museums", 12)] },
  { id: "KCBE", name: "Greater Cumberland Regional", city: "Cumberland", state: "MD", lat: 39.6154, lon: -78.7609, runwayFt: 5050, interests: ["scenic", "nature"], attractions: [a("C&O Canal National Historical Park", "nature", 4), a("Western Maryland Scenic Railroad", "scenic", 4)] },
  { id: "2G4", name: "Garrett County", city: "Oakland", state: "MD", lat: 39.5803, lon: -79.3394, runwayFt: 4401, interests: ["nature", "scenic"], attractions: [a("Deep Creek Lake", "nature", 4), a("Swallow Falls State Park", "nature", 9)] },
  { id: "KMTN", name: "Martin State", city: "Baltimore", state: "MD", lat: 39.3257, lon: -76.4138, runwayFt: 6997, interests: ["museums", "cities"], attractions: [a("Glenn L. Martin Maryland Aviation Museum", "museums", 0.5), a("Baltimore Inner Harbor", "cities", 12)] },
  { id: "KCGS", name: "College Park", city: "College Park", state: "MD", lat: 38.9806, lon: -76.9223, runwayFt: 2607, interests: ["museums"], attractions: [a("College Park Aviation Museum (on field)", "museums", 0.1), a("University of Maryland", "cities", 1.5)] },
  { id: "KPNE", name: "Northeast Philadelphia", city: "Philadelphia", state: "PA", lat: 40.0819, lon: -75.0106, runwayFt: 7000, interests: ["cities", "museums", "restaurants"], attractions: [a("Center City Philadelphia", "cities", 12), a("Independence Hall", "museums", 13)] },
  { id: "KJGG", name: "Williamsburg-Jamestown", city: "Williamsburg", state: "VA", lat: 37.2392, lon: -76.7164, runwayFt: 3204, interests: ["museums", "cities", "restaurants"], attractions: [a("Colonial Williamsburg", "museums", 3), a("Historic Jamestowne", "museums", 4)] },
  { id: "KTGI", name: "Tangier Island", city: "Tangier", state: "VA", lat: 37.8251, lon: -75.9977, runwayFt: 2426, interests: ["scenic", "restaurants", "beaches"], attractions: [a("Tangier village crab-cake spots", "restaurants", 0.4), a("Tangier Island beach", "beaches", 1)] },
  { id: "KFFA", name: "First Flight", city: "Kill Devil Hills", state: "NC", lat: 36.0182, lon: -75.6713, runwayFt: 3000, interests: ["museums", "beaches", "scenic"], attractions: [a("Wright Brothers National Memorial", "museums", 0.2), a("Outer Banks beaches", "beaches", 1)] },
  { id: "KMQI", name: "Dare County Regional", city: "Manteo", state: "NC", lat: 35.919, lon: -75.6955, runwayFt: 4305, interests: ["cities", "beaches", "museums"], attractions: [a("Manteo waterfront", "cities", 2), a("Roanoke Island Festival Park", "museums", 2), a("Jockey's Ridge State Park", "nature", 8)] },
  { id: "KFRR", name: "Front Royal-Warren County", city: "Front Royal", state: "VA", lat: 38.9175, lon: -78.2535, runwayFt: 3007, interests: ["nature", "scenic"], attractions: [a("Skyline Drive north entrance", "nature", 4), a("Skyline Caverns", "nature", 4)] },
  { id: "KW99", name: "Grant County", city: "Petersburg", state: "WV", lat: 38.9949, lon: -79.1459, runwayFt: 5000, interests: ["nature", "scenic"], attractions: [a("Seneca Rocks", "nature", 20), a("Smoke Hole Canyon", "nature", 10)] },
  { id: "KEKN", name: "Elkins-Randolph County", city: "Elkins", state: "WV", lat: 38.8894, lon: -79.8571, runwayFt: 5000, interests: ["nature", "scenic"], attractions: [a("Monongahela National Forest", "nature", 5), a("Downtown Elkins", "cities", 2)] },
  { id: "KMPO", name: "Pocono Mountains Municipal", city: "Mount Pocono", state: "PA", lat: 41.1375, lon: -75.3789, runwayFt: 5001, interests: ["nature", "scenic"], attractions: [a("Pocono Mountains trails", "nature", 3), a("Delaware Water Gap", "nature", 18)] },
  { id: "KUNV", name: "University Park", city: "State College", state: "PA", lat: 40.8493, lon: -77.8487, runwayFt: 6701, interests: ["cities", "restaurants"], attractions: [a("Penn State campus & downtown", "cities", 4), a("Penn State Berkey Creamery", "restaurants", 3)] },
];

export function findAirport(q: string): Airport | undefined {
  const s = q.trim().toLowerCase();
  if (!s) return undefined;
  return AIRPORTS.find((x) => x.id.toLowerCase() === s) ??
    AIRPORTS.find((x) => x.name.toLowerCase().includes(s) || x.city.toLowerCase().includes(s));
}
