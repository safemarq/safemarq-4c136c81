import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type QuoteStatus = 'pending' | 'accepted' | 'rejected' | 'completed';

export function useCreateQuoteRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      garage_id: string;
      user_id?: string;
      plate: string;
      vehicle_type: string;
      service_type: string;
      description: string;
      contact_name?: string | null;
      contact_phone?: string | null;
    }) => {
      const { error } = await supabase.from('quote_requests').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote-requests'] });
    },
  });
}

export function useGarageQuoteRequests(garageId: string) {
  return useQuery({
    queryKey: ['quote-requests', garageId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quote_requests')
        .select('*')
        .eq('garage_id', garageId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useUpdateQuoteStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: QuoteStatus }) => {
      const { error } = await supabase
        .from('quote_requests')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote-requests'] });
    },
  });
}
