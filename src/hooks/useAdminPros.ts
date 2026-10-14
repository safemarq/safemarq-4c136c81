import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { KycStatus, ProAccount } from '@/hooks/useProAccount';

export interface AdminProRow extends ProAccount {
  claims: { id: string; status: string; garage: { name: string; address: string; slug: string } | null }[];
  submissions: {
    id: string;
    status: string;
    name: string;
    street: string;
    postal_code: string;
    city: string;
    phone: string | null;
    website: string | null;
    trades: string[];
  }[];
}

const KEY = ['admin-pro-accounts'] as const;

/** Review queue: oldest submissions first, with their establishments attached. */
export function useAdminProAccounts(status: KycStatus) {
  return useQuery({
    queryKey: [...KEY, status],
    queryFn: async (): Promise<AdminProRow[]> => {
      const { data: accounts, error } = await supabase
        .from('pro_accounts')
        .select(
          'user_id, account_type, company_name, bce_number, phone, business_email, street, postal_code, city, contact_locale, kyc_status, review_note, submitted_at, reviewed_at',
        )
        .eq('kyc_status', status)
        .order('submitted_at', { ascending: true })
        .limit(100);
      if (error) throw error;
      if (!accounts?.length) return [];

      const ids = accounts.map((a) => a.user_id);
      const [claims, submissions] = await Promise.all([
        supabase.from('garage_claims').select('id, user_id, status, garages ( name, address, slug )').in('user_id', ids).eq('status', 'pending'),
        supabase
          .from('garage_submissions')
          .select('id, user_id, status, name, street, postal_code, city, phone, website, trades')
          .in('user_id', ids)
          .eq('status', 'pending'),
      ]);
      if (claims.error) throw claims.error;
      if (submissions.error) throw submissions.error;

      return accounts.map((a) => ({
        ...(a as ProAccount),
        claims: (claims.data ?? []).filter((c) => c.user_id === a.user_id).map((c) => ({ id: c.id, status: c.status, garage: c.garages })),
        submissions: (submissions.data ?? []).filter((s) => s.user_id === a.user_id),
      }));
    },
  });
}

export function useAdminPendingProCount() {
  return useQuery({
    queryKey: [...KEY, 'count'],
    queryFn: async () => {
      const { count, error } = await supabase.from('pro_accounts').select('user_id', { count: 'exact', head: true }).eq('kyc_status', 'pending');
      if (error) return 0;
      return count ?? 0;
    },
  });
}

function invalidateAll(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: KEY });
  qc.invalidateQueries({ queryKey: ['admin-claims'] });
  qc.invalidateQueries({ queryKey: ['admin-stats'] });
}

export function useSetProStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, status, note }: { userId: string; status: KycStatus; note: string | null }) => {
      const { error } = await supabase.from('pro_accounts').update({ kyc_status: status, review_note: note }).eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Compte pro mis à jour');
      invalidateAll(qc);
    },
    onError: () => toast.error('Mise à jour impossible'),
  });
}

export function useReviewSubmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, decision, note }: { id: string; decision: 'approved' | 'rejected'; note: string | null }) => {
      if (decision === 'approved') {
        const { error } = await supabase.rpc('approve_garage_submission', { p_submission_id: id, p_note: note ?? undefined });
        if (error) throw error;
        return;
      }
      const { error } = await supabase
        .from('garage_submissions')
        .update({ status: 'rejected', review_note: note, reviewed_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      toast.success(v.decision === 'approved' ? 'Établissement créé et lié au pro' : 'Établissement refusé');
      invalidateAll(qc);
    },
    onError: (e: Error) =>
      toast.error(e.message.includes('PRO_NOT_APPROVED') ? "Validez d'abord le compte pro." : 'Action impossible'),
  });
}
