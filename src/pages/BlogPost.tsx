import { lazy, Suspense } from 'react';
import { Link, useParams } from 'react-router-dom';
import Seo from '@/components/Seo';
import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';
import { Breadcrumbs, breadcrumbJsonLd } from '@/components/site/Breadcrumbs';
import { LoadError } from '@/components/ranking/RankingControls';
import { readingMinutes, usePost, usePosts, type PostCategory } from '@/hooks/useBlog';
import { useI18n } from '@/i18n/I18nProvider';
import { blogPath } from '@/lib/links';
import { coverPhoto, photoSrcSet, photoUrl } from '@/lib/photos';
import { keepPunctuation } from '@/lib/typography';

// The markdown renderer (~45 kB) loads with the first article, not with the site.
const Markdown = lazy(() => import('@/components/blog/Markdown'));

const ORIGIN = 'https://safemarq.com';

/** /blog/:slug */
export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { t, tp, locale, formatDate } = useI18n();
  const { data: post, isLoading, isError, refetch } = usePost(slug, locale);
  const { data: list } = usePosts(locale, 6);

  if (isLoading) {
    return (
      <Shell>
        <div className="mx-auto max-w-3xl space-y-4 py-16" aria-busy>
          <div className="h-5 w-40 animate-pulse rounded bg-paper-2" />
          <div className="h-24 animate-pulse rounded bg-paper-2" />
          <div className="aspect-[16/9] animate-pulse rounded-xl bg-paper-2" />
        </div>
      </Shell>
    );
  }
  if (isError) {
    return (
      <Shell>
        <div className="mx-auto max-w-3xl py-16">
          <LoadError onRetry={() => refetch()} message={t('blog.loadError')} />
        </div>
      </Shell>
    );
  }
  if (!post) {
    return (
      <Shell>
        <Seo title={t('blog.notFoundTitle')} noindex />
        <div className="mx-auto max-w-3xl py-20">
          <h1 className="text-[40px] font-semibold leading-tight text-strong">{t('blog.notFoundTitle')}</h1>
          <p className="mt-3 text-[17px] text-slate1">{t('blog.notFoundBody')}</p>
          <Link to="/blog" className="btn-ghost-navy mt-6 min-h-[48px] px-5">
            {t('blog.back')}
          </Link>
        </div>
      </Shell>
    );
  }

  const minutes = readingMinutes(post.body);
  const url = `${ORIGIN}${blogPath(post.slug)}`;
  const cover = post.cover_photo ? coverPhoto(post.cover_photo, post.cover_credit ?? '') : null;
  const updatedLater = post.published_at && new Date(post.updated_at).getTime() - new Date(post.published_at).getTime() > 24 * 3600 * 1000;
  const related = (list?.posts ?? []).filter((p) => p.slug !== post.slug).slice(0, 3);
  const crumbs = [
    { label: t('nav.home'), to: '/' },
    { label: t('nav.guides'), to: '/blog' },
    { label: post.title, to: blogPath(post.slug) },
  ];

  return (
    <Shell>
      <Seo
        title={post.title}
        description={post.excerpt || t('blog.metaDescription')}
        canonical={url}
        type="article"
        image={cover ? photoUrl(cover, 1200, 630) : undefined}
        jsonLd={[
          breadcrumbJsonLd(crumbs, ORIGIN),
          {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: post.title,
            description: post.excerpt,
            inLanguage: post.locale,
            datePublished: post.published_at,
            dateModified: post.updated_at,
            mainEntityOfPage: url,
            ...(cover ? { image: photoUrl(cover, 1200, 630) } : {}),
            author: { '@type': 'Organization', name: 'SafeMarq', url: ORIGIN },
            publisher: { '@type': 'Organization', name: 'SafeMarq', url: ORIGIN },
          },
        ]}
      />

      <article>
        <header className="mx-auto max-w-3xl pt-8 md:pt-12">
          <Breadcrumbs items={crumbs.map((c, i) => (i === crumbs.length - 1 ? { label: c.label } : c))} className="[&_li:last-child]:max-w-[16rem] [&_li:last-child]:truncate" />
          <p className="mt-8 flex flex-wrap gap-x-5 gap-y-1 text-[15px] text-slate1">
            <span className="font-semibold text-ink">{t(`blog.category.${post.category as PostCategory}`)}</span>
            {post.published_at && <time dateTime={post.published_at}>{t('blog.published', { date: formatDate(post.published_at) })}</time>}
            {updatedLater && <time dateTime={post.updated_at}>{t('blog.updated', { date: formatDate(post.updated_at) })}</time>}
            <span>{tp('blog.readingTime', minutes)}</span>
          </p>
          <h1 className="mt-3 text-[38px] font-semibold leading-[1.05] text-strong [text-wrap:balance] md:text-[56px]">{keepPunctuation(post.title)}</h1>
          {post.excerpt && <p className="mt-5 text-[20px] leading-relaxed text-slate1">{keepPunctuation(post.excerpt)}</p>}
        </header>

        {cover && (
          <figure className="mx-auto mt-10 max-w-5xl">
            <div className="aspect-[16/9] overflow-hidden rounded-xl bg-paper-2">
              <img
                src={photoUrl(cover, 1280, 720)}
                srcSet={photoSrcSet(cover, [640, 960, 1280, 1920], 16 / 9)}
                sizes="(min-width: 1080px) 1024px, 100vw"
                alt={post.cover_alt ?? ''}
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
            {post.cover_credit && <figcaption className="mt-2 text-[13px] text-slate1">{t('blog.photoCredit', { credit: post.cover_credit })}</figcaption>}
          </figure>
        )}

        <div className="mx-auto mt-10 max-w-[68ch] md:mt-14">
          <Suspense fallback={<div className="h-96 animate-pulse rounded bg-paper-2" aria-hidden />}>
            <Markdown>{post.body}</Markdown>
          </Suspense>
        </div>
      </article>

      <aside className="mx-auto my-16 max-w-3xl">
        <div className="relative overflow-hidden rounded-2xl bg-navy-900 p-6 text-chalk md:p-10">
          <span aria-hidden className="absolute bottom-0 right-0 h-5 w-5 bg-amber" />
          <h2 className="text-[28px] font-semibold leading-tight text-chalk md:text-[34px]">{t('blog.ctaTitle')}</h2>
          <p className="mt-2 max-w-xl text-[16px] leading-relaxed text-chalk/75">{t('blog.ctaBody')}</p>
          <Link to="/recherche" className="btn-amber mt-6 min-h-[48px] px-6">
            {t('blog.ctaButton')}
          </Link>
        </div>
      </aside>

      {related.length > 0 && (
        <section aria-labelledby="related" className="mx-auto mb-20 max-w-3xl">
          <h2 id="related" className="font-display text-[26px] font-semibold text-strong">
            {t('blog.related')}
          </h2>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {related.map((p) => (
              <li key={p.id}>
                <Link to={blogPath(p.slug)} className="group block py-5">
                  <span className="block font-display text-[22px] font-semibold leading-tight text-strong group-hover:underline group-hover:underline-offset-4">{keepPunctuation(p.title)}</span>
                  {p.excerpt && <span className="mt-1 block text-[15px] text-slate1">{p.excerpt}</span>}
                </Link>
              </li>
            ))}
          </ul>
          <Link to="/blog" className="mt-5 inline-flex text-[16px] font-semibold text-strong underline underline-offset-4">
            {t('blog.back')}
          </Link>
        </section>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteHeader />
      <main id="contenu" className="container-editorial">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
