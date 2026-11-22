// Hand-curated "reasons to fly": interest tags and nearby attractions, keyed by airport ident.
// Airport facts (name, location, runway) come from the OurAirports CSVs via src/lib/airports.ts.
// Attractions are well-known real places with approximate ground distances.
import type { Attraction, Interest } from "./airports";

const a = (name: string, type: Interest, distanceMi: number, note?: string): Attraction => ({ name, type, distanceMi, ...(note ? { note } : {}) });

export const CURATION: Record<string, { interests: Interest[]; attractions: Attraction[] }> = {
  KFDK: { interests: ["cities", "restaurants"], attractions: [a("Downtown Frederick", "cities", 2.5, "Historic district, Carroll Creek"), a("Airport Café", "restaurants", 0.1)] },
  KESN: { interests: ["restaurants", "cities"], attractions: [a("Historic Downtown Easton", "cities", 2.5), a("Chesapeake Bay Maritime Museum (St. Michaels)", "museums", 11)] },
  KCGE: { interests: ["nature", "restaurants"], attractions: [a("Blackwater National Wildlife Refuge", "nature", 10), a("Downtown Cambridge waterfront", "restaurants", 3), a("Harriet Tubman Underground Railroad Visitor Center", "museums", 12)] },
  W29: { interests: ["restaurants", "scenic"], attractions: [a("Kent Narrows waterfront restaurants", "restaurants", 3), a("Chesapeake Bay Bridge views", "scenic", 1)] },
  KOXB: { interests: ["beaches", "restaurants", "scenic"], attractions: [a("Ocean City Boardwalk & Beach", "beaches", 3), a("Assateague Island National Seashore", "nature", 9, "Wild horses")] },
  KGED: { interests: ["restaurants", "beaches"], attractions: [a("Arena's Deli (on field)", "restaurants", 0.1), a("Rehoboth Beach", "beaches", 16)] },
  KMIV: { interests: ["museums", "restaurants"], attractions: [a("Millville Army Air Field Museum", "museums", 0.3), a("Wheaton Arts glass village", "museums", 3)] },
  KWWD: { interests: ["museums", "beaches", "restaurants"], attractions: [a("Naval Air Station Wildwood Aviation Museum", "museums", 0.2), a("Wildwood Beach & Boardwalk", "beaches", 4), a("Victorian Cape May", "cities", 6)] },
  KACY: { interests: ["cities", "beaches"], attractions: [a("Atlantic City Boardwalk", "beaches", 10), a("Historic Smithville", "cities", 6)] },
  KN14: { interests: ["restaurants", "scenic"], attractions: [a("Flying W restaurant & pool (on field)", "restaurants", 0.1)] },
  KCJR: { interests: ["restaurants", "cities"], attractions: [a("Downtown Culpeper", "restaurants", 3), a("Old House Vineyards", "restaurants", 4)] },
  KW45: { interests: ["nature", "scenic"], attractions: [a("Luray Caverns", "nature", 3), a("Shenandoah National Park", "nature", 8), a("Car & Carriage Caravan Museum", "museums", 3)] },
  KOKV: { interests: ["cities", "museums"], attractions: [a("Old Town Winchester walking mall", "cities", 3), a("Museum of the Shenandoah Valley", "museums", 4)] },
  KJYO: { interests: ["cities", "restaurants"], attractions: [a("Historic Downtown Leesburg", "cities", 1.5), a("Morven Park", "museums", 3)] },
  KHEF: { interests: ["museums", "cities"], attractions: [a("Old Town Manassas", "cities", 3), a("Manassas National Battlefield Park", "museums", 7)] },
  KCHO: { interests: ["cities", "museums", "restaurants"], attractions: [a("Downtown Mall", "cities", 8), a("Monticello", "museums", 11), a("University of Virginia", "cities", 8)] },
  KHSP: { interests: ["scenic", "nature", "restaurants"], attractions: [a("The Omni Homestead Resort", "restaurants", 4), a("Allegheny Mountain ridgetop runway", "scenic", 0)] },
  KLNS: { interests: ["restaurants", "cities"], attractions: [a("Fiorentino's (on field)", "restaurants", 0.1), a("Downtown Lititz", "cities", 3), a("Lancaster Central Market", "cities", 6)] },
  KRDG: { interests: ["museums", "restaurants"], attractions: [a("Mid-Atlantic Air Museum", "museums", 0.3), a("Klein's Café (on field)", "restaurants", 0.1)] },
  KMQS: { interests: ["restaurants", "nature"], attractions: [a("Flyers Restaurant (on field)", "restaurants", 0.1), a("Longwood Gardens", "nature", 15)] },
  KHGR: { interests: ["museums"], attractions: [a("Hagerstown Aviation Museum", "museums", 0.5), a("Antietam National Battlefield", "museums", 12)] },
  KCBE: { interests: ["scenic", "nature"], attractions: [a("C&O Canal National Historical Park", "nature", 4), a("Western Maryland Scenic Railroad", "scenic", 4)] },
  K2G4: { interests: ["nature", "scenic"], attractions: [a("Deep Creek Lake", "nature", 4), a("Swallow Falls State Park", "nature", 9)] },
  KMTN: { interests: ["museums", "cities"], attractions: [a("Glenn L. Martin Maryland Aviation Museum", "museums", 0.5), a("Baltimore Inner Harbor", "cities", 12)] },
  KCGS: { interests: ["museums"], attractions: [a("College Park Aviation Museum (on field)", "museums", 0.1), a("University of Maryland", "cities", 1.5)] },
  KPNE: { interests: ["cities", "museums", "restaurants"], attractions: [a("Center City Philadelphia", "cities", 12), a("Independence Hall", "museums", 13)] },
  KJGG: { interests: ["museums", "cities", "restaurants"], attractions: [a("Colonial Williamsburg", "museums", 3), a("Historic Jamestowne", "museums", 4)] },
  KTGI: { interests: ["scenic", "restaurants", "beaches"], attractions: [a("Tangier village crab-cake spots", "restaurants", 0.4), a("Tangier Island beach", "beaches", 1)] },
  KFFA: { interests: ["museums", "beaches", "scenic"], attractions: [a("Wright Brothers National Memorial", "museums", 0.2), a("Outer Banks beaches", "beaches", 1)] },
  KMQI: { interests: ["cities", "beaches", "museums"], attractions: [a("Manteo waterfront", "cities", 2), a("Roanoke Island Festival Park", "museums", 2), a("Jockey's Ridge State Park", "nature", 8)] },
  KFRR: { interests: ["nature", "scenic"], attractions: [a("Skyline Drive north entrance", "nature", 4), a("Skyline Caverns", "nature", 4)] },
  KW99: { interests: ["nature", "scenic"], attractions: [a("Seneca Rocks", "nature", 20), a("Smoke Hole Canyon", "nature", 10)] },
  KEKN: { interests: ["nature", "scenic"], attractions: [a("Monongahela National Forest", "nature", 5), a("Downtown Elkins", "cities", 2)] },
  KMPO: { interests: ["nature", "scenic"], attractions: [a("Pocono Mountains trails", "nature", 3), a("Delaware Water Gap", "nature", 18)] },
  KUNV: { interests: ["cities", "restaurants"], attractions: [a("Penn State campus & downtown", "cities", 4), a("Penn State Berkey Creamery", "restaurants", 3)] },
};
