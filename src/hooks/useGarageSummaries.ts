import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface GarageSummary {
  id: string;
  slug: string;
  name: string;
  address: string;
  locality: string | null;
  postalCode: string | null;
  rating: number;
  reviews: number;
  verified: boolean;
  score: number;
  priceLevel: string;
  phone: string | null;
  type: 'dealer' | 'independent';
}

const COLUMNS = 'id, slug, name, address, locality, postal_code, rating, reviews_count, verified, safemarq_score, price_level, phone, type';

/** A handful of listings by id, returned in the order of `ids` (deleted ones are skipped). */
export function useGarageSummaries(ids: string[]) {
  return useQuery({
    queryKey: ['garage-summaries', ids],
    enabled: ids.length > 0,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<GarageSummary[]> => {
      const { data, error } = await supabase.from('garages').select(COLUMNS).in('id', ids);
      if (error) throw error;
      const byId = new Map(
        (data ?? []).map((g) => [
          g.id,
          {
            id: g.id,
            slug: g.slug,
            name: g.name,
            address: g.address,
            locality: g.locality,
            postalCode: g.postal_code,
            rating: Number(g.rating),
            reviews: g.reviews_count,
            verified: g.verified,
            score: g.safemarq_score ?? 0,
            priceLevel: g.price_level,
            phone: g.phone,
            type: g.type === 'dealer' ? 'dealer' : 'independent',
          } satisfies GarageSummary,
        ]),
      );
      return ids.map((id) => byId.get(id)).filter((g): g is GarageSummary => !!g);
    },
  });
}

export interface CatalogById {
  makes: Record<string, { make: string; official: boolean }[]>;
  tools: Record<string, string[]>;
}

/** Makes and equipment of a few establishments at once (comparison table). */
export function useCatalogs(ids: string[]) {
  return useQuery({
    queryKey: ['garage-catalogs', ids],
    enabled: ids.length > 0,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<CatalogById> => {
      const [makes, tools] = await Promise.all([
        supabase.from('garage_makes').select('garage_id, make, official').in('garage_id', ids),
        supabase.from('garage_tool_brands').select('garage_id, brand').in('garage_id', ids),
      ]);
      if (makes.error) throw makes.error;
      if (tools.error) throw tools.error;
      const out: CatalogById = { makes: {}, tools: {} };
      for (const m of makes.data ?? []) (out.makes[m.garage_id] ??= []).push({ make: m.make, official: m.official });
      for (const tb of tools.data ?? []) (out.tools[tb.garage_id] ??= []).push(tb.brand);
      return out;
    },
  });
}
