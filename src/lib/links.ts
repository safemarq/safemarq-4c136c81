import { lastCity } from './cities';
import { DEFAULT_VEHICLE, VEHICLES, isTrade, isVehicle, offers, type TradeSlug, type VehicleSlug } from './taxonomy';

/**
 * Ranking URLs. Cars, the bulk of searches, keep the short form:
 *   /carrosserie/namur          car, one trade
 *   /voiture/namur              car, every trade
 *   /moto/entretien/namur       other vehicle, one trade
 *   /moto/namur                 other vehicle, every trade
 * Slugs of vehicles, trades and towns never collide (see taxonomy.test.ts).
 */
export interface RankingTarget {
  vehicle: VehicleSlug;
  trade: TradeSlug | null;
  city: string;
}

export function rankingPath({ vehicle, trade, city }: RankingTarget): string {
  if (trade && vehicle === DEFAULT_VEHICLE) return `/${trade}/${city}`;
  return trade ? `/${vehicle}/${trade}/${city}` : `/${vehicle}/${city}`;
}

export type ParsedRanking = { kind: 'ok'; target: RankingTarget } | { kind: 'redirect'; to: string } | { kind: 'none' };

/** Reads /:a/:b and /:a/:b/:c; points old or odd forms to the canonical URL. */
export function parseRankingPath(a?: string, b?: string, c?: string): ParsedRanking {
  if (!a || !b) return { kind: 'none' };
  if (!c) {
    if (isVehicle(a)) return { kind: 'ok', target: { vehicle: a, trade: null, city: b } };
    if (!isTrade(a)) return { kind: 'none' };
    if (offers(DEFAULT_VEHICLE, a)) return { kind: 'ok', target: { vehicle: DEFAULT_VEHICLE, trade: a, city: b } };
    // A trade cars don't have (/carenage/namur): send to the vehicle that has it.
    const vehicle = VEHICLES.find((v) => offers(v, a));
    return vehicle ? { kind: 'redirect', to: rankingPath({ vehicle, trade: a, city: b }) } : { kind: 'none' };
  }
  if (!isVehicle(a) || !offers(a, b)) return { kind: 'none' };
  if (a === DEFAULT_VEHICLE) return { kind: 'redirect', to: rankingPath({ vehicle: a, trade: b, city: c }) };
  return { kind: 'ok', target: { vehicle: a, trade: b, city: c } };
}

/** The home search, preset to a vehicle (and trade). */
export function searchHref(vehicle: VehicleSlug, trade?: TradeSlug | null): string {
  const params = new URLSearchParams();
  if (vehicle !== DEFAULT_VEHICLE) params.set('vehicule', vehicle);
  if (trade) params.set('metier', trade);
  const qs = params.toString();
  return `/${qs ? `?${qs}` : ''}#recherche`;
}

/** Straight to the ranking when we know the person's town, else to the search. */
export function tradeHref(trade: TradeSlug, vehicle: VehicleSlug = DEFAULT_VEHICLE): string {
  const city = lastCity();
  return city ? rankingPath({ vehicle, trade, city: city.slug }) : searchHref(vehicle, trade);
}

export function vehicleHref(vehicle: VehicleSlug): string {
  const city = lastCity();
  return city ? rankingPath({ vehicle, trade: null, city: city.slug }) : searchHref(vehicle);
}

/** /marques/bmw (whole country) and /marques/bmw/namur (one town). */
export const makePath = (make: string, city?: string | null): string => (city ? `/marques/${make}/${city}` : `/marques/${make}`);

/** /outillage/hunter; ?ville= narrows it to one town (not a separate page for search engines). */
export const toolPath = (brand: string, city?: string | null): string =>
  city ? `/outillage/${brand}?ville=${encodeURIComponent(city)}` : `/outillage/${brand}`;

export const blogPath = (slug: string): string => `/blog/${slug}`;

/** The search page (/recherche) with filters preset. Defaults are left out of the URL. */
export function searchPageHref(target: Partial<RankingTarget> & { radiusKm?: number }): string {
  const params = new URLSearchParams();
  if (target.vehicle && target.vehicle !== DEFAULT_VEHICLE) params.set('vehicule', target.vehicle);
  if (target.trade) params.set('metier', target.trade);
  if (target.city) params.set('ville', target.city);
  if (target.radiusKm) params.set('rayon', String(target.radiusKm));
  const qs = params.toString();
  return `/recherche${qs ? `?${qs}` : ''}`;
}
