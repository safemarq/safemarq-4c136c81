import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '@/i18n/I18nProvider';

const STORAGE_KEY = 'safemarq_cookie_consent';

function stored(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    // Storage blocked: ask again next time rather than crash.
    return null;
  }
}

/**
 * Consent for audience measurement. Essential storage (language, theme,
 * favourites) never waits for it. Both choices are equally easy to make.
 */
const CookieBanner = () => {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (stored()) return;
    const id = window.setTimeout(() => setVisible(true), 800);
    return () => window.clearTimeout(id);
  }, []);

  const decide = (value: 'accepted' | 'rejected') => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* storage blocked */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label={t('cookies.label')}
      className="fixed inset-x-3 bottom-3 z-[60] animate-fade-in md:inset-x-auto md:bottom-5 md:right-5 md:max-w-sm"
      style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="rounded-2xl border border-line bg-card p-5 shadow-lg">
        <p className="font-display text-[19px] font-semibold text-strong">{t('cookies.label')}</p>
        <p className="mt-1.5 text-[14px] leading-relaxed text-slate1">
          {t('cookies.body')}{' '}
          <Link to="/legal/cookies" className="font-semibold text-strong underline underline-offset-2">
            {t('cookies.more')}
          </Link>
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button type="button" onClick={() => decide('rejected')} className="btn-ghost-navy min-h-[44px] px-3 text-[15px]">
            {t('cookies.refuse')}
          </button>
          <button type="button" onClick={() => decide('accepted')} className="btn-ghost-navy min-h-[44px] px-3 text-[15px]">
            {t('cookies.accept')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
