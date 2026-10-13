import { Link } from 'react-router-dom';
import { useI18n } from '@/i18n/I18nProvider';

/** For garages: one sentence, one action. The pro pages say the rest. */
export function ProBand() {
  const { t } = useI18n();
  return (
    <section aria-labelledby="pro-title" className="border-t border-line bg-paper-2">
      <div className="container-editorial flex flex-col gap-7 py-14 md:flex-row md:items-center md:justify-between md:gap-12 md:py-16">
        <div className="max-w-2xl">
          <h2 id="pro-title" className="text-[28px] font-bold text-strong md:text-[36px]">
            {t('home.proTitle')}
          </h2>
          <p className="mt-3 text-[17px] leading-relaxed text-slate1">{t('home.proBody')}</p>
        </div>
        <div className="flex shrink-0 flex-col items-start gap-2 md:items-end">
          <Link to="/pro/connexion" className="btn-amber px-6 text-base">
            {t('home.proCta')}
          </Link>
          <Link to="/pro" className="inline-flex min-h-[44px] items-center text-[15px] font-semibold text-strong underline-offset-4 hover:underline">
            {t('home.proSecondary')}
          </Link>
        </div>
      </div>
    </section>
  );
}
