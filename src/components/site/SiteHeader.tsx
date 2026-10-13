import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ArrowRight, ChevronDown, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TradeList } from '@/components/search/TradeList';
import { BrandLink } from './BrandMark';
import { LanguageMenu, PreferenceSegments, ThemeMenu } from './Preferences';
import { useI18n } from '@/i18n/I18nProvider';
import { useAuth } from '@/contexts/AuthContext';
import { tradeHref, vehicleHref } from '@/lib/links';
import { DEFAULT_VEHICLE, VEHICLES, type VehicleSlug } from '@/lib/taxonomy';
import { vehicleIcon } from '@/lib/tradeMeta';
import { vehicleKey } from '@/i18n/keys';
import { PHOTOS, photoSrcSet, photoUrl } from '@/lib/photos';
import { cn } from '@/lib/utils';

interface Props {
  /** Transparent over a hero photo until the page scrolls. */
  overlay?: boolean;
}

export default function SiteHeader({ overlay = false }: Props) {
  const { t } = useI18n();
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [tradesOpen, setTradesOpen] = useState(false);
  const [menuVehicle, setMenuVehicle] = useState<VehicleSlug>(DEFAULT_VEHICLE);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menus after navigation.
  useEffect(() => {
    setOpen(false);
    setTradesOpen(false);
  }, [pathname]);

  const onDark = overlay && !scrolled && !tradesOpen;
  const accountHref = user ? '/profile' : '/auth';

  const navItem = cn(
    'rounded-md px-1 py-2 text-[15px] font-medium transition-colors',
    onDark ? 'text-chalk/85 hover:text-chalk' : 'text-slate1 hover:text-strong',
  );

  return (
    <header
      className={cn(
        'top-0 z-40 w-full border-b transition-[background-color,border-color] duration-200',
        overlay ? 'fixed inset-x-0' : 'sticky',
        onDark ? 'border-transparent bg-transparent' : 'border-line bg-paper/95 backdrop-blur-xl',
      )}
    >
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-ink"
      >
        {t('nav.skipToContent')}
      </a>
      <div className="container-editorial flex h-16 items-center gap-8 md:h-[72px]">
        <BrandLink onDark={onDark} />

        <nav className="hidden items-center gap-6 lg:flex" aria-label={t('nav.menu')}>
          <Popover open={tradesOpen} onOpenChange={setTradesOpen}>
            <PopoverTrigger className={cn(navItem, 'group inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber')}>
              {t('nav.allTrades')}
              <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" aria-hidden />
            </PopoverTrigger>
            <PopoverContent
              align="start"
              sideOffset={14}
              collisionPadding={24}
              className="w-[min(76rem,calc(100vw-3rem))] rounded-2xl border-line bg-card p-0 shadow-lg"
            >
              <div className="grid lg:grid-cols-[13.5rem_1fr_16rem]">
                <VehicleRail value={menuVehicle} onChange={setMenuVehicle} onNavigate={() => setTradesOpen(false)} />
                <div className="max-h-[min(78vh,42rem)] overflow-y-auto p-5 pb-1">
                  <TradeList
                    key={menuVehicle}
                    vehicle={menuVehicle}
                    dense
                    renderItem={(slug, content, cls) => (
                      <Link to={tradeHref(slug, menuVehicle)} className={cls} onClick={() => setTradesOpen(false)}>
                        {content}
                      </Link>
                    )}
                  />
                </div>
                <MenuFeature onNavigate={() => setTradesOpen(false)} />
              </div>
            </PopoverContent>
          </Popover>
          <Link to={vehicleHref('voiture')} className={navItem}>
            {t('nav.garages')}
          </Link>
          <Link to={tradeHref('carrosserie')} className={navItem}>
            {t('nav.bodyshops')}
          </Link>
          <NavLink to="/about" className={navItem}>
            {t('nav.method')}
          </NavLink>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <LanguageMenu onDark={onDark} className="hidden sm:inline-flex" />
          <ThemeMenu onDark={onDark} />
          <Link
            to={accountHref}
            className={cn(
              'hidden h-10 items-center rounded-lg px-3 text-[15px] font-semibold transition-colors md:inline-flex',
              onDark ? 'text-chalk hover:bg-chalk/10' : 'text-ink hover:bg-paper-2',
            )}
          >
            {user ? t('nav.account') : t('nav.signIn')}
          </Link>
          <Link
            to="/pro/connexion"
            className={cn(
              'ml-1 hidden h-10 items-center rounded-lg border px-3.5 text-[15px] font-semibold transition-colors md:inline-flex',
              onDark ? 'border-chalk/40 text-chalk hover:bg-chalk/10' : 'border-ink/20 text-ink hover:border-ink/40 hover:bg-paper-2',
            )}
          >
            {t('nav.pros')}
          </Link>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              className={cn(
                '-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-lg lg:hidden',
                onDark ? 'text-chalk hover:bg-chalk/10' : 'text-ink hover:bg-paper-2',
              )}
              aria-label={t('nav.openMenu')}
            >
              <Menu className="h-6 w-6" aria-hidden />
            </SheetTrigger>
            <SheetContent
              side="right"
              closeLabel={t('nav.closeMenu')}
              className="flex w-full flex-col gap-0 overflow-y-auto border-line bg-paper p-0 sm:max-w-md"
            >
              <SheetTitle className="sr-only">{t('nav.menu')}</SheetTitle>
              <div className="flex h-16 shrink-0 items-center border-b border-line px-5">
                <BrandLink />
              </div>
              <nav className="flex flex-col px-5 pt-3" aria-label={t('nav.menu')}>
                {[
                  { to: vehicleHref('voiture'), label: t('nav.garages') },
                  { to: tradeHref('carrosserie'), label: t('nav.bodyshops') },
                  { to: '/about', label: t('nav.method') },
                  { to: accountHref, label: user ? t('nav.account') : t('nav.signIn') },
                ].map((item) => (
                  <Link key={item.label} to={item.to} onClick={() => setOpen(false)} className="border-b border-line py-3.5 font-display text-[26px] font-semibold leading-tight text-strong">
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="px-3 pt-6">
                <p className="mb-2 px-2 text-sm font-semibold text-slate1">{t('nav.allTrades')}</p>
                <div role="radiogroup" aria-label={t('search.vehicleLabel')} className="scrollbar-hide flex gap-1.5 overflow-x-auto px-2 pb-3">
                  {VEHICLES.map((v) => {
                    const Icon = vehicleIcon(v);
                    const active = v === menuVehicle;
                    return (
                      <button
                        key={v}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setMenuVehicle(v)}
                        className={cn(
                          'inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-full border px-3 text-[14px] font-semibold transition-colors',
                          active ? 'border-strong bg-strong text-paper' : 'border-line bg-card text-slate1',
                        )}
                      >
                        <Icon className="h-4 w-4" aria-hidden />
                        {t(vehicleKey(v, 'short'))}
                      </button>
                    );
                  })}
                </div>
                <TradeList
                  key={menuVehicle}
                  vehicle={menuVehicle}
                  columns={1}
                  dense
                  renderItem={(slug, content, cls) => (
                    <Link to={tradeHref(slug, menuVehicle)} className={cls} onClick={() => setOpen(false)}>
                      {content}
                    </Link>
                  )}
                />
              </div>
              <PreferenceSegments className="px-5 pt-8" />
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

/** Left column of the trades menu: one entry per vehicle, hover or focus to switch. */
function VehicleRail({ value, onChange, onNavigate }: { value: VehicleSlug; onChange: (v: VehicleSlug) => void; onNavigate: () => void }) {
  const { t } = useI18n();
  return (
    <div className="border-r border-line bg-paper-2/60 p-3" role="tablist" aria-orientation="vertical" aria-label={t('search.vehicleLabel')}>
      {VEHICLES.map((v) => {
        const Icon = vehicleIcon(v);
        const active = v === value;
        return (
          <Link
            key={v}
            to={vehicleHref(v)}
            role="tab"
            aria-selected={active}
            onMouseEnter={() => onChange(v)}
            onFocus={() => onChange(v)}
            onClick={onNavigate}
            className={cn(
              'flex min-h-[44px] items-center gap-3 rounded-lg px-3 text-[15px] font-semibold transition-colors',
              active ? 'bg-card text-strong shadow-sm' : 'text-slate1 hover:text-ink',
            )}
          >
            <Icon className="h-5 w-5 shrink-0" strokeWidth={active ? 2.1 : 1.8} aria-hidden />
            {t(vehicleKey(v, 'short'))}
          </Link>
        );
      })}
    </div>
  );
}

/** Photo card at the end of the trades menu: explains why the ranking can be trusted. */
function MenuFeature({ onNavigate }: { onNavigate: () => void }) {
  const { t } = useI18n();
  const photo = PHOTOS['controle-technique'];
  return (
    <Link
      to="/about"
      onClick={onNavigate}
      className="group relative isolate hidden min-h-[22rem] overflow-hidden rounded-r-2xl lg:block"
    >
      <img
        src={photoUrl(photo, 544, 720)}
        srcSet={photoSrcSet(photo, [272, 544], 272 / 360)}
        sizes="272px"
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      />
      <span aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-900 via-navy-900/70 to-navy-900/10" />
      <span className="absolute inset-x-0 bottom-0 block p-6 text-chalk">
        <span className="block font-display text-2xl font-semibold leading-tight">{t('menu.featuredTitle')}</span>
        <span className="mt-2 block text-[15px] text-chalk/80">{t('menu.featuredBody')}</span>
        <span className="mt-4 inline-flex items-center gap-1.5 text-[15px] font-semibold text-amber">
          {t('menu.featuredCta')}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </span>
      </span>
    </Link>
  );
}
