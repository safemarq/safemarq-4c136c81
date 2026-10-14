import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PostgrestError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Database, Json } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import type { MessageKey } from '@/i18n/types';
import type { CompanyValues, ContactValues, NewGarageValues } from '@/lib/pro/validation';

export type KycStatus = Database['public']['Enums']['kyc_status'];
export type ProAccountType = Database['public']['Enums']['pro_account_type'];
export type ProAccount = Database['public']['Tables']['pro_accounts']['Row'];

const PRO_ACCOUNT_COLUMNS =
  'user_id, account_type, company_name, bce_number, phone, business_email, street, postal_code, city, contact_locale, kyc_status, review_note, submitted_at, reviewed_at' as const;

export const proKeys = {
  account: (uid: string | undefined) => ['pro-account', uid] as const,
  workspace: (uid: string | undefined) => ['pro-workspace', uid] as const,
  search: (q: string) => ['pro-garage-search', q] as const,
};

/** Postgres "relation does not exist": migration not applied yet. */
const isMissingTable = (e: PostgrestError) => e.code === '42P01' || e.code === 'PGRST205';

export function useProAccount() {
  const { user } = useAuth();
  return useQuery({
    queryKey: proKeys.account(user?.id),
    enabled: !!user,
    staleTime: 60_000,
    queryFn: async (): Promise<ProAccount | null> => {
      const { data, error } = await supabase
        .from('pro_accounts')
        .select(PRO_ACCOUNT_COLUMNS)
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) {
        if (isMissingTable(error)) return null;
        throw error;
      }
      return data as ProAccount | null;
    },
  });
}

export interface WorkspaceGarage {
  id: string;
  slug: string;
  name: string;
  address: string;
  rating: number;
  reviews_count: number;
  tier: Database['public']['Enums']['garage_tier'];
}

export interface ProWorkspace {
  owned: { ownershipId: string; garage: WorkspaceGarage }[];
  claims: { id: string; status: string; review_note: string | null; garage: Pick<WorkspaceGarage, 'id' | 'name' | 'address' | 'slug'> | null }[];
  submissions: { id: string; status: string; review_note: string | null; name: string; city: string }[];
}

/** Everything the dashboard needs about the pro's establishments, in 3 parallel queries. */
export function useProWorkspace() {
  const { user } = useAuth();
  return useQuery({
    queryKey: proKeys.workspace(user?.id),
    enabled: !!user,
    queryFn: async (): Promise<ProWorkspace> => {
      const uid = user!.id;
      const [owned, claims, submissions] = await Promise.all([
        supabase
          .from('garage_owners')
          .select('id, garages ( id, slug, name, address, rating, reviews_count, tier )')
          .eq('user_id', uid),
        supabase
          .from('garage_claims')
          .select('id, status, review_note, garages ( id, name, address, slug )')
          .eq('user_id', uid)
          .neq('status', 'approved')
          .order('created_at', { ascending: false }),
        supabase
          .from('garage_submissions')
          .select('id, status, review_note, name, city')
          .eq('user_id', uid)
          .neq('status', 'approved')
          .order('created_at', { ascending: false }),
      ]);
      if (owned.error) throw owned.error;
      if (claims.error) throw claims.error;
      if (submissions.error && !isMissingTable(submissions.error)) throw submissions.error;

      return {
        owned: (owned.data ?? [])
          .filter((o) => o.garages)
          .map((o) => ({ ownershipId: o.id, garage: { ...o.garages!, rating: Number(o.garages!.rating) } })),
        claims: (claims.data ?? []).map((c) => ({
          id: c.id,
          status: c.status,
          review_note: c.review_note,
          garage: c.garages,
        })),
        submissions: submissions.data ?? [],
      };
    },
  });
}

export interface ClaimableGarage {
  id: string;
  name: string;
  address: string;
  slug: string;
  managed: boolean;
}

export function useClaimableGarageSearch(query: string) {
  const q = query.trim();
  return useQuery({
    queryKey: proKeys.search(q),
    enabled: q.length >= 2,
    staleTime: 5 * 60_000,
    placeholderData: keepPreviousData,
    queryFn: async ({ signal }): Promise<ClaimableGarage[]> => {
      const { data, error } = await supabase.rpc('search_claimable_garages', { q }).abortSignal(signal);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export type EstablishmentChoice =
  | { mode: 'existing'; garage: ClaimableGarage }
  | { mode: 'new'; values: NewGarageValues };

export interface OnboardingPayload {
  account: (CompanyValues & ContactValues) | null;
  establishment: EstablishmentChoice | null;
}

export function useSubmitProOnboarding() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ account, establishment }: OnboardingPayload) => {
      const { error } = await supabase.rpc('submit_pro_onboarding', {
        p_account: account ? (account as unknown as Json) : null,
        p_claim_garage_id: establishment?.mode === 'existing' ? establishment.garage.id : undefined,
        p_new_garage: establishment?.mode === 'new' ? (establishment.values as unknown as Json) : null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: proKeys.account(user?.id) });
      qc.invalidateQueries({ queryKey: proKeys.workspace(user?.id) });
    },
  });
}

/** Maps database errors raised by the onboarding RPC to a message the pro can act on. */
export function onboardingErrorKey(error: unknown): MessageKey {
  const e = error as Partial<PostgrestError> | undefined;
  const text = `${e?.message ?? ''} ${e?.details ?? ''}`;
  if (e?.code === '23505' && text.includes('pro_accounts_bce')) return 'pro.onboarding.review.errorDuplicateBce';
  if (e?.code === '23505' && text.includes('garage_claims')) return 'pro.onboarding.review.errorDuplicateClaim';
  if (text.includes('ALREADY_SUBMITTED')) return 'pro.onboarding.review.errorAlreadySubmitted';
  if (e?.message === 'Failed to fetch') return 'common.errorNetwork';
  return 'common.errorGeneric';
}
