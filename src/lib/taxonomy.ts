/**
 * Vehicles × trades: the single source of truth for what SafeMarq lists.
 * Labels live in the i18n dictionaries; the database mirrors these slugs
 * (tables vehicle_categories, trades, vehicle_trades — see taxonomy.test.ts).
 */

export const VEHICLES = ['voiture', 'moto', 'utilitaire', 'camping-car', 'velo', 'trottinette', 'bateau'] as const;
export type VehicleSlug = (typeof VEHICLES)[number];
export const DEFAULT_VEHICLE: VehicleSlug = 'voiture';

/** Menu groups, by the kind of problem a driver has. */
export const TRADE_GROUPS = ['care', 'electric', 'body', 'road', 'equip', 'services'] as const;
export type TradeGroupId = (typeof TRADE_GROUPS)[number];

/** Every trade, in menu order, with its group. */
const TRADE_TABLE = [
  ['entretien', 'care'],
  ['mecanique', 'care'],
  ['freinage', 'care'],
  ['distribution', 'care'],
  ['embrayage-boite', 'care'],
  ['echappement', 'care'],
  ['suspension', 'care'],
  ['injection-turbo', 'care'],
  ['diagnostic', 'electric'],
  ['electricite', 'electric'],
  ['climatisation', 'electric'],
  ['electrique-hybride', 'electric'],
  ['multimedia', 'electric'],
  ['alarme', 'electric'],
  ['cles', 'electric'],
  ['carrosserie', 'body'],
  ['peinture', 'body'],
  ['debosselage', 'body'],
  ['pare-brise', 'body'],
  ['covering', 'body'],
  ['detailing', 'body'],
  ['lavage', 'body'],
  ['jantes', 'body'],
  ['sellerie', 'body'],
  ['restauration', 'body'],
  ['etancheite', 'body'],
  ['carenage', 'body'],
  ['coque', 'body'],
  ['pneus', 'road'],
  ['geometrie', 'road'],
  ['controle-technique', 'road'],
  ['depannage', 'road'],
  ['preparation-perf', 'equip'],
  ['lpg', 'equip'],
  ['attelage', 'equip'],
  ['amenagement', 'equip'],
  ['tachygraphe', 'equip'],
  ['gaz', 'equip'],
  ['voilerie', 'equip'],
  ['pieces', 'services'],
  ['pieces-occasion', 'services'],
  ['hivernage', 'services'],
] as const satisfies readonly (readonly [string, TradeGroupId])[];

export type TradeSlug = (typeof TRADE_TABLE)[number][0];
export const TRADES: readonly TradeSlug[] = TRADE_TABLE.map(([slug]) => slug);
export const TRADE_GROUP = Object.fromEntries(TRADE_TABLE) as Record<TradeSlug, TradeGroupId>;

/** Which trades make sense for which vehicle (a bike has no timing belt). */
export const VEHICLE_TRADES: Record<VehicleSlug, readonly TradeSlug[]> = {
  voiture: [
    'entretien', 'mecanique', 'freinage', 'distribution', 'embrayage-boite', 'echappement', 'suspension',
    'injection-turbo', 'diagnostic', 'electricite', 'climatisation', 'electrique-hybride', 'multimedia',
    'alarme', 'cles', 'carrosserie', 'peinture', 'debosselage', 'pare-brise', 'covering', 'detailing',
    'lavage', 'jantes', 'sellerie', 'restauration', 'pneus', 'geometrie', 'controle-technique', 'depannage',
    'preparation-perf', 'lpg', 'attelage', 'amenagement', 'pieces', 'pieces-occasion',
  ],
  moto: [
    'entretien', 'mecanique', 'freinage', 'echappement', 'suspension', 'diagnostic', 'electricite',
    'electrique-hybride', 'alarme', 'carrosserie', 'peinture', 'covering', 'detailing', 'sellerie',
    'restauration', 'pneus', 'controle-technique', 'depannage', 'preparation-perf', 'pieces',
    'pieces-occasion', 'hivernage',
  ],
  utilitaire: [
    'entretien', 'mecanique', 'freinage', 'distribution', 'embrayage-boite', 'echappement', 'suspension',
    'injection-turbo', 'diagnostic', 'electricite', 'climatisation', 'electrique-hybride', 'alarme',
    'carrosserie', 'peinture', 'pare-brise', 'covering', 'lavage', 'pneus', 'geometrie', 'controle-technique',
    'depannage', 'attelage', 'amenagement', 'tachygraphe', 'pieces', 'pieces-occasion',
  ],
  'camping-car': [
    'entretien', 'mecanique', 'freinage', 'distribution', 'embrayage-boite', 'suspension', 'diagnostic',
    'electricite', 'climatisation', 'multimedia', 'alarme', 'carrosserie', 'peinture', 'pare-brise',
    'etancheite', 'sellerie', 'lavage', 'pneus', 'controle-technique', 'depannage', 'attelage',
    'amenagement', 'gaz', 'pieces', 'hivernage',
  ],
  velo: ['entretien', 'mecanique', 'freinage', 'suspension', 'diagnostic', 'electricite', 'pneus', 'depannage', 'pieces'],
  trottinette: ['entretien', 'mecanique', 'freinage', 'diagnostic', 'electricite', 'pneus', 'pieces'],
  bateau: [
    'entretien', 'mecanique', 'electricite', 'detailing', 'sellerie', 'carenage', 'coque', 'depannage',
    'voilerie', 'pieces', 'hivernage',
  ],
};

/** Tabs above the search box: the four jobs people ask for most, per vehicle. */
export const FEATURED_TRADES: Record<VehicleSlug, readonly [TradeSlug, TradeSlug, TradeSlug, TradeSlug]> = {
  voiture: ['entretien', 'carrosserie', 'pneus', 'controle-technique'],
  moto: ['entretien', 'mecanique', 'pneus', 'hivernage'],
  utilitaire: ['entretien', 'mecanique', 'pneus', 'tachygraphe'],
  'camping-car': ['entretien', 'etancheite', 'carrosserie', 'hivernage'],
  velo: ['entretien', 'mecanique', 'electricite', 'freinage'],
  trottinette: ['mecanique', 'electricite', 'pneus', 'freinage'],
  bateau: ['entretien', 'mecanique', 'carenage', 'hivernage'],
};

/**
 * Trades whose name changes with the vehicle ("Réparation" for a bike rather
 * than "Mécanique générale"). The i18n dictionaries hold the words under
 * tradeOverrides.<vehicle>.<trade>; this list keeps the lookup typed.
 */
export const TRADE_OVERRIDES = {
  moto: ['carrosserie'],
  'camping-car': ['electricite'],
  velo: ['entretien', 'mecanique', 'electricite', 'suspension'],
  trottinette: ['entretien', 'mecanique', 'electricite'],
  bateau: ['entretien', 'mecanique', 'electricite', 'depannage'],
} as const satisfies Partial<Record<VehicleSlug, readonly TradeSlug[]>>;

const VEHICLE_SET = new Set<string>(VEHICLES);
const TRADE_SET = new Set<string>(TRADES);

export const isVehicle = (s: string | null | undefined): s is VehicleSlug => !!s && VEHICLE_SET.has(s);
export const isTrade = (s: string | null | undefined): s is TradeSlug => !!s && TRADE_SET.has(s);

export const tradesFor = (vehicle: VehicleSlug): readonly TradeSlug[] => VEHICLE_TRADES[vehicle];
export const offers = (vehicle: VehicleSlug, trade: string): trade is TradeSlug =>
  isTrade(trade) && VEHICLE_TRADES[vehicle].includes(trade);

/** The vehicle's trades, grouped in menu order; empty groups dropped. */
export function groupedTrades(vehicle: VehicleSlug): { id: TradeGroupId; trades: TradeSlug[] }[] {
  const mine = new Set(VEHICLE_TRADES[vehicle]);
  return TRADE_GROUPS.map((id) => ({ id, trades: TRADES.filter((s) => mine.has(s) && TRADE_GROUP[s] === id) })).filter(
    (g) => g.trades.length > 0,
  );
}

/** Override key for a vehicle-specific trade name, if there is one. */
export function overrideOf(vehicle: VehicleSlug, trade: TradeSlug): string | null {
  const list = (TRADE_OVERRIDES as Partial<Record<VehicleSlug, readonly string[]>>)[vehicle];
  return list?.includes(trade) ? `${vehicle}.${trade}` : null;
}
