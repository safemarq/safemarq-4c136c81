import { Briefcase, Car, Heart, Home, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useI18n } from '@/i18n/I18nProvider';
import { useProAccount } from '@/hooks/useProAccount';
import { cn } from '@/lib/utils';

/** Thumb-reach navigation for consumer pages on phones. Hidden from md up. */
export default function MobileTabBar() {
  const { t } = useI18n();
  const { data: pro } = useProAccount();

  const tabs = [
    { to: '/', label: t('nav.home'), icon: Home, end: true },
    { to: '/favoris', label: t('nav.favorites'), icon: Heart, end: false },
    pro
      ? { to: '/pro/dashboard', label: t('nav.pros'), icon: Briefcase, end: false }
      : { to: '/vehicles', label: t('nav.vehicles'), icon: Car, end: false },
    { to: '/profile', label: t('nav.account'), icon: User, end: false },
  ];

  return (
    <nav
      aria-label={t('nav.menu')}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/92 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto grid h-16 max-w-md grid-cols-4">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'relative flex h-full flex-col items-center justify-center gap-1 text-xs font-medium transition-colors',
                  isActive ? 'text-strong' : 'text-slate1',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <span aria-hidden className="absolute top-0 h-[3px] w-7 bg-amber" />}
                  <Icon className="h-[22px] w-[22px]" strokeWidth={isActive ? 2.2 : 1.8} aria-hidden />
                  <span className="max-w-full truncate px-1">{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
