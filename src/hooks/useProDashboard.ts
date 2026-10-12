import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { QuoteStatus } from '@/hooks/useQuoteRequests';

/** Open quote requests per establishment, one round-trip for all of them. */
export function usePendingQuoteCounts(garageIds: string[]) {
  return useQuery({
    queryKey: ['pro-pending-quotes', [...garageIds].sort()],
    enabled: garageIds.length > 0,
    queryFn: async (): Promise<Record<string, number>> => {
      const { data, error } = await supabase
        .from('quote_requests')
        .select('garage_id')
        .in('garage_id', garageIds)
        .eq('status', 'pending');
      if (error) throw error;
      return (data ?? []).reduce<Record<string, number>>((acc, r) => {
        acc[r.garage_id] = (acc[r.garage_id] ?? 0) + 1;
        return acc;
      }, {});
    },
  });
}

export interface OwnerReview {
  id: string;
  author_name: string;
  rating: number;
  text: string;
  created_at: string;
  response: { text: string; created_at: string } | null;
}

export function useOwnerReviews(garageId: string | undefined) {
  return useQuery({
    queryKey: ['pro-reviews', garageId],
    enabled: !!garageId,
    queryFn: async (): Promise<OwnerReview[]> => {
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select('id, author_name, rating, text, created_at')
        .eq('garage_id', garageId!)
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      if (!reviews?.length) return [];

      const { data: responses, error: rErr } = await supabase
        .from('review_responses')
        .select('review_id, text, created_at')
        .in('review_id', reviews.map((r) => r.id));
      if (rErr) throw rErr;

      const byReview = new Map((responses ?? []).map((r) => [r.review_id, { text: r.text, created_at: r.created_at }]));
      return reviews.map((r) => ({ ...r, response: byReview.get(r.id) ?? null }));
    },
  });
}

export function useReplyToReview(garageId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { reviewId: string; ownershipId: string; text: string }) => {
      const { error } = await supabase.from('review_responses').insert({
        review_id: input.reviewId,
        garage_owner_id: input.ownershipId,
        text: input.text.trim(),
      });
      if (error) throw error;
    },
    // Show the reply immediately; the refetch confirms it.
    onMutate: async (input) => {
      const key = ['pro-reviews', garageId];
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<OwnerReview[]>(key);
      qc.setQueryData<OwnerReview[]>(key, (old) =>
        old?.map((r) => (r.id === input.reviewId ? { ...r, response: { text: input.text.trim(), created_at: new Date().toISOString() } } : r)),
      );
      return { previous };
    },
    onError: (_e, _input, ctx) => {
      if (ctx?.previous) qc.setQueryData(['pro-reviews', garageId], ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['pro-reviews', garageId] }),
  });
}

export interface OwnerQuote {
  id: string;
  plate: string;
  vehicle_type: string;
  service_type: string;
  description: string;
  status: QuoteStatus;
  created_at: string;
}

export function useOwnerQuotes(garageId: string | undefined) {
  return useQuery({
    queryKey: ['quote-requests', garageId],
    enabled: !!garageId,
    queryFn: async (): Promise<OwnerQuote[]> => {
      const { data, error } = await supabase
        .from('quote_requests')
        .select('id, plate, vehicle_type, service_type, description, status, created_at')
        .eq('garage_id', garageId!)
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as OwnerQuote[];
    },
  });
}
