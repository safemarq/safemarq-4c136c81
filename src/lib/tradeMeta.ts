import {
  BatteryCharging,
  Boxes,
  CarFront,
  CircleDot,
  ClipboardCheck,
  Cog,
  Droplet,
  Gauge,
  PanelTop,
  ScanLine,
  Snowflake,
  Sparkles,
  Truck,
  type LucideIcon,
} from 'lucide-react';

/** One icon per trade, used in tabs, menus and tiles. */
export const TRADE_ICON: Record<string, LucideIcon> = {
  entretien: Droplet,
  mecanique: Cog,
  diagnostic: ScanLine,
  electricite: BatteryCharging,
  climatisation: Snowflake,
  carrosserie: CarFront,
  'pare-brise': PanelTop,
  detailing: Sparkles,
  'preparation-perf': Gauge,
  pneus: CircleDot,
  'controle-technique': ClipboardCheck,
  depannage: Truck,
  pieces: Boxes,
};

export const tradeIcon = (slug: string): LucideIcon => TRADE_ICON[slug] ?? Cog;

/** How the 13 trades are grouped in menus: by the kind of problem a driver has. */
export const TRADE_GROUPS = [
  { id: 'care', trades: ['entretien', 'mecanique', 'diagnostic', 'electricite', 'climatisation'] },
  { id: 'body', trades: ['carrosserie', 'pare-brise', 'detailing', 'preparation-perf'] },
  { id: 'road', trades: ['pneus', 'controle-technique', 'depannage', 'pieces'] },
] as const;

export type TradeGroupId = (typeof TRADE_GROUPS)[number]['id'];

/** Shown as tabs above the search box: the jobs people search for most. */
export const FEATURED_TRADES = ['entretien', 'carrosserie', 'pneus', 'controle-technique'] as const;

/** Trades with a photo tile on the home page. */
export const PHOTO_TRADES = ['entretien', 'carrosserie', 'pneus', 'controle-technique'] as const;
