import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/** Figures shown on the home page: the number of listed garages (a count, no rows fetched). */
export function useLandingStats() {
  return useQuery({
    queryKey: ['landing-stats'],
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { count, error } = await supabase.from('garages').select('id', { count: 'exact', head: true });
      if (error) throw error;
      return { garages: count ?? 0 };
    },
  });
}
