import type { Locale } from '@/i18n/config';

/**
 * Belgian towns. Two layers:
 * - CITIES: the 18 big towns used in menus and the footer, available at once;
 * - loadPlaces(): every locality with a postal code (~2 800, GeoNames CC BY 4.0),
 *   a separate ~50 kB chunk fetched the first time someone searches.
 * Slugs come from the French name, like every other URL on the site.
 */

export type Region = 'brussels' | 'wallonia' | 'flanders';

export interface City {
  slug: string;
  /** Local name (Antwerpen, Liège, Sankt Vith). */
  name: string;
  /** Names in the site languages when they differ from the local one. */
  names: Partial<Record<Locale, string>>;
  zips: string[];
  lat: number;
  lng: number;
  region: Region;
}

export const CITIES: City[] = [
  { slug: 'bruxelles', name: 'Bruxelles', names: { nl: 'Brussel', de: 'Brüssel', en: 'Brussels' }, zips: ['1000'], lat: 50.8504, lng: 4.3488, region: 'brussels' },
  { slug: 'anvers', name: 'Antwerpen', names: { fr: 'Anvers', en: 'Antwerp' }, zips: ['2000', '2018', '2020', '2030', '2040', '2050', '2060'], lat: 51.2199, lng: 4.4035, region: 'flanders' },
  { slug: 'gand', name: 'Gent', names: { fr: 'Gand', en: 'Ghent' }, zips: ['9000'], lat: 51.05, lng: 3.7167, region: 'flanders' },
  { slug: 'liege', name: 'Liège', names: { nl: 'Luik', de: 'Lüttich' }, zips: ['4000', '4020'], lat: 50.6337, lng: 5.5675, region: 'wallonia' },
  { slug: 'namur', name: 'Namur', names: { nl: 'Namen' }, zips: ['5000'], lat: 50.4669, lng: 4.8675, region: 'wallonia' },
  { slug: 'charleroi', name: 'Charleroi', names: {}, zips: ['6000'], lat: 50.4114, lng: 4.4445, region: 'wallonia' },
  { slug: 'bruges', name: 'Brugge', names: { fr: 'Bruges', de: 'Brügge', en: 'Bruges' }, zips: ['8000'], lat: 51.2089, lng: 3.2242, region: 'flanders' },
  { slug: 'louvain', name: 'Leuven', names: { fr: 'Louvain', de: 'Löwen' }, zips: ['3000'], lat: 50.8796, lng: 4.7009, region: 'flanders' },
  { slug: 'mons', name: 'Mons', names: { nl: 'Bergen' }, zips: ['7000'], lat: 50.4541, lng: 3.9523, region: 'wallonia' },
  { slug: 'malines', name: 'Mechelen', names: { fr: 'Malines', de: 'Mecheln' }, zips: ['2800'], lat: 51.0257, lng: 4.4776, region: 'flanders' },
  { slug: 'hasselt', name: 'Hasselt', names: {}, zips: ['3500'], lat: 50.9311, lng: 5.3378, region: 'flanders' },
  { slug: 'wavre', name: 'Wavre', names: { nl: 'Waver' }, zips: ['1300'], lat: 50.7172, lng: 4.6014, region: 'wallonia' },
  { slug: 'tournai', name: 'Tournai', names: { nl: 'Doornik' }, zips: ['7500'], lat: 50.6071, lng: 3.3893, region: 'wallonia' },
  { slug: 'verviers', name: 'Verviers', names: {}, zips: ['4800'], lat: 50.5891, lng: 5.8624, region: 'wallonia' },
  { slug: 'ostende', name: 'Oostende', names: { fr: 'Ostende', de: 'Ostende', en: 'Ostend' }, zips: ['8400'], lat: 51.2155, lng: 2.927, region: 'flanders' },
  { slug: 'courtrai', name: 'Kortrijk', names: { fr: 'Courtrai' }, zips: ['8500'], lat: 50.828, lng: 3.2649, region: 'flanders' },
  { slug: 'genk', name: 'Genk', names: {}, zips: ['3600'], lat: 50.965, lng: 5.5008, region: 'flanders' },
  { slug: 'la-louviere', name: 'La Louvière', names: {}, zips: ['7100'], lat: 50.4866, lng: 4.1879, region: 'wallonia' },
];

const FEATURED = new Map(CITIES.map((c) => [c.slug, c]));

/** One of the 18 featured towns (synchronous). */
export const getCity = (slug?: string | null): City | undefined => (slug ? FEATURED.get(slug) : undefined);

export const slugifyCity = (name: string): string =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export const fold = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’']/g, ' ')
    .trim();

/** The town's name in the visitor's language (Anvers / Antwerpen / Antwerp). */
export function cityName(city: City | string, locale: Locale): string {
  const c = typeof city === 'string' ? getCity(city) : city;
  if (!c) return typeof city === 'string' ? city : '';
  return c.names[locale] ?? c.name;
}

/** Every name a person might type for a town. */
export const cityAliases = (c: City): string[] => [...new Set([c.name, ...Object.values(c.names)])];

const distance2 = (a: { lat: number; lng: number }, lat: number, lng: number) => {
  // Equirectangular distance is plenty at the scale of Belgium.
  const k = Math.cos((lat * Math.PI) / 180);
  return (a.lat - lat) ** 2 + ((a.lng - lng) * k) ** 2;
};

export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  return Math.sqrt(distance2(a, b.lat, b.lng)) * 111.2;
}

/** Featured towns closest to `from`, nearest first (for "try a nearby town"). */
export function nearbyCities(from: City, count = 3): City[] {
  return CITIES.filter((c) => c.slug !== from.slug)
    .map((c) => ({ c, d: distance2(c, from.lat, from.lng) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, count)
    .map((x) => x.c);
}

// ---------------------------------------------------------------------------
// Every locality, loaded on demand
// ---------------------------------------------------------------------------

type Row = [slug: string, name: string, zips: string, lat: number, lng: number, region: 'b' | 'w' | 'f', names: City['names'] | 0, main: 0 | 1];
const REGIONS = { b: 'brussels', w: 'wallonia', f: 'flanders' } as const;

interface Entry {
  city: City;
  folded: string[];
  featured: boolean;
  /** The locality people mean by its postal code (Jambes for 5100). */
  main: boolean;
}

export class PlaceIndex {
  readonly all: City[];
  private readonly bySlug: Map<string, City>;
  private readonly entries: Entry[];

  constructor(rows: Row[]) {
    this.all = rows.map(([slug, name, zips, lat, lng, region, names]) => {
      // Reuse the featured objects so both layers agree on names and coordinates.
      return FEATURED.get(slug) ?? { slug, name, names: names || {}, zips: zips.split(' '), lat, lng, region: REGIONS[region] };
    });
    this.bySlug = new Map(this.all.map((c) => [c.slug, c]));
    this.entries = this.all.map((city, i) => ({
      city,
      folded: cityAliases(city).map(fold),
      featured: FEATURED.has(city.slug),
      main: rows[i][7] === 1,
    }));
  }

  get(slug: string | undefined | null): City | undefined {
    return slug ? this.bySlug.get(slug) : undefined;
  }

  /** Name (any language, start of a word first) or postal code (prefix). */
  search(query: string, limit = 8): City[] {
    const q = fold(query);
    if (!q) return [];
    if (/^\d{1,4}$/.test(q)) {
      return this.entries
        .filter((e) => e.city.zips.some((z) => z.startsWith(q)))
        .sort(
          (a, b) =>
            Number(b.featured) - Number(a.featured) ||
            Number(b.main) - Number(a.main) ||
            a.city.zips[0].localeCompare(b.city.zips[0]),
        )
        .slice(0, limit)
        .map((e) => e.city);
    }
    const scored: { e: Entry; s: number }[] = [];
    for (const e of this.entries) {
      let s = Infinity;
      for (const n of e.folded) {
        if (n === q) s = Math.min(s, 0);
        else if (n.startsWith(q)) s = Math.min(s, 1);
        else if (n.includes(` ${q}`) || n.includes(`-${q}`)) s = Math.min(s, 2);
        else if (q.length >= 3 && n.includes(q)) s = Math.min(s, 3);
      }
      if (s < Infinity) scored.push({ e, s: s - (e.featured ? 0.5 : 0) - Math.min(e.city.zips.length, 4) * 0.05 });
    }
    return scored
      .sort((a, b) => a.s - b.s || a.e.city.name.length - b.e.city.name.length)
      .slice(0, limit)
      .map((x) => x.e.city);
  }

  /** What the person typed, if it designates one place clearly; null otherwise. */
  resolve(input: string): City | null {
    const q = fold(input);
    if (!q) return null;
    const bySlug = this.bySlug.get(slugifyCity(input));
    if (bySlug) return bySlug;
    if (/^\d{4}$/.test(q)) return this.search(q, 1)[0] ?? null;
    const first = this.search(input, 1)[0];
    // A prefix ("nam", "luik") is clear enough; a mere substring is not.
    return first && cityAliases(first).some((n) => fold(n).startsWith(q)) ? first : null;
  }

  nearest(lat: number, lng: number): City {
    let best = this.all[0];
    let bestD = Infinity;
    for (const c of this.all) {
      const d = distance2(c, lat, lng);
      if (d < bestD) {
        bestD = d;
        best = c;
      }
    }
    return best;
  }
}

let loading: Promise<PlaceIndex> | null = null;

export function loadPlaces(): Promise<PlaceIndex> {
  loading ??= import('@/data/be-places.json')
    .then((m) => new PlaceIndex(m.default as unknown as Row[]))
    .catch((err) => {
      loading = null; // allow a retry after a network hiccup
      throw err;
    });
  return loading;
}

// ---------------------------------------------------------------------------
// The visitor's town, remembered between visits
// ---------------------------------------------------------------------------

const LAST_CITY_KEY = 'safemarq-last-city';

export function rememberCity(city: City): void {
  try {
    localStorage.setItem(LAST_CITY_KEY, JSON.stringify(city));
  } catch {
    /* storage blocked */
  }
}

export function lastCity(): City | null {
  try {
    const raw = localStorage.getItem(LAST_CITY_KEY);
    if (!raw) return null;
    if (!raw.startsWith('{')) return getCity(raw) ?? null; // older versions stored the slug only
    const c = JSON.parse(raw) as Partial<City>;
    if (typeof c.slug !== 'string' || typeof c.lat !== 'number' || typeof c.lng !== 'number' || typeof c.name !== 'string') return null;
    return getCity(c.slug) ?? { slug: c.slug, name: c.name, names: c.names ?? {}, zips: c.zips ?? [], lat: c.lat, lng: c.lng, region: c.region ?? 'wallonia' };
  } catch {
    return null;
  }
}
