import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface GarageClaim {
  id: string;
  user_id: string;
  garage_id: string;
  business_email: string;
  justification: string | null;
  status: 'pending' | 'approved' | 'rejected';
  review_note: string | null;
  created_at: string;
  reviewed_at: string | null;
}

export function useUserClaims() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['garage-claims', user?.id],
    enabled: !!user,
    queryFn: async (): Promise<GarageClaim[]> => {
      const { data, error } = await supabase
        .from('garage_claims' as any)
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as unknown as GarageClaim[]) || [];
    },
  });
}

export function useCreateClaim() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (data: {
      garage_id: string;
      business_email: string;
      justification: string;
    }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('garage_claims' as any).insert({
        user_id: user.id,
        ...data,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['garage-claims'] });
      queryClient.invalidateQueries({ queryKey: ['garage-ownership'] });
    },
  });
}

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
