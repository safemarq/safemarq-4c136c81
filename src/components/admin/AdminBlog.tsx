import { lazy, Suspense, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, FilePlus2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { POST_CATEGORIES, readingMinutes, slugify, useAdminPosts, useDeletePost, useSavePost, type Post, type PostCategory, type PostDraft } from '@/hooks/useBlog';
import { LOCALES, type Locale } from '@/i18n/config';
import { blogPath } from '@/lib/links';
import { coverPhoto, photoUrl } from '@/lib/photos';
import { cn } from '@/lib/utils';

const Markdown = lazy(() => import('@/components/blog/Markdown'));

const CATEGORY_LABEL: Record<PostCategory, string> = { guide: 'Guide', conseil: 'Conseil', actualite: 'Actualité' };

const schema = z.object({
  title: z.string().trim().min(3, 'Titre trop court (3 caractères minimum).').max(140, 'Titre trop long (140 caractères maximum).'),
  slug: z
    .string()
    .trim()
    .max(100, 'Adresse trop longue.')
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Adresse : lettres minuscules, chiffres et tirets uniquement.'),
  excerpt: z.string().trim().max(320, 'Résumé trop long (320 caractères maximum).'),
  body: z.string().max(60000, 'Article trop long.'),
  cover_photo: z
    .string()
    .trim()
    .regex(/^(photo-[0-9a-z-]{10,60})?$/, 'Identifiant Unsplash attendu, par exemple photo-1619642751034-765dfdf7c58e.'),
  cover_alt: z.string().trim().max(200, 'Description trop longue.'),
  cover_credit: z.string().trim().max(120, 'Crédit trop long.'),
});

type Form = {
  title: string;
  slug: string;
  locale: Locale;
  category: PostCategory;
  excerpt: string;
  body: string;
  cover_photo: string;
  cover_alt: string;
  cover_credit: string;
  status: 'draft' | 'published';
  /** datetime-local value (visitor's time zone), empty = now when publishing. */
  published_at: string;
};

const toLocalInput = (iso: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const fromPost = (p?: Post): Form => ({
  title: p?.title ?? '',
  slug: p?.slug ?? '',
  locale: (p?.locale as Locale) ?? 'fr',
  category: (p?.category as PostCategory) ?? 'guide',
  excerpt: p?.excerpt ?? '',
  body: p?.body ?? '',
  cover_photo: p?.cover_photo ?? '',
  cover_alt: p?.cover_alt ?? '',
  cover_credit: p?.cover_credit ?? '',
  status: (p?.status as Form['status']) ?? 'draft',
  published_at: toLocalInput(p?.published_at ?? null),
});

function statusOf(p: Post): { label: string; tone: string } {
  if (p.status !== 'published') return { label: 'Brouillon', tone: 'bg-paper-2 text-slate1' };
  if (p.published_at && new Date(p.published_at) > new Date()) return { label: 'Programmé', tone: 'bg-amber/15 text-amber-d dark:text-amber' };
  return { label: 'En ligne', tone: 'bg-teal/10 text-teal' };
}

export default function AdminBlog() {
  const { data: posts = [], isLoading } = useAdminPosts();
  const [editing, setEditing] = useState<Post | 'new' | null>(null);

  if (editing) {
    return <PostEditor key={editing === 'new' ? 'new' : editing.id} post={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {posts.length} article{posts.length > 1 ? 's' : ''}. Markdown : ## titre, **gras**, listes avec -, liens [texte](/chemin).
        </p>
        <button type="button" onClick={() => setEditing('new')} className="btn-amber min-h-[40px] px-4 text-sm">
          <FilePlus2 className="h-4 w-4" aria-hidden />
          Nouvel article
        </button>
      </div>
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 rounded-2xl" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line p-6 text-sm text-muted-foreground">Aucun article pour le moment.</p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card">
          {posts.map((p) => {
            const s = statusOf(p);
            return (
              <li key={p.id}>
                <button type="button" onClick={() => setEditing(p)} className="flex w-full items-center gap-3 p-4 text-left hover:bg-paper-2/60">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink">{p.title}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {p.locale.toUpperCase()}, {CATEGORY_LABEL[p.category as PostCategory] ?? p.category}, modifié le {new Date(p.updated_at).toLocaleDateString('fr-BE')}
                    </span>
                  </span>
                  <span className={cn('shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold', s.tone)}>{s.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function PostEditor({ post, onClose }: { post?: Post; onClose: () => void }) {
  const save = useSavePost();
  const remove = useDeletePost();
  const [form, setForm] = useState<Form>(() => fromPost(post));
  const [slugTouched, setSlugTouched] = useState(!!post);
  const [tab, setTab] = useState<'write' | 'preview'>('write');
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const minutes = useMemo(() => readingMinutes(form.body), [form.body]);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((f) => ({ ...f, [key]: value, ...(key === 'title' && !slugTouched ? { slug: slugify(String(value)) } : {}) }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const submit = async (status: Form['status']) => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const next: Partial<Record<keyof Form, string>> = {};
      for (const issue of parsed.error.issues) next[issue.path[0] as keyof Form] ??= issue.message;
      setErrors(next);
      toast.error('Vérifiez les champs signalés.');
      return;
    }
    const v = parsed.data;
    const draft: PostDraft = {
      title: v.title,
      slug: v.slug,
      locale: form.locale,
      category: form.category,
      excerpt: v.excerpt,
      body: form.body,
      cover_photo: v.cover_photo || null,
      cover_alt: v.cover_alt || null,
      cover_credit: v.cover_credit || null,
      status,
      // Empty date on publishing: the database stamps "now". A future date schedules it.
      published_at: form.published_at ? new Date(form.published_at).toISOString() : status === 'published' ? null : post?.published_at ?? null,
    };
    try {
      await save.mutateAsync({ id: post?.id, draft });
      toast.success(status === 'published' ? 'Article publié.' : 'Brouillon enregistré.');
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      if (/duplicate|unique/i.test(message)) setErrors({ slug: 'Cette adresse existe déjà dans cette langue.' });
      toast.error('Enregistrement impossible.');
    }
  };

  const field = 'w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/50';
  const label = 'mb-1 block text-xs font-semibold text-muted-foreground';
  const error = (k: keyof Form) => errors[k] && <p className="mt-1 text-xs font-medium text-destructive">{errors[k]}</p>;

  return (
    <div className="space-y-5 rounded-2xl border border-line bg-card p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-strong">{post ? 'Modifier l’article' : 'Nouvel article'}</h2>
        <div className="flex items-center gap-2">
          {post?.status === 'published' && (
            <Link to={blogPath(post.slug)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-strong underline underline-offset-4">
              Voir l’article <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </Link>
          )}
          <button type="button" onClick={onClose} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate1 hover:bg-paper-2">
            Fermer
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_9rem_10rem]">
        <div>
          <label className={label} htmlFor="post-title">
            Titre
          </label>
          <input id="post-title" className={field} value={form.title} onChange={(e) => set('title', e.target.value)} maxLength={140} />
          {error('title')}
        </div>
        <div>
          <label className={label} htmlFor="post-locale">
            Langue
          </label>
          <select id="post-locale" className={field} value={form.locale} onChange={(e) => set('locale', e.target.value as Locale)}>
            {LOCALES.map((l) => (
              <option key={l} value={l}>
                {l.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={label} htmlFor="post-category">
            Catégorie
          </label>
          <select id="post-category" className={field} value={form.category} onChange={(e) => set('category', e.target.value as PostCategory)}>
            {POST_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABEL[c]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={label} htmlFor="post-slug">
          Adresse de la page : /blog/{form.slug || '…'}
        </label>
        <input
          id="post-slug"
          className={field}
          value={form.slug}
          onChange={(e) => {
            setSlugTouched(true);
            set('slug', e.target.value.toLowerCase());
          }}
          maxLength={100}
        />
        {error('slug')}
      </div>

      <div>
        <label className={label} htmlFor="post-excerpt">
          Résumé, affiché dans la liste et sur Google ({form.excerpt.length}/320)
        </label>
        <textarea id="post-excerpt" className={cn(field, 'min-h-[72px]')} value={form.excerpt} onChange={(e) => set('excerpt', e.target.value)} maxLength={320} />
        {error('excerpt')}
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_8rem]">
        <div className="space-y-3">
          <div>
            <label className={label} htmlFor="post-cover">
              Photo de couverture : identifiant Unsplash (photo-…)
            </label>
            <input id="post-cover" className={field} value={form.cover_photo} onChange={(e) => set('cover_photo', e.target.value.trim())} placeholder="photo-1619642751034-765dfdf7c58e" />
            {error('cover_photo')}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className={label} htmlFor="post-alt">
                Description de la photo (accessibilité)
              </label>
              <input id="post-alt" className={field} value={form.cover_alt} onChange={(e) => set('cover_alt', e.target.value)} maxLength={200} />
            </div>
            <div>
              <label className={label} htmlFor="post-credit">
                Crédit (Nom / Unsplash)
              </label>
              <input id="post-credit" className={field} value={form.cover_credit} onChange={(e) => set('cover_credit', e.target.value)} maxLength={120} />
            </div>
          </div>
        </div>
        <div className="aspect-[4/3] overflow-hidden rounded-lg bg-paper-2">
          {/^photo-[0-9a-z-]{10,60}$/.test(form.cover_photo) && <img src={photoUrl(coverPhoto(form.cover_photo), 256, 192)} alt="" className="h-full w-full object-cover" />}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <div role="tablist" className="flex gap-1 rounded-lg bg-paper-2 p-1">
            {(['write', 'preview'] as const).map((k) => (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={tab === k}
                onClick={() => setTab(k)}
                className={cn('rounded-md px-3 py-1.5 text-sm font-semibold', tab === k ? 'seg-active' : 'text-slate1')}
              >
                {k === 'write' ? 'Écrire' : 'Aperçu'}
              </button>
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            {minutes} min de lecture, {form.body.length.toLocaleString('fr-BE')} caractères
          </span>
        </div>
        {tab === 'write' ? (
          <textarea
            aria-label="Corps de l’article (Markdown)"
            className={cn(field, 'min-h-[420px] font-mono text-[13px] leading-relaxed')}
            value={form.body}
            onChange={(e) => set('body', e.target.value)}
            spellCheck
          />
        ) : (
          <div className="min-h-[420px] rounded-xl border border-border bg-paper px-4 py-6 md:px-8">
            <div className="mx-auto max-w-[68ch]">
              <Suspense fallback={<Skeleton className="h-64" />}>
                <Markdown>{form.body || '*Rien à afficher.*'}</Markdown>
              </Suspense>
            </div>
          </div>
        )}
        {error('body')}
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4 border-t border-line pt-4">
        <div>
          <label className={label} htmlFor="post-date">
            Date de publication (vide = maintenant ; une date future programme l’article)
          </label>
          <input id="post-date" type="datetime-local" className={cn(field, 'w-auto')} value={form.published_at} onChange={(e) => set('published_at', e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          {post && (
            <button type="button" onClick={() => setConfirmDelete(true)} className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-coral hover:bg-coral/10">
              <Trash2 className="h-4 w-4" aria-hidden />
              Supprimer
            </button>
          )}
          <button type="button" onClick={() => submit('draft')} disabled={save.isPending} className="btn-ghost-navy min-h-[40px] px-4 text-sm">
            {post?.status === 'published' ? 'Repasser en brouillon' : 'Enregistrer le brouillon'}
          </button>
          <button type="button" onClick={() => submit('published')} disabled={save.isPending} className="btn-amber min-h-[40px] px-4 text-sm">
            {post?.status === 'published' ? 'Mettre à jour' : 'Publier'}
          </button>
        </div>
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet article ?</AlertDialogTitle>
            <AlertDialogDescription>Il disparaît du site immédiatement. Cette action est définitive.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!post) return;
                try {
                  await remove.mutateAsync(post.id);
                  toast.success('Article supprimé.');
                  onClose();
                } catch {
                  toast.error('Suppression impossible.');
                }
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
