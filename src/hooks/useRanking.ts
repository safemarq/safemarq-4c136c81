import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { TradeSlug, VehicleSlug } from '@/lib/taxonomy';

export type RankingSort = 'score' | 'distance';

export interface RankingQuery {
  vehicle: VehicleSlug;
  trade: TradeSlug | null;
  lat: number;
  lng: number;
  radiusKm: number;
  sort?: RankingSort;
  limit?: number;
}

export interface Listing {
  id: string;
  slug: string;
  name: string;
  rating: number;
  reviews: number;
  verified: boolean;
  address: string;
  locality: string | null;
  score: number;
  distanceKm: number;
  rank: number;
}

/** Listings near a point for (vehicle, trade), ranked by the server (search_garages). */
export function useRanking(q: RankingQuery | null) {
  return useQuery({
    queryKey: ['ranking', q],
    enabled: !!q,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    queryFn: async (): Promise<{ items: Listing[]; total: number }> => {
      if (!q) return { items: [], total: 0 };
      const { data, error } = await supabase.rpc('search_garages', {
        p_lat: q.lat,
        p_lng: q.lng,
        p_vehicle: q.vehicle,
        p_trade: q.trade,
        p_radius_km: q.radiusKm,
        p_sort: q.sort ?? 'score',
        p_limit: q.limit ?? 30,
      });
      if (error) throw error;
      const rows = data ?? [];
      return {
        total: Number(rows[0]?.total_count ?? 0),
        items: rows.map((r, i) => ({
          id: r.id,
          slug: r.slug,
          name: r.name,
          rating: Number(r.rating),
          reviews: r.reviews_count,
          verified: r.verified,
          address: r.address,
          locality: r.locality,
          score: r.safemarq_score,
          distanceKm: Number(r.distance_km),
          rank: i + 1,
        })),
      };
    },
  });
}

/** Default search radius: dense for cars and bikes, wider for rarer specialists. */
export const DEFAULT_RADIUS: Record<VehicleSlug, number> = {
  voiture: 10,
  moto: 25,
  utilitaire: 25,
  'camping-car': 50,
  velo: 10,
  trottinette: 10,
  bateau: 50,
};

export const RADIUS_OPTIONS = [5, 10, 25, 50, 100] as const;
