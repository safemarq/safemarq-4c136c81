import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { BrandLink } from '@/components/site/BrandMark';
import { LanguageMenu, ThemeMenu } from '@/components/site/Preferences';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/i18n/I18nProvider';
import { cn } from '@/lib/utils';

/**
 * Chrome for the pro area: brand, "Espace pro" marker, language, theme and
 * sign-out. Deliberately lighter than the public header: pros are here to work.
 */
export function ProShell({ children, width = 'wide', className }: { children: ReactNode; width?: 'narrow' | 'wide'; className?: string }) {
  const { t } = useI18n();
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-[100dvh] bg-paper text-ink">
      <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-xl">
        <div className={cn('mx-auto flex h-16 items-center gap-3 px-4 sm:px-6', width === 'narrow' ? 'max-w-3xl' : 'max-w-6xl')}>
          <BrandLink />
          <Link
            to="/pro/dashboard"
            className="hidden rounded-md border border-line px-2 py-1 text-[13px] font-semibold text-slate1 sm:inline-block"
          >
            {t('nav.pros')}
          </Link>
          <div className="ml-auto flex items-center gap-1">
            <LanguageMenu />
            <ThemeMenu />
            {user && (
              <button
                type="button"
                onClick={() => signOut()}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate1 transition-colors hover:bg-paper-2 hover:text-ink"
                aria-label={t('common.signOut')}
                title={t('common.signOut')}
              >
                <LogOut className="h-[18px] w-[18px]" aria-hidden />
              </button>
            )}
          </div>
        </div>
      </header>
      <main id="contenu" className={cn('mx-auto px-4 sm:px-6', width === 'narrow' ? 'max-w-3xl' : 'max-w-6xl', className)}>
        {children}
      </main>
    </div>
  );
}
