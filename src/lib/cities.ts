export interface City {
  slug: string;
  name: string;
  province: string;
}

export const CITIES: City[] = [
  { slug: 'bruxelles', name: 'Bruxelles', province: 'Bruxelles-Capitale' },
  { slug: 'anvers', name: 'Anvers', province: 'Anvers' },
  { slug: 'gand', name: 'Gand', province: 'Flandre-Orientale' },
  { slug: 'liege', name: 'Liège', province: 'Liège' },
  { slug: 'namur', name: 'Namur', province: 'Namur' },
  { slug: 'charleroi', name: 'Charleroi', province: 'Hainaut' },
  { slug: 'bruges', name: 'Bruges', province: 'Flandre-Occidentale' },
  { slug: 'louvain', name: 'Louvain', province: 'Brabant flamand' },
  { slug: 'mons', name: 'Mons', province: 'Hainaut' },
  { slug: 'malines', name: 'Malines', province: 'Anvers' },
  { slug: 'hasselt', name: 'Hasselt', province: 'Limbourg' },
  { slug: 'wavre', name: 'Wavre', province: 'Brabant wallon' },
  { slug: 'tournai', name: 'Tournai', province: 'Hainaut' },
  { slug: 'verviers', name: 'Verviers', province: 'Liège' },
  { slug: 'ostende', name: 'Ostende', province: 'Flandre-Occidentale' },
  { slug: 'courtrai', name: 'Courtrai', province: 'Flandre-Occidentale' },
  { slug: 'genk', name: 'Genk', province: 'Limbourg' },
  { slug: 'la-louviere', name: 'La Louvière', province: 'Hainaut' },
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
