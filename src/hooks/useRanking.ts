import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import type { TradeSlug, VehicleSlug } from '@/lib/taxonomy';

export type RankingSort = 'score' | 'distance';

export interface RankingQuery {
  vehicle: VehicleSlug;
  trade: TradeSlug | null;
  lat: number;
  lng: number;
  radiusKm: number;
  sort?: RankingSort;
  verifiedOnly?: boolean;
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
  lat: number;
  lng: number;
  /** false = placed at the centre of its postal code, not at its door. */
  precise: boolean;
  distanceKm: number;
  rank: number;
}

type Row = Database['public']['Functions']['search_garages']['Returns'][number];

const toListing = (r: Row, rank: number): Listing => ({
  id: r.id,
  slug: r.slug,
  name: r.name,
  rating: Number(r.rating),
  reviews: r.reviews_count,
  verified: r.verified,
  address: r.address,
  locality: r.locality,
  score: r.safemarq_score,
  lat: r.lat,
  lng: r.lng,
  precise: r.location_precise,
  distanceKm: Number(r.distance_km),
  rank,
});

async function fetchPage(q: RankingQuery, limit: number, offset: number) {
  const { data, error } = await supabase.rpc('search_garages', {
    p_lat: q.lat,
    p_lng: q.lng,
    p_vehicle: q.vehicle,
    p_trade: q.trade,
    p_radius_km: q.radiusKm,
    p_sort: q.sort ?? 'score',
    p_limit: limit,
    p_offset: offset,
    p_verified_only: q.verifiedOnly ?? false,
  });
  if (error) throw error;
  const rows = data ?? [];
  return {
    total: Number(rows[0]?.total_count ?? 0),
    items: rows.map((r, i) => toListing(r, offset + i + 1)),
  };
}

/** Listings near a point for (vehicle, trade), ranked by the server (search_garages). */
export function useRanking(q: RankingQuery | null) {
  return useQuery({
    queryKey: ['ranking', q],
    enabled: !!q,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    queryFn: () => (q ? fetchPage(q, q.limit ?? 30, 0) : { items: [], total: 0 }),
  });
}

const PAGE = 20;

/** Same search, loaded 20 at a time ("Show more"). */
export function useRankingPages(q: RankingQuery | null) {
  return useInfiniteQuery({
    queryKey: ['ranking-pages', q],
    enabled: !!q,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    initialPageParam: 0,
    queryFn: ({ pageParam }) => (q ? fetchPage(q, PAGE, pageParam) : { items: [], total: 0 }),
    getNextPageParam: (last, pages) => {
      const loaded = pages.reduce((n, p) => n + p.items.length, 0);
      return last.items.length === PAGE && loaded < last.total ? loaded : undefined;
    },
  });
}

export interface GarageSuggestion {
  id: string;
  slug: string;
  name: string;
  locality: string | null;
  postalCode: string | null;
  score: number;
  verified: boolean;
  distanceKm: number | null;
}

/** Listings whose name looks like what is typed (pass an already debounced text). */
export function useGarageSuggestions(text: string, origin?: { lat: number; lng: number } | null) {
  const q = text.trim();
  return useQuery({
    queryKey: ['garage-suggestions', q, origin?.lat, origin?.lng],
    enabled: q.length >= 2 && q.length <= 80,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<GarageSuggestion[]> => {
      const { data, error } = await supabase.rpc('suggest_garages', {
        q,
        p_lat: origin?.lat ?? null,
        p_lng: origin?.lng ?? null,
        p_limit: 5,
      });
      if (error) throw error;
      return (data ?? []).map((r) => ({
        id: r.id,
        slug: r.slug,
        name: r.name,
        locality: r.locality,
        postalCode: r.postal_code,
        score: r.safemarq_score,
        verified: r.verified,
        distanceKm: r.distance_km === null ? null : Number(r.distance_km),
      }));
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
