import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/** Whether a garage has a verified owner on SafeMarq, i.e. can receive quote requests. */
export function useGarageHasOwner(garageId: string | undefined) {
  return useQuery({
    queryKey: ['garage-has-owner', garageId],
    enabled: !!garageId,
    queryFn: async () => {
      // garage_owners is private (RLS); this function only answers yes or no.
      const { data, error } = await supabase.rpc('garage_accepts_quotes', { p_garage: garageId as string });
      if (error) throw error;
      return data === true;
    },
  });
}
