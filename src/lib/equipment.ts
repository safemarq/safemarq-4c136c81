/**
 * Workshop equipment: the kinds of machine a garage can have, and the brands
 * that make them. Source of truth for /outillage; the database mirrors the
 * brand slugs (table tool_brands) so garages can say what they work with.
 */
export const EQUIPMENT_KINDS = ['diagnostic', 'geometrie', 'pneus', 'clim', 'freinage', 'levage', 'carrosserie', 'outillage'] as const;
export type EquipmentKind = (typeof EQUIPMENT_KINDS)[number];

export interface ToolBrand {
  slug: string;
  name: string;
  kinds: readonly EquipmentKind[];
}

export const TOOL_BRANDS: readonly ToolBrand[] = [
  { slug: 'autel', name: 'Autel', kinds: ['diagnostic'] },
  { slug: 'beissbarth', name: 'Beissbarth', kinds: ['geometrie', 'pneus', 'freinage'] },
  { slug: 'beta', name: 'Beta', kinds: ['outillage'] },
  { slug: 'bosch', name: 'Bosch', kinds: ['diagnostic', 'clim', 'freinage'] },
  { slug: 'car-o-liner', name: 'Car-O-Liner', kinds: ['carrosserie'] },
  { slug: 'celette', name: 'Celette', kinds: ['carrosserie'] },
  { slug: 'corghi', name: 'Corghi', kinds: ['pneus', 'geometrie'] },
  { slug: 'delphi', name: 'Delphi', kinds: ['diagnostic'] },
  { slug: 'facom', name: 'Facom', kinds: ['outillage'] },
  { slug: 'gedore', name: 'Gedore', kinds: ['outillage'] },
  { slug: 'glasurit', name: 'Glasurit', kinds: ['carrosserie'] },
  { slug: 'hazet', name: 'Hazet', kinds: ['outillage'] },
  { slug: 'hella-gutmann', name: 'Hella Gutmann', kinds: ['diagnostic', 'geometrie'] },
  { slug: 'hofmann', name: 'Hofmann', kinds: ['pneus', 'geometrie'] },
  { slug: 'hunter', name: 'Hunter', kinds: ['geometrie', 'pneus'] },
  { slug: 'john-bean', name: 'John Bean', kinds: ['geometrie', 'pneus'] },
  { slug: 'ks-tools', name: 'KS Tools', kinds: ['outillage'] },
  { slug: 'launch', name: 'Launch', kinds: ['diagnostic'] },
  { slug: 'maha', name: 'Maha', kinds: ['freinage', 'levage'] },
  { slug: 'mahle', name: 'Mahle', kinds: ['clim', 'diagnostic'] },
  { slug: 'nussbaum', name: 'Nussbaum', kinds: ['levage'] },
  { slug: 'ravaglioli', name: 'Ravaglioli', kinds: ['levage', 'pneus', 'geometrie'] },
  { slug: 'sikkens', name: 'Sikkens', kinds: ['carrosserie'] },
  { slug: 'snap-on', name: 'Snap-on', kinds: ['outillage', 'diagnostic'] },
  { slug: 'spanesi', name: 'Spanesi', kinds: ['carrosserie'] },
  { slug: 'stahlwille', name: 'Stahlwille', kinds: ['outillage'] },
  { slug: 'standox', name: 'Standox', kinds: ['carrosserie'] },
  { slug: 'texa', name: 'Texa', kinds: ['diagnostic', 'clim'] },
  { slug: 'wurth', name: 'Würth', kinds: ['outillage'] },
];

const BY_SLUG = new Map(TOOL_BRANDS.map((b) => [b.slug, b]));

export const getToolBrand = (slug?: string | null): ToolBrand | undefined => (slug ? BY_SLUG.get(slug) : undefined);

/** Brands of one kind of equipment, alphabetical. */
export const brandsOfKind = (kind: EquipmentKind): ToolBrand[] =>
  TOOL_BRANDS.filter((b) => b.kinds.includes(kind)).sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));
