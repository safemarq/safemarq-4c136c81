import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Seo from '@/components/Seo';
import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';
import { Breadcrumbs, breadcrumbJsonLd } from '@/components/site/Breadcrumbs';
import { LoadError } from '@/components/ranking/RankingControls';
import { POST_CATEGORIES, usePosts, type PostCategory, type PostSummary } from '@/hooks/useBlog';
import { useI18n } from '@/i18n/I18nProvider';
import { blogPath } from '@/lib/links';
import { coverPhoto, photoSrcSet, photoUrl } from '@/lib/photos';
import { keepPunctuation } from '@/lib/typography';
import { cn } from '@/lib/utils';


type Filter = 'all' | PostCategory;

/** /blog: the latest article large, the others as an index. */
export default function Blog() {
  const { t, locale } = useI18n();
  const { data, isLoading, isError, refetch } = usePosts(locale);
  const [filter, setFilter] = useState<Filter>('all');
  const posts = useMemo(() => data?.posts ?? [], [data]);
  const categories = POST_CATEGORIES.filter((c) => posts.some((p) => p.category === c));
  const shown = filter === 'all' ? posts : posts.filter((p) => p.category === filter);
  const [lead, ...rest] = shown;

  const crumbs = [{ label: t('nav.home'), to: '/' }, { label: t('nav.guides') }];

  return (
    <div className="min-h-screen bg-paper text-ink">
      <Seo
        title={t('blog.metaTitle')}
        description={t('blog.metaDescription')}
        canonical="https://safemarq.com/blog"
        jsonLd={breadcrumbJsonLd([{ label: t('nav.home'), to: '/' }, { label: t('nav.guides'), to: '/blog' }])}
      />
      <SiteHeader overlay />

      <main id="contenu">
        <section className="bg-navy-900 text-chalk">
          <div className="container-editorial pb-12 pt-28 md:pb-16 md:pt-36">
            <Breadcrumbs items={crumbs} onDark />
            <h1 className="mt-5 text-[44px] font-semibold leading-[1.02] text-chalk md:text-[72px]">{t('blog.title')}</h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-chalk/75">{t('blog.lead')}</p>
          </div>
        </section>

        <section className="container-editorial py-10 md:py-14" aria-live="polite" aria-busy={isLoading}>
          {data?.fallback && <p className="mb-6 text-[15px] text-slate1">{t('blog.frenchOnly')}</p>}

          {categories.length > 1 && (
            <div role="tablist" aria-label={t('blog.title')} className="scrollbar-hide -mx-4 mb-8 flex gap-x-6 overflow-x-auto border-b border-line px-4 sm:mx-0 sm:px-0">
              {(['all', ...categories] as Filter[]).map((c) => {
                const selected = c === filter;
                return (
                  <button
                    key={c}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setFilter(c)}
                    className={cn('relative shrink-0 pb-3 pt-1 font-display text-[20px] font-semibold transition-colors', selected ? 'text-strong' : 'text-slate2 hover:text-ink')}
                  >
                    {t(`blog.categories.${c}`)}
                    {selected && <motion.span layoutId="blog-tab" aria-hidden className="absolute inset-x-0 -bottom-px h-[3px] rounded-full bg-amber" />}
                  </button>
                );
              })}
            </div>
          )}

          {isLoading ? (
            <div className="grid gap-8 md:grid-cols-[7fr_5fr]" aria-hidden>
              <div className="aspect-[16/10] animate-pulse rounded-xl bg-paper-2" />
              <div className="space-y-3">
                <div className="h-6 w-1/3 animate-pulse rounded bg-paper-2" />
                <div className="h-24 animate-pulse rounded bg-paper-2" />
              </div>
            </div>
          ) : isError ? (
            <LoadError onRetry={() => refetch()} message={t('blog.loadError')} />
          ) : !lead ? (
            <p className="text-[17px] text-slate1">{t('blog.empty')}</p>
          ) : (
            <>
              <LeadPost post={lead} />
              {rest.length > 0 && (
                <ul className="mt-12 divide-y divide-line border-y border-line md:mt-16">
                  {rest.map((p) => (
                    <li key={p.id}>
                      <PostRow post={p} />
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function Meta({ post }: { post: PostSummary }) {
  const { t, formatDate } = useI18n();
  return (
    <p className="flex flex-wrap gap-x-4 gap-y-1 text-[14px] text-slate1">
      <span className="font-semibold text-ink">{t(`blog.category.${post.category as PostCategory}`)}</span>
      {post.published_at && <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>}
    </p>
  );
}

function LeadPost({ post }: { post: PostSummary }) {
  return (
    <article className="group relative grid gap-6 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:items-center md:gap-12">
      {post.cover_photo && (
        <div className="aspect-[16/10] overflow-hidden rounded-xl bg-paper-2">
          <img
            src={photoUrl(coverPhoto(post.cover_photo), 960, 600)}
            srcSet={photoSrcSet(coverPhoto(post.cover_photo), [480, 720, 960, 1280], 16 / 10)}
            sizes="(min-width: 1200px) 680px, (min-width: 768px) 56vw, 100vw"
            alt={post.cover_alt ?? ''}
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        </div>
      )}
      <div>
        <Meta post={post} />
        <h2 className="mt-3 text-[32px] font-semibold leading-[1.08] text-strong md:text-[44px]">
          <Link to={blogPath(post.slug)} className="after:absolute after:inset-0 group-hover:underline group-hover:decoration-2 group-hover:underline-offset-[6px]">
            {keepPunctuation(post.title)}
          </Link>
        </h2>
        {post.excerpt && <p className="mt-4 text-[17px] leading-relaxed text-slate1">{keepPunctuation(post.excerpt)}</p>}
      </div>
    </article>
  );
}

function PostRow({ post }: { post: PostSummary }) {
  return (
    <article className="group relative grid gap-5 py-7 md:grid-cols-[minmax(0,1fr)_14rem] md:items-center md:gap-10">
      <div>
        <Meta post={post} />
        <h3 className="mt-2 font-display text-[26px] font-semibold leading-tight text-strong md:text-[30px]">
          <Link to={blogPath(post.slug)} className="after:absolute after:inset-0 group-hover:underline group-hover:underline-offset-4">
            {keepPunctuation(post.title)}
          </Link>
        </h3>
        {post.excerpt && <p className="mt-2 max-w-[62ch] text-[16px] leading-relaxed text-slate1">{keepPunctuation(post.excerpt)}</p>}
      </div>
      {post.cover_photo && (
        <div className="hidden aspect-[4/3] overflow-hidden rounded-lg bg-paper-2 md:block">
          <img
            src={photoUrl(coverPhoto(post.cover_photo), 448, 336)}
            srcSet={photoSrcSet(coverPhoto(post.cover_photo), [224, 448], 4 / 3)}
            sizes="224px"
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        </div>
      )}
    </article>
  );
}
