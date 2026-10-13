import { isTrade, overrideOf, type VehicleSlug } from '@/lib/taxonomy';
import type { MessageKey } from './types';

/** Trade slugs come from data, so the key is checked at runtime (t() falls back to French). */
export const tradeKey = (slug: string) => `trades.${slug}` as MessageKey;

/** Trade name as said for this vehicle ("Réparation" for a bike, "Moteur" for a boat). */
export function tradeLabelKey(slug: string, vehicle?: VehicleSlug): MessageKey {
  const o = vehicle && isTrade(slug) ? overrideOf(vehicle, slug) : null;
  return (o ? `tradeOverrides.${o}.label` : `trades.${slug}`) as MessageKey;
}

/** One-line description of a trade, for this vehicle. */
export function tradeInfoKey(slug: string, vehicle?: VehicleSlug): MessageKey {
  const o = vehicle && isTrade(slug) ? overrideOf(vehicle, slug) : null;
  return (o ? `tradeOverrides.${o}.info` : `tradeInfo.${slug}`) as MessageKey;
}

/** mine: "ma voiture"; someone: "Un garage" (the home sentence). */
type VehicleField = 'label' | 'short' | 'inline' | 'pros' | 'mine' | 'someone';
export const vehicleKey = (vehicle: VehicleSlug, field: VehicleField): MessageKey => `vehicles.${vehicle}.${field}`;
