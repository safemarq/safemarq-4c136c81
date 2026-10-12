import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { BrandLink } from './BrandMark';
import { LanguageMenu, PreferenceSegments, ThemeMenu } from './Preferences';
import { useI18n } from '@/i18n/I18nProvider';
import { useAuth } from '@/contexts/AuthContext';
import { TRADES } from '@/lib/trades';
import { tradeKey } from '@/i18n/keys';
import { cn } from '@/lib/utils';

const tradeHref = (slug: string) => `/?metier=${slug}#recherche`;

const navLink = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded-md px-1 py-2 text-[15px] transition-colors hover:text-strong',
    isActive ? 'text-strong font-semibold' : 'text-slate1',
  );

export default function SiteHeader() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile menu after navigation.
  useEffect(() => setOpen(false), [pathname]);

  const accountHref = user ? '/profile' : '/auth';

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b transition-colors duration-200',
        scrolled ? 'border-line bg-paper/90 backdrop-blur-xl' : 'border-transparent bg-paper',
      )}
    >
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2 focus:text-sm focus:font-semibold"
      >
        {t('nav.skipToContent')}
      </a>
      <div className="container-editorial flex h-16 items-center gap-8">
        <BrandLink />

        <nav className="hidden items-center gap-6 lg:flex" aria-label={t('nav.menu')}>
          <Link to={tradeHref('mecanique')} className={navLink({ isActive: false })}>
            {t('nav.garages')}
          </Link>
          <Link to={tradeHref('carrosserie')} className={navLink({ isActive: false })}>
            {t('nav.bodyshops')}
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger className="group inline-flex items-center gap-1 rounded-md px-1 py-2 text-[15px] text-slate1 transition-colors hover:text-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber">
              {t('nav.allTrades')}
              <ChevronDown className="h-3.5 w-3.5 transition-transform group-data-[state=open]:rotate-180" aria-hidden />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="grid w-[26rem] grid-cols-2 gap-0.5 p-2">
              {TRADES.map((tr) => (
                <DropdownMenuItem key={tr.slug} asChild className="py-2">
                  <Link to={tradeHref(tr.slug)}>{t(tradeKey(tr.slug))}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <NavLink to="/about" className={navLink}>
            {t('nav.method')}
          </NavLink>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <LanguageMenu className="hidden sm:inline-flex" />
          <ThemeMenu />
          <Link
            to={accountHref}
            className="hidden h-10 items-center rounded-lg px-3 text-[15px] font-semibold text-ink transition-colors hover:bg-paper-2 md:inline-flex"
          >
            {user ? t('nav.account') : t('nav.signIn')}
          </Link>
          <Link
            to="/pro/connexion"
            className="ml-1 hidden h-10 items-center rounded-lg border border-ink/20 px-3.5 text-[15px] font-semibold text-ink transition-colors hover:border-ink/40 hover:bg-paper-2 md:inline-flex"
          >
            {t('nav.pros')}
          </Link>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-lg text-ink hover:bg-paper-2 lg:hidden"
              aria-label={t('nav.openMenu')}
            >
              <Menu className="h-5 w-5" aria-hidden />
            </SheetTrigger>
            <SheetContent side="right" closeLabel={t('nav.closeMenu')} className="flex w-full flex-col gap-0 overflow-y-auto border-line bg-paper p-0 sm:max-w-md">
              <SheetTitle className="sr-only">{t('nav.menu')}</SheetTitle>
              <div className="flex h-16 shrink-0 items-center border-b border-line px-5">
                <BrandLink />
              </div>
              <nav className="flex flex-col px-5 pt-4" aria-label={t('nav.menu')}>
                {[
                  { to: tradeHref('mecanique'), label: t('nav.garages') },
                  { to: tradeHref('carrosserie'), label: t('nav.bodyshops') },
                  { to: '/about', label: t('nav.method') },
                  { to: accountHref, label: user ? t('nav.account') : t('nav.signIn') },
                ].map((item) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="border-b border-line py-3.5 font-display text-[26px] leading-tight text-strong"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="px-5 pt-6">
                <p className="mb-2 text-sm font-semibold text-slate1">{t('nav.allTrades')}</p>
                <div className="grid grid-cols-2 gap-x-4">
                  {TRADES.map((tr) => (
                    <Link
                      key={tr.slug}
                      to={tradeHref(tr.slug)}
                      onClick={() => setOpen(false)}
                      className="py-2 text-[15px] text-ink"
                    >
                      {t(tradeKey(tr.slug))}
                    </Link>
                  ))}
                </div>
              </div>
              <PreferenceSegments className="px-5 pt-7" />
              <div className="mt-auto px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-8">
                <Link to="/pro/connexion" onClick={() => setOpen(false)} className="btn-amber w-full">
                  {t('nav.pros')}
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
