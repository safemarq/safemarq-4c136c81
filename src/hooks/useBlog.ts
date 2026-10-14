import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';
import type { Locale } from '@/i18n/config';

export type Post = Tables<'posts'>;
export type PostCategory = 'guide' | 'conseil' | 'actualite';
export const POST_CATEGORIES: readonly PostCategory[] = ['guide', 'conseil', 'actualite'];

/** Everything the index shows; the body stays out (it can weigh tens of kB per article). */
export type PostSummary = Pick<Post, 'id' | 'slug' | 'locale' | 'title' | 'excerpt' | 'category' | 'cover_photo' | 'cover_alt' | 'published_at' | 'updated_at'>;
const SUMMARY = 'id, slug, locale, title, excerpt, category, cover_photo, cover_alt, published_at, updated_at';

async function listPublished(locale: Locale, limit: number): Promise<PostSummary[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(SUMMARY)
    .eq('locale', locale)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

/**
 * Published articles in the visitor's language. Until an article exists in
 * that language, the French ones are shown (`fallback: true`).
 */
export function usePosts(locale: Locale, limit = 60) {
  return useQuery({
    queryKey: ['posts', locale, limit],
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const posts = await listPublished(locale, limit);
      if (posts.length > 0 || locale === 'fr') return { posts, fallback: false };
      return { posts: await listPublished('fr', limit), fallback: true };
    },
  });
}

/** One article by slug: the visitor's language first, then French. */
export function usePost(slug: string | undefined, locale: Locale) {
  return useQuery({
    queryKey: ['post', slug, locale],
    enabled: !!slug,
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<Post | null> => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', slug as string)
        .in('locale', locale === 'fr' ? ['fr'] : [locale, 'fr'])
        .eq('status', 'published');
      if (error) throw error;
      const rows = data ?? [];
      return rows.find((p) => p.locale === locale) ?? rows[0] ?? null;
    },
  });
}

/** About 220 words a minute, rounded up, never less than one. */
export function readingMinutes(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

// ── Admin ────────────────────────────────────────────────────────────────────

export function useAdminPosts() {
  return useQuery({
    queryKey: ['admin-posts'],
    queryFn: async (): Promise<Post[]> => {
      const { data, error } = await supabase.from('posts').select('*').order('updated_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export type PostDraft = Pick<
  TablesInsert<'posts'>,
  'slug' | 'locale' | 'title' | 'excerpt' | 'body' | 'category' | 'cover_photo' | 'cover_alt' | 'cover_credit' | 'status' | 'published_at'
>;

export function useSavePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, draft }: { id?: string; draft: PostDraft }) => {
      const query = id ? supabase.from('posts').update(draft).eq('id', id) : supabase.from('posts').insert(draft);
      const { data, error } = await query.select('id').single();
      if (error) throw error;
      return data.id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-posts'] });
      qc.invalidateQueries({ queryKey: ['posts'] });
      qc.invalidateQueries({ queryKey: ['post'] });
    },
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('posts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-posts'] });
      qc.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

/** "Prix d'un entretien : à quoi s'attendre ?" → "prix-d-un-entretien-a-quoi-s-attendre". */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 100)
    .replace(/-$/, '');
}
