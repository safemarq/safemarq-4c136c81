import { lastCity } from './cities';

/** Straight to the ranking when we know the person's town, else to the search. */
export function tradeHref(slug: string): string {
  const city = lastCity();
  return city ? `/${slug}/${city.slug}` : `/?metier=${slug}#recherche`;
}
