import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Award, BadgeCheck, Crown, ExternalLink, Globe, HelpCircle, MapPin, Phone, Sparkles } from 'lucide-react';
import Seo from '@/components/Seo';
import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';
import { Breadcrumbs, breadcrumbJsonLd } from '@/components/site/Breadcrumbs';
import { ScoreBadge } from '@/components/site/ScoreBadge';
import { Stars } from '@/components/ranking/GarageRow';
import { FavoriteButton } from '@/components/favorites/FavoriteButton';
import GarageGallery from '@/components/garage/GarageGallery';
import GarageHours from '@/components/garage/GarageHours';
import GarageMap from '@/components/garage/GarageMap';
import GarageReviews from '@/components/garage/GarageReviews';
import { GarageCatalog } from '@/components/garage/GarageCatalog';
import { QuoteDialog } from '@/components/garage/QuoteDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useGarage, calculateSAFEMARQScore, type Garage } from '@/hooks/useGarages';
import { useGarageHasOwner } from '@/hooks/useGarageClaims';
import { useI18n } from '@/i18n/I18nProvider';
import { vehicleHref } from '@/lib/links';

const ORIGIN = 'https://safemarq.com';

/** Only http(s) links leave the site: a listing's website field is free text. */
const safeUrl = (url: string): string | null => {
  try {
    const u = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`);
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.href : null;
  } catch {
    return null;
  }
};

/** /garage/:id (id is the slug) */
const GarageDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useI18n();
  const { data: garage, isLoading } = useGarage(id || '');

  if (isLoading) {
    return (
      <Shell>
        <div className="space-y-4 py-10" aria-busy>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-14 w-2/3" />
          <Skeleton className="h-40 rounded-2xl" />
        </div>
      </Shell>
    );
  }

  if (!garage) {
    return (
      <Shell>
        <Seo title={t('garage.notFoundTitle')} noindex />
        <div className="max-w-xl py-20">
          <h1 className="text-[40px] font-semibold leading-tight text-strong">{t('garage.notFoundTitle')}</h1>
          <p className="mt-3 text-[17px] text-slate1">{t('garage.notFoundBody')}</p>
          <Link to="/recherche" className="btn-ghost-navy mt-6 min-h-[48px] px-5">
            {t('favorites.emptyCta')}
          </Link>
        </div>
      </Shell>
    );
  }

  return <GarageView garage={garage} />;
};

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

function GarageView({ garage }: { garage: Garage }) {
  const { t, tp, formatNumber } = useI18n();
  const { hash } = useLocation();
  const [quoteOpen, setQuoteOpen] = useState(false);
  const { data: acceptsQuotes, isLoading: checkingQuotes } = useGarageHasOwner(garage.id);

  // Rankings link to /garage/:slug#devis: open the quote form straight away.
  useEffect(() => {
    if (hash === '#devis' && acceptsQuotes) setQuoteOpen(true);
  }, [hash, acceptsQuotes]);

  const score = calculateSAFEMARQScore(garage.rating, garage.reviews);
  const isPro = garage.tier === 'pro' || garage.tier === 'premium';
  const isPremium = garage.tier === 'premium';
  const website = garage.website ? safeUrl(garage.website) : null;
  const phoneHref = garage.phone ? `tel:${garage.phone.replace(/[^\d+]/g, '')}` : null;
  const hasCoords = !!garage.coords && (garage.coords.lat !== 0 || garage.coords.lng !== 0);
  const cover = isPro && garage.coverImageUrl ? [garage.coverImageUrl] : garage.images.filter(Boolean);
  const crumbs = [
    { label: t('nav.home'), to: '/' },
    { label: t('nav.garages'), to: vehicleHref('voiture') },
    { label: garage.name, to: `/garage/${garage.slug}` },
  ];

  // Ratings come from Google: they are shown, not marked up as our own reviews.
  const jsonLd = [
    breadcrumbJsonLd(crumbs, ORIGIN),
    {
      '@context': 'https://schema.org',
      '@type': 'AutoRepair',
      name: garage.name,
      url: `${ORIGIN}/garage/${garage.slug}`,
      ...(cover[0] ? { image: cover[0] } : {}),
      address: { '@type': 'PostalAddress', streetAddress: garage.address, addressCountry: 'BE' },
      ...(garage.phone ? { telephone: garage.phone } : {}),
      ...(website ? { sameAs: website } : {}),
      ...(hasCoords ? { geo: { '@type': 'GeoCoordinates', latitude: garage.coords.lat, longitude: garage.coords.lng } } : {}),
    },
  ];

  return (
    <div className="min-h-screen bg-paper text-ink">
      <Seo
        title={`${garage.name} : avis et devis`}
        description={`${garage.name}, ${garage.address}. ${tp('ranking.googleReviews', garage.reviews)}, ${formatNumber(garage.rating, { maximumFractionDigits: 1 })}/5.`}
        canonical={`${ORIGIN}/garage/${garage.slug}`}
        type="profile"
        image={cover[0]}
        jsonLd={jsonLd}
      />
      <SiteHeader />

      <main id="contenu" className="pb-20">
        <div className="container-editorial pt-6 md:pt-8">
          <Breadcrumbs items={crumbs.map((c, i) => (i === crumbs.length - 1 ? { label: c.label } : c))} />
        </div>

        {cover.length > 0 && (
          <div className="container-editorial mt-5">
            <div className="overflow-hidden rounded-2xl">
              <GarageGallery images={cover} name={garage.name} />
            </div>
          </div>
        )}

        <div className="container-editorial mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14">
          <div className="min-w-0">
            {isPremium && garage.promoBanner && <PromoBanner banner={garage.promoBanner} />}

            <header>
              <div className="flex items-start gap-4">
                {isPro && garage.logoUrl && (
                  <img src={garage.logoUrl} alt="" className="h-16 w-16 shrink-0 rounded-xl border border-line bg-card object-contain" />
                )}
                <div className="min-w-0">
                  <h1 className="text-[36px] font-semibold leading-[1.05] text-strong [overflow-wrap:anywhere] md:text-[52px]">{garage.name}</h1>
                  <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] text-slate1">
                    <span>{garage.type === 'dealer' ? t('favorites.typeDealer') : t('favorites.typeIndependent')}</span>
                    {garage.specialty && <span>{garage.specialty}</span>}
                    {garage.priceLevel && <span>{garage.priceLevel}</span>}
                    {garage.verified && (
                      <span className="inline-flex items-center gap-1 font-semibold text-teal">
                        <BadgeCheck className="h-4 w-4" aria-hidden />
                        {t('ranking.verified')}
                      </span>
                    )}
                    {isPremium ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-strong">
                        <Crown className="h-4 w-4" aria-hidden /> Premium
                      </span>
                    ) : garage.tier === 'pro' ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-strong">
                        <Sparkles className="h-4 w-4" aria-hidden /> Pro
                      </span>
                    ) : null}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-4 border-y border-line py-5">
                <ScoreBadge score={score} size="md" />
                <div>
                  <p className="flex items-center gap-2 text-[17px] font-semibold text-ink">
                    {formatNumber(garage.rating, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                    <Stars value={garage.rating} />
                  </p>
                  <p className="text-[14px] text-slate1">{tp('ranking.googleReviews', garage.reviews)}</p>
                </div>
              </div>

              <ul className="mt-5 space-y-2 text-[16px] text-ink">
                <li className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-slate1" aria-hidden />
                  <span>{garage.address}</span>
                </li>
                {garage.phone && phoneHref && (
                  <li className="flex items-center gap-2.5">
                    <Phone className="h-5 w-5 shrink-0 text-slate1" aria-hidden />
                    <a href={phoneHref} className="font-semibold text-strong underline-offset-4 hover:underline">
                      {garage.phone}
                    </a>
                  </li>
                )}
                {website && (
                  <li className="flex items-center gap-2.5">
                    <Globe className="h-5 w-5 shrink-0 text-slate1" aria-hidden />
                    <a href={website} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1 font-semibold text-strong underline-offset-4 hover:underline">
                      {new URL(website).hostname.replace(/^www\./, '')}
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                    </a>
                  </li>
                )}
              </ul>
            </header>

            {/* Phones: the actions right under the essentials. */}
            <div className="mt-6 lg:hidden">
              <QuotePanel garage={garage} accepts={!!acceptsQuotes} loading={checkingQuotes} phoneHref={phoneHref} website={website} onQuote={() => setQuoteOpen(true)} />
            </div>

            {(garage.description || (isPro && garage.longDescription)) && (
              <section className="mt-8 max-w-[68ch] space-y-4 text-[17px] leading-relaxed text-ink">
                {garage.description && <p>{garage.description}</p>}
                {isPro && garage.longDescription && <p className="whitespace-pre-line">{garage.longDescription}</p>}
              </section>
            )}

            <div className="mt-8">
              <GarageCatalog garageId={garage.id} />
            </div>

            <PremiumSections garage={garage} isPro={isPro} isPremium={isPremium} />

            <div className="mt-8 space-y-6">
              {garage.hours.length > 0 && <GarageHours hours={garage.hours} />}
              {hasCoords && <GarageMap address={garage.address} coords={garage.coords} />}
              <GarageReviews garageId={garage.id} garageName={garage.name} />
            </div>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <QuotePanel garage={garage} accepts={!!acceptsQuotes} loading={checkingQuotes} phoneHref={phoneHref} website={website} onQuote={() => setQuoteOpen(true)} />
            </div>
          </aside>
        </div>
      </main>

      <SiteFooter />
      <QuoteDialog open={quoteOpen} onOpenChange={setQuoteOpen} garageId={garage.id} garageName={garage.name} />
    </div>
  );
}

/** What to do next: a quote when the garage manages its listing, otherwise its phone. */
function QuotePanel({
  garage,
  accepts,
  loading,
  phoneHref,
  website,
  onQuote,
}: {
  garage: Garage;
  accepts: boolean;
  loading: boolean;
  phoneHref: string | null;
  website: string | null;
  onQuote: () => void;
}) {
  const { t } = useI18n();
  if (loading) return <div className="h-48 animate-pulse rounded-2xl bg-paper-2" aria-hidden />;
  return (
    <div id="devis" className="scroll-mt-24 rounded-2xl border border-line bg-card p-5 md:p-6">
      <h2 className="font-display text-[24px] font-semibold leading-tight text-strong">{accepts ? t('garage.quoteTitle') : t('garage.noQuotesTitle')}</h2>
      <p className="mt-2 text-[15px] leading-relaxed text-slate1">{accepts ? t('garage.quoteBody') : t('garage.noQuotesBody')}</p>
      <div className="mt-5 grid gap-2">
        {accepts && (
          <button type="button" onClick={onQuote} className="btn-amber min-h-[52px] w-full">
            {t('ranking.requestQuote')}
          </button>
        )}
        {phoneHref && (
          <a href={phoneHref} className={accepts ? 'btn-ghost-navy min-h-[48px] w-full' : 'btn-amber min-h-[52px] w-full'}>
            <Phone className="h-4 w-4" aria-hidden />
            {t('garage.call')}
          </a>
        )}
        {!accepts && website && (
          <a href={website} target="_blank" rel="noopener noreferrer nofollow" className="btn-ghost-navy min-h-[48px] w-full">
            <Globe className="h-4 w-4" aria-hidden />
            {t('garage.website')}
          </a>
        )}
        <FavoriteButton garageId={garage.id} garageName={garage.name} variant="labeled" className="w-full justify-center" />
      </div>
      {!accepts && (
        <p className="mt-5 border-t border-line pt-4 text-[14px] text-slate1">
          {t('garage.claimPrompt')}{' '}
          <Link to="/pro/inscription" className="font-semibold text-strong underline underline-offset-4">
            {t('garage.claimLink')}
          </Link>
        </p>
      )}
    </div>
  );
}

function PromoBanner({ banner }: { banner: NonNullable<Garage['promoBanner']> }) {
  const href = banner.cta_url ? safeUrl(banner.cta_url) : null;
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-line bg-paper-2 p-4">
      <Sparkles className="h-5 w-5 shrink-0 text-strong" aria-hidden />
      <p className="min-w-0 flex-1 text-[15px] font-semibold text-ink">{banner.text}</p>
      {banner.cta && href && (
        <a href={href} target="_blank" rel="noopener noreferrer nofollow" className="btn-ghost-navy min-h-[40px] px-4 text-[14px]">
          {banner.cta}
        </a>
      )}
    </div>
  );
}

/** Content paid listings can add (services, video, team, certifications, FAQ). */
function PremiumSections({ garage, isPro, isPremium }: { garage: Garage; isPro: boolean; isPremium: boolean }) {
  const { t, formatNumber } = useI18n();
  const video = isPremium && garage.videoUrl ? safeEmbed(garage.videoUrl) : null;
  return (
    <>
      {isPro && garage.servicesDetail.length > 0 && (
        <section className="mt-8 border-t border-line pt-7">
          <h2 className="font-display text-[22px] font-semibold text-strong">{t('garage.premium.servicesTitle')}</h2>
          <ul className="mt-3 divide-y divide-line">
            {garage.servicesDetail.map((s, i) => (
              <li key={i} className="flex items-start justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="text-[16px] font-semibold text-ink">{s.name}</p>
                  {s.description && <p className="mt-0.5 text-[14px] text-slate1">{s.description}</p>}
                </div>
                {typeof s.price_from === 'number' && (
                  <span className="shrink-0 text-[15px] font-semibold text-strong">
                    {t('garage.premium.priceFrom', { price: formatNumber(s.price_from, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }) })}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
      {video && (
        <section className="mt-8 border-t border-line pt-7">
          <h2 className="font-display text-[22px] font-semibold text-strong">{t('garage.premium.videoTitle')}</h2>
          <div className="mt-3 aspect-video overflow-hidden rounded-xl">
            <iframe
              src={video}
              title={garage.name}
              className="h-full w-full"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              sandbox="allow-scripts allow-same-origin allow-presentation"
              allow="encrypted-media; picture-in-picture; fullscreen"
            />
          </div>
        </section>
      )}
      {isPremium && garage.team.length > 0 && (
        <section className="mt-8 border-t border-line pt-7">
          <h2 className="font-display text-[22px] font-semibold text-strong">{t('garage.premium.teamTitle')}</h2>
          <ul className="mt-4 grid grid-cols-2 gap-5 md:grid-cols-3">
            {garage.team.map((m, i) => (
              <li key={i}>
                {m.photo_url ? <img src={m.photo_url} alt="" className="h-16 w-16 rounded-full object-cover" /> : <div className="h-16 w-16 rounded-full bg-paper-2" />}
                <p className="mt-2 text-[15px] font-semibold text-ink">{m.name}</p>
                <p className="text-[14px] text-slate1">{m.role}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
      {isPremium && garage.certifications.length > 0 && (
        <section className="mt-8 border-t border-line pt-7">
          <h2 className="font-display text-[22px] font-semibold text-strong">{t('garage.premium.certificationsTitle')}</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {garage.certifications.map((c, i) => (
              <li key={i} className="inline-flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1 text-[14px] font-semibold text-ink">
                <Award className="h-4 w-4 text-strong" aria-hidden />
                {c.name}
              </li>
            ))}
          </ul>
        </section>
      )}
      {isPremium && garage.faq.length > 0 && (
        <section className="mt-8 border-t border-line pt-7">
          <h2 className="flex items-center gap-2 font-display text-[22px] font-semibold text-strong">
            <HelpCircle className="h-5 w-5" aria-hidden /> {t('garage.premium.faqTitle')}
          </h2>
          <div className="mt-3 divide-y divide-line border-y border-line">
            {garage.faq.map((q, i) => (
              <details key={i} className="group py-3">
                <summary className="cursor-pointer list-none text-[16px] font-semibold text-ink">{q.question}</summary>
                <p className="mt-2 text-[15px] leading-relaxed text-slate1">{q.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

/** Video embeds from YouTube or Vimeo only (the URL is typed by the garage). */
function safeEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');
    if (u.protocol !== 'https:') return null;
    if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      const id = u.pathname.startsWith('/embed/') ? u.pathname.split('/')[2] : u.searchParams.get('v');
      return id && /^[\w-]{6,20}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    if (host === 'youtu.be') {
      const id = u.pathname.slice(1);
      return /^[\w-]{6,20}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    if (host === 'player.vimeo.com' || host === 'vimeo.com') {
      const id = u.pathname.split('/').filter(Boolean).pop();
      return id && /^\d{5,12}$/.test(id) ? `https://player.vimeo.com/video/${id}` : null;
    }
    return null;
  } catch {
    return null;
  }
}

export default GarageDetail;
