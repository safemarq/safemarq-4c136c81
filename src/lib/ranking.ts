import type { Garage } from '@/hooks/useGarages';
import { calculateSAFEMARQScore } from '@/hooks/useGarages';
import { getTrade } from './trades';
import { cityFromAddress } from './cities';

export function matchTrade(garage: Garage, tradeSlug: string): boolean {
  const trade = getTrade(tradeSlug);
  if (!trade) return false;
  const hay = [
    garage.specialty,
    garage.description,
    garage.name,
    ...(garage.badges || []),
    ...(garage.serviceTypes || []),
  ]
    .join(' ')
    .toLowerCase();
  return trade.keywords.some(k => hay.includes(k));
}

export function matchCity(garage: Garage, citySlug: string): boolean {
  return cityFromAddress(garage.address) === citySlug;
}

export interface RankedGarage extends Garage {
  score: number;
  rank: number;
}

export function rankGarages(garages: Garage[]): RankedGarage[] {
  return [...garages]
    .map(g => ({ ...g, score: calculateSAFEMARQScore(g.rating, g.reviews), rank: 0 }))
    .sort((a, b) => b.score - a.score)
    .map((g, i) => ({ ...g, rank: i + 1 }));
}

export function filterAndRank(garages: Garage[], tradeSlug: string, citySlug: string): RankedGarage[] {
  const filtered = garages.filter(g => matchTrade(g, tradeSlug) && matchCity(g, citySlug));
  return rankGarages(filtered);
}
