import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// ── Types ────────────────────────────────────────────────────────────────────

export type AdminClaim = {
  id: string;
  user_id: string;
  garage_id: string;
  business_email: string;
  justification: string | null;
  status: string;
  review_note: string | null;
  created_at: string;
  reviewed_at: string | null;
  garages: { name: string; address: string } | null;
};

export type AdminReview = {
  id: string;
  garage_id: string;
  user_id: string;
  author_name: string;
  rating: number;
  text: string;
  helpful_count: number;
  verified: boolean;
  created_at: string;
  garages: { name: string } | null;
};

export type AdminGarage = {
  id: string;
  name: string;
  slug: string;
  address: string;
  rating: number;
  reviews_count: number;
  verified: boolean;
  type: string;
  price_level: string;
  phone: string | null;
  website: string | null;
  created_at: string;
};

export type AdminUser = {
  id: string;
  email: string;
  created_at: string;
  role: string;
};

// ── Read hooks ───────────────────────────────────────────────────────────────

export function useIsAdmin() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['admin-check', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', user!.id)
        .eq('role', 'admin')
        .maybeSingle();
      return !!data;
    },
    staleTime: 60_000,
  });
}

export function useAdminStats() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['admin-stats'],
    enabled: !!user,
    queryFn: async () => {
      const [garages, reviews, pendingClaims, profiles] = await Promise.all([
        supabase.from('garages').select('id', { count: 'exact', head: true }),
        supabase.from('reviews').select('id', { count: 'exact', head: true }),
        supabase.from('garage_claims').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
      ]);
      return {
        garages: garages.count ?? 0,
        reviews: reviews.count ?? 0,
        pendingClaims: pendingClaims.count ?? 0,
        users: profiles.count ?? 0,
      };
    },
  });
}

export function useAdminClaims() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['admin-claims'],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('garage_claims')
        .select('*, garages(name, address)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as AdminClaim[];
    },
  });
}

export function useAdminReviews() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['admin-reviews'],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, garages(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as AdminReview[];
    },
  });
}

export function useAdminGarages() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['admin-garages'],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('garages')
        .select('id, name, slug, address, rating, reviews_count, verified, type, price_level, phone, website, created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as AdminGarage[];
    },
  });
}

export function useAdminUsers() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['admin-users'],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_users' as never);
      if (error) throw error;
      return (data ?? []) as AdminUser[];
    },
  });
}

// ── Mutations ────────────────────────────────────────────────────────────────

export function useApproveClaim() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ claimId, note }: { claimId: string; note?: string }) => {
      const { error } = await supabase
        .from('garage_claims')
        .update({ status: 'approved', review_note: note ?? null, reviewed_at: new Date().toISOString() })
        .eq('id', claimId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Revendication approuvée');
      qc.invalidateQueries({ queryKey: ['admin-claims'] });
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
    },
    onError: (e: Error) =>
      toast.error(e.message.includes('PRO_NOT_APPROVED') ? "Validez d'abord le compte pro du demandeur (onglet Comptes pro)." : "Erreur lors de l'approbation"),
  });
}

export function useRejectClaim() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ claimId, note }: { claimId: string; note?: string }) => {
      const { error } = await supabase
        .from('garage_claims')
        .update({ status: 'rejected', review_note: note ?? null, reviewed_at: new Date().toISOString() })
        .eq('id', claimId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Revendication rejetée');
      qc.invalidateQueries({ queryKey: ['admin-claims'] });
    },
    onError: () => toast.error('Erreur lors du rejet'),
  });
}

export function useDeleteReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Avis supprimé');
      qc.invalidateQueries({ queryKey: ['admin-reviews'] });
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
    },
    onError: () => toast.error('Erreur lors de la suppression'),
  });
}

export function useToggleGarageVerified() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ garageId, verified }: { garageId: string; verified: boolean }) => {
      const { error } = await supabase.from('garages').update({ verified }).eq('id', garageId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-garages'] });
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });
}

export function useUpdateGarage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ garageId, data }: { garageId: string; data: Partial<AdminGarage> }) => {
      const { error } = await supabase.from('garages').update(data).eq('id', garageId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Garage mis à jour');
      qc.invalidateQueries({ queryKey: ['admin-garages'] });
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });
}

export function useSetUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      // Delete existing non-user role then insert new one
      await supabase.from('user_roles').delete().eq('user_id', userId).neq('role', 'user');
      if (role !== 'user') {
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: role as 'admin' | 'moderator' | 'garage_owner' });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success('Rôle mis à jour');
      qc.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: () => toast.error('Erreur lors du changement de rôle'),
  });
}
