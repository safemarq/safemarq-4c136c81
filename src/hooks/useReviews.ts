import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';

export type Review = Tables<'reviews'>;

// Everything a review shows; the invoice lives in a private table.
const REVIEW_COLUMNS = 'id, garage_id, user_id, author_name, rating, text, helpful_count, verified, created_at, updated_at';

export function useGarageReviews(garageId: string | undefined) {
  return useQuery({
    queryKey: ['reviews', garageId],
    enabled: !!garageId,
    queryFn: async (): Promise<Review[]> => {
      const { data, error } = await supabase
        .from('reviews')
        .select(REVIEW_COLUMNS)
        .eq('garage_id', garageId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export const INVOICE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf'] as const;
export const INVOICE_MAX_BYTES = 10 * 1024 * 1024;

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    // author_name, verified and helpful_count are set by the server (guard_review).
    mutationFn: async ({ invoice, ...review }: { garage_id: string; user_id: string; rating: number; text: string; invoice?: File | null }) => {
      const { data, error } = await supabase
        .from('reviews')
        .insert({ ...review, author_name: 'Client SafeMarq' })
        .select('id, garage_id')
        .single();
      if (error) throw error;
      // The review stands even if the invoice fails: the author can still be told.
      if (invoice) {
        try {
          const ext = (invoice.name.split('.').pop() ?? 'pdf').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5) || 'pdf';
          // Folder = user id (storage policy); the name is generated, never the file's own.
          const path = `${review.user_id}/${data.id}.${ext}`;
          const { error: upErr } = await supabase.storage.from('review-invoices').upload(path, invoice, { contentType: invoice.type, upsert: false });
          if (upErr) throw upErr;
          // Private: only the author and SafeMarq can read it; accepting it marks the review "verified".
          const { error: invoiceError } = await supabase.from('review_invoices').insert({ review_id: data.id, user_id: review.user_id, path });
          if (invoiceError) throw invoiceError;
        } catch {
          return { ...data, invoiceFailed: true };
        }
      }
      return { ...data, invoiceFailed: false };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', data.garage_id] });
    },
  });
}

export function useHelpfulVotes(reviewIds: string[]) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['helpful_votes', user?.id, reviewIds],
    enabled: !!user && reviewIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('helpful_votes')
        .select('review_id')
        .eq('user_id', user!.id)
        .in('review_id', reviewIds);
      if (error) throw error;
      return new Set((data || []).map(v => v.review_id));
    },
  });
}

export function useToggleHelpful() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ reviewId, hasVoted }: { reviewId: string; hasVoted: boolean }) => {
      if (!user) throw new Error('Not authenticated');
      if (hasVoted) {
        const { error } = await supabase
          .from('helpful_votes')
          .delete()
          .eq('user_id', user.id)
          .eq('review_id', reviewId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('helpful_votes')
          .insert({ user_id: user.id, review_id: reviewId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['helpful_votes'] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}
