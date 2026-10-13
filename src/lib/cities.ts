export type Region = 'brussels' | 'wallonia' | 'flanders';

export interface City {
  slug: string;
  name: string;
  province: string;
  region: Region;
  lat: number;
  lng: number;
}

export const CITIES: City[] = [
  { slug: 'bruxelles', name: 'Bruxelles', province: 'Bruxelles-Capitale', region: 'brussels', lat: 50.8503, lng: 4.3517 },
  { slug: 'anvers', name: 'Anvers', province: 'Anvers', region: 'flanders', lat: 51.2194, lng: 4.4025 },
  { slug: 'gand', name: 'Gand', province: 'Flandre-Orientale', region: 'flanders', lat: 51.0543, lng: 3.7174 },
  { slug: 'liege', name: 'Liège', province: 'Liège', region: 'wallonia', lat: 50.6326, lng: 5.5797 },
  { slug: 'namur', name: 'Namur', province: 'Namur', region: 'wallonia', lat: 50.4674, lng: 4.8718 },
  { slug: 'charleroi', name: 'Charleroi', province: 'Hainaut', region: 'wallonia', lat: 50.4108, lng: 4.4446 },
  { slug: 'bruges', name: 'Bruges', province: 'Flandre-Occidentale', region: 'flanders', lat: 51.2093, lng: 3.2247 },
  { slug: 'louvain', name: 'Louvain', province: 'Brabant flamand', region: 'flanders', lat: 50.8798, lng: 4.7005 },
  { slug: 'mons', name: 'Mons', province: 'Hainaut', region: 'wallonia', lat: 50.4542, lng: 3.9567 },
  { slug: 'malines', name: 'Malines', province: 'Anvers', region: 'flanders', lat: 51.0259, lng: 4.4776 },
  { slug: 'hasselt', name: 'Hasselt', province: 'Limbourg', region: 'flanders', lat: 50.9307, lng: 5.3325 },
  { slug: 'wavre', name: 'Wavre', province: 'Brabant wallon', region: 'wallonia', lat: 50.717, lng: 4.6012 },
  { slug: 'tournai', name: 'Tournai', province: 'Hainaut', region: 'wallonia', lat: 50.6056, lng: 3.3878 },
  { slug: 'verviers', name: 'Verviers', province: 'Liège', region: 'wallonia', lat: 50.5891, lng: 5.8622 },
  { slug: 'ostende', name: 'Ostende', province: 'Flandre-Occidentale', region: 'flanders', lat: 51.2154, lng: 2.9286 },
  { slug: 'courtrai', name: 'Courtrai', province: 'Flandre-Occidentale', region: 'flanders', lat: 50.8279, lng: 3.2649 },
  { slug: 'genk', name: 'Genk', province: 'Limbourg', region: 'flanders', lat: 50.965, lng: 5.5 },
  { slug: 'la-louviere', name: 'La Louvière', province: 'Hainaut', region: 'wallonia', lat: 50.4801, lng: 4.1872 },
];

export const CITY_SLUGS = CITIES.map(c => c.slug);
export const getCity = (slug?: string) => CITIES.find(c => c.slug === slug);

export const slugifyCity = (name: string): string =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export const cityFromAddress = (address: string): string | null => {
  if (!address) return null;
  const lower = address.toLowerCase();
  for (const c of CITIES) {
    if (lower.includes(c.name.toLowerCase()) || lower.includes(c.slug)) return c.slug;
  }
  return null;
};

/** Local names where they differ from French (Brussel, Antwerpen, Lüttich…). */
const CITY_NAMES: Record<string, Partial<Record<'nl' | 'de' | 'en', string>>> = {
  bruxelles: { nl: 'Brussel', de: 'Brüssel', en: 'Brussels' },
  anvers: { nl: 'Antwerpen', de: 'Antwerpen', en: 'Antwerp' },
  gand: { nl: 'Gent', de: 'Gent', en: 'Ghent' },
  liege: { nl: 'Luik', de: 'Lüttich' },
  namur: { nl: 'Namen' },
  bruges: { nl: 'Brugge', de: 'Brügge' },
  louvain: { nl: 'Leuven', de: 'Löwen', en: 'Leuven' },
  mons: { nl: 'Bergen' },
  malines: { nl: 'Mechelen', de: 'Mecheln', en: 'Mechelen' },
  wavre: { nl: 'Waver' },
  tournai: { nl: 'Doornik' },
  ostende: { nl: 'Oostende', en: 'Ostend' },
  courtrai: { nl: 'Kortrijk', de: 'Kortrijk', en: 'Kortrijk' },
};

export const cityName = (slug: string, locale: 'fr' | 'nl' | 'de' | 'en'): string => {
  const fr = getCity(slug)?.name ?? slug;
  return locale === 'fr' ? fr : CITY_NAMES[slug]?.[locale] ?? fr;
};

const fold = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

/** Every name a person might type for a city, in the four site languages. */
export function cityAliases(slug: string): string[] {
  const names = new Set<string>([getCity(slug)?.name ?? slug, ...Object.values(CITY_NAMES[slug] ?? {})]);
  return [...names];
}

/** Cities whose name (in any language) starts with, then contains, the query. */
export function searchCities(query: string, limit = 6): City[] {
  const q = fold(query);
  if (!q) return [];
  const starts: City[] = [];
  const contains: City[] = [];
  for (const c of CITIES) {
    const names = cityAliases(c.slug).map(fold);
    if (names.some((n) => n.startsWith(q))) starts.push(c);
    else if (names.some((n) => n.includes(q))) contains.push(c);
  }
  return [...starts, ...contains].slice(0, limit);
}

/** Exact or unambiguous match for what the person typed; null if unknown. */
export function resolveCity(input: string): City | null {
  const q = fold(input);
  if (!q) return null;
  const exact = CITIES.find((c) => c.slug === slugifyCity(input) || cityAliases(c.slug).some((n) => fold(n) === q));
  if (exact) return exact;
  // A prefix ("nam", "luik") is clear enough; a mere substring is not.
  const first = searchCities(input, 1)[0];
  return first && cityAliases(first.slug).some((n) => fold(n).startsWith(q)) ? first : null;
}

export function nearestCity(lat: number, lng: number): City {
  // Equirectangular distance is plenty at the scale of Belgium.
  const k = Math.cos((lat * Math.PI) / 180);
  let best = CITIES[0];
  let bestD = Infinity;
  for (const c of CITIES) {
    const d = ((c.lat - lat) ** 2) + ((c.lng - lng) * k) ** 2;
    if (d < bestD) {
      bestD = d;
      best = c;
    }
  }
  return best;
}

/** Covered towns closest to `slug`, nearest first (for "try a nearby town"). */
export function nearbyCities(slug: string, count = 3): City[] {
  const from = getCity(slug);
  if (!from) return [];
  const k = Math.cos((from.lat * Math.PI) / 180);
  return CITIES.filter((c) => c.slug !== slug)
    .map((c) => ({ c, d: (c.lat - from.lat) ** 2 + ((c.lng - from.lng) * k) ** 2 }))
    .sort((a, b) => a.d - b.d)
    .slice(0, count)
    .map((x) => x.c);
}

const LAST_CITY_KEY = 'safemarq-last-city';

export function rememberCity(slug: string): void {
  try {
    localStorage.setItem(LAST_CITY_KEY, slug);
  } catch {
    /* storage blocked */
  }
}

export function lastCity(): City | null {
  try {
    return getCity(localStorage.getItem(LAST_CITY_KEY) ?? undefined) ?? null;
  } catch {
    return null;
  }
}
