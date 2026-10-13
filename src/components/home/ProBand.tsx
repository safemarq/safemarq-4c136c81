import { Link } from 'react-router-dom';
import { useI18n } from '@/i18n/I18nProvider';
import { PHOTOS, photoSrcSet, photoUrl } from '@/lib/photos';

export function ProBand() {
  const { t } = useI18n();
  const photo = PHOTOS.pro;
  return (
    <section aria-labelledby="pro-title" className="bg-paper-2">
      <div className="container-editorial grid items-center gap-8 py-16 md:grid-cols-2 md:gap-14 md:py-24">
        <div className="relative overflow-hidden rounded-2xl bg-navy-900">
          <img
            src={photoUrl(photo, 800, 640)}
            srcSet={photoSrcSet(photo, [400, 600, 800, 1200], 5 / 4)}
            sizes="(min-width: 768px) 50vw, 100vw"
            alt={t('home.photoAlt.pro')}
            loading="lazy"
            decoding="async"
            className="aspect-[5/4] h-full w-full object-cover"
          />
          <span aria-hidden className="absolute bottom-0 right-0 h-6 w-6 bg-amber" />
        </div>
        <div>
          <h2 id="pro-title" className="max-w-[18ch] text-[34px] font-bold text-strong md:text-5xl">
            {t('home.proTitle')}
          </h2>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-slate1">{t('home.proBody')}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/pro/connexion" className="btn-amber px-6 text-base">
              {t('home.proCta')}
            </Link>
            <Link to="/pro" className="btn-ghost-navy px-6 text-base">
              {t('home.proSecondary')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
