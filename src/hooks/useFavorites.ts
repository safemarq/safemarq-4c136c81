import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/i18n/I18nProvider';
import { LOCAL_FAVORITES_MAX, parseLocal, readLocalRaw, subscribeLocal, writeLocal } from '@/lib/favorites';

const remoteKey = (userId: string | undefined) => ['favorites', userId] as const;

function useLocalFavorites(): string[] {
  const raw = useSyncExternalStore(subscribeLocal, readLocalRaw, () => '[]');
  return useMemo(() => parseLocal(raw), [raw]);
}

export type ToggleResult = 'added' | 'removed' | 'limit';

/**
 * The visitor's favourite establishments, newest first.
 * Signed out: kept on this device. Signed in: kept in the account.
 */
export function useFavorites() {
  const { user, loading } = useAuth();
  const userId = user?.id;
  const qc = useQueryClient();
  const local = useLocalFavorites();

  const remote = useQuery({
    queryKey: remoteKey(userId),
    enabled: !!userId,
    staleTime: 60_000,
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase
        .from('favorites')
        .select('garage_id')
        .eq('user_id', userId as string)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map((f) => f.garage_id);
    },
  });

  const mutation = useMutation({
    mutationFn: async ({ garageId, on }: { garageId: string; on: boolean }) => {
      if (!userId) throw new Error('Not signed in');
      const { error } = on
        ? await supabase.from('favorites').upsert({ user_id: userId, garage_id: garageId }, { onConflict: 'user_id,garage_id', ignoreDuplicates: true })
        : await supabase.from('favorites').delete().eq('user_id', userId).eq('garage_id', garageId);
      if (error) throw error;
    },
    onMutate: async ({ garageId, on }) => {
      const key = remoteKey(userId);
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<string[]>(key);
      qc.setQueryData<string[]>(key, (ids = []) => (on ? [garageId, ...ids.filter((id) => id !== garageId)] : ids.filter((id) => id !== garageId)));
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) qc.setQueryData(remoteKey(userId), ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: remoteKey(userId) }),
  });

  const ids = useMemo(() => (userId ? remote.data ?? [] : local), [userId, remote.data, local]);
  const set = useMemo(() => new Set(ids), [ids]);

  const toggle = useCallback(
    async (garageId: string): Promise<ToggleResult> => {
      const on = !set.has(garageId);
      if (userId) {
        await mutation.mutateAsync({ garageId, on });
        return on ? 'added' : 'removed';
      }
      if (on && local.length >= LOCAL_FAVORITES_MAX) return 'limit';
      writeLocal(on ? [garageId, ...local] : local.filter((id) => id !== garageId));
      return on ? 'added' : 'removed';
    },
    [set, userId, mutation, local],
  );

  return {
    ids,
    has: useCallback((garageId: string) => set.has(garageId), [set]),
    toggle,
    signedIn: !!userId,
    isLoading: loading || (!!userId && remote.isLoading),
    isError: !!userId && remote.isError,
  };
}

/**
 * Mounted once (App): when someone signs in with favourites saved on this
 * device, they move into the account, then the device list is cleared.
 * Listings deleted since are skipped instead of failing the whole batch.
 */
export function FavoritesSync() {
  const { user } = useAuth();
  const { tp } = useI18n();
  const local = useLocalFavorites();
  const qc = useQueryClient();
  const busy = useRef(false);
  const userId = user?.id;

  useEffect(() => {
    if (!userId || local.length === 0 || busy.current) return;
    busy.current = true;
    (async () => {
      try {
        const { data: existing, error: readError } = await supabase.from('garages').select('id').in('id', local);
        if (readError) throw readError;
        const valid = local.filter((id) => existing?.some((g) => g.id === id));
        if (valid.length > 0) {
          const rows = valid.map((garage_id) => ({ user_id: userId, garage_id }));
          const { error } = await supabase.from('favorites').upsert(rows, { onConflict: 'user_id,garage_id', ignoreDuplicates: true });
          if (error) throw error;
        }
        writeLocal([]);
        await qc.invalidateQueries({ queryKey: remoteKey(userId) });
        if (valid.length > 0) toast.success(tp('favorites.merged', valid.length));
      } catch {
        // Kept on the device; the next visit tries again.
      } finally {
        busy.current = false;
      }
    })();
  }, [userId, local, qc, tp]);

  return null;
}
