import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/** One line of a national list (make or equipment page). */
export interface TopGarage {
  id: string;
  slug: string;
  name: string;
  rating: number;
  reviews: number;
  verified: boolean;
  address: string;
  locality: string | null;
  postalCode: string | null;
  score: number;
  official: boolean;
  rank: number;
}

/** Best-rated establishments in Belgium for one make or one equipment brand. */
export function useTopGarages(filter: { make?: string; tool?: string }, limit = 10) {
  const { make, tool } = filter;
  return useQuery({
    queryKey: ['top-garages', make ?? null, tool ?? null, limit],
    enabled: !!(make || tool),
    staleTime: 5 * 60_000,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('top_garages', { p_make: make ?? null, p_tool: tool ?? null, p_limit: limit });
      if (error) throw error;
      const rows = data ?? [];
      return {
        total: Number(rows[0]?.total_count ?? 0),
        items: rows.map(
          (r, i): TopGarage => ({
            id: r.id,
            slug: r.slug,
            name: r.name,
            rating: Number(r.rating),
            reviews: r.reviews_count,
            verified: r.verified,
            address: r.address,
            locality: r.locality,
            postalCode: r.postal_code,
            score: r.safemarq_score,
            official: r.official,
            rank: i + 1,
          }),
        ),
      };
    },
  });
}

export interface GarageCatalog {
  makes: { make: string; official: boolean }[];
  tools: string[];
}

const catalogKey = (garageId: string | undefined) => ['garage-catalog', garageId] as const;

/** The makes an establishment services and the equipment it works with. */
export function useGarageCatalog(garageId: string | undefined) {
  return useQuery({
    queryKey: catalogKey(garageId),
    enabled: !!garageId,
    staleTime: 60_000,
    queryFn: async (): Promise<GarageCatalog> => {
      const id = garageId as string;
      const [makes, tools] = await Promise.all([
        supabase.from('garage_makes').select('make, official').eq('garage_id', id),
        supabase.from('garage_tool_brands').select('brand').eq('garage_id', id),
      ]);
      if (makes.error) throw makes.error;
      if (tools.error) throw tools.error;
      return { makes: makes.data ?? [], tools: (tools.data ?? []).map((t) => t.brand) };
    },
  });
}

type Toggle = { kind: 'make' | 'tool'; slug: string; on: boolean };

/**
 * Adds or removes one make / one equipment brand. The list updates at once and
 * rolls back if the server refuses (RLS: owners of the establishment only).
 */
export function useToggleCatalogItem(garageId: string | undefined) {
  const qc = useQueryClient();
  const key = catalogKey(garageId);

  return useMutation({
    mutationFn: async ({ kind, slug, on }: Toggle) => {
      if (!garageId) throw new Error('No establishment');
      if (kind === 'make') {
        const { error } = on
          ? await supabase.from('garage_makes').upsert({ garage_id: garageId, make: slug }, { onConflict: 'garage_id,make', ignoreDuplicates: true })
          : await supabase.from('garage_makes').delete().eq('garage_id', garageId).eq('make', slug);
        if (error) throw error;
      } else {
        const { error } = on
          ? await supabase.from('garage_tool_brands').upsert({ garage_id: garageId, brand: slug }, { onConflict: 'garage_id,brand', ignoreDuplicates: true })
          : await supabase.from('garage_tool_brands').delete().eq('garage_id', garageId).eq('brand', slug);
        if (error) throw error;
      }
    },
    onMutate: async ({ kind, slug, on }) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<GarageCatalog>(key);
      if (previous) {
        const next: GarageCatalog =
          kind === 'make'
            ? {
                ...previous,
                makes: on
                  ? previous.makes.some((m) => m.make === slug)
                    ? previous.makes
                    : [...previous.makes, { make: slug, official: false }]
                  : previous.makes.filter((m) => m.make !== slug),
              }
            : { ...previous, tools: on ? [...new Set([...previous.tools, slug])] : previous.tools.filter((t) => t !== slug) };
        qc.setQueryData(key, next);
      }
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(key, ctx.previous);
    },
    // Rapid taps queue several mutations: refetch once the last one settles.
    onSettled: () => {
      if (qc.isMutating({ mutationKey: ['catalog-toggle', garageId] }) <= 1) {
        qc.invalidateQueries({ queryKey: key });
        qc.invalidateQueries({ queryKey: ['top-garages'] });
      }
    },
    mutationKey: ['catalog-toggle', garageId],
  });
}

/** Admin: confirm or withdraw "official dealer" for one make of one establishment. */
export function useSetOfficial(garageId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ make, official }: { make: string; official: boolean }) => {
      if (!garageId) throw new Error('No establishment');
      const { error } = await supabase.from('garage_makes').update({ official }).eq('garage_id', garageId).eq('make', make);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: catalogKey(garageId) }),
  });
}
