import { Navigate, useSearchParams } from 'react-router-dom';
import { CreditCard, FileText, LayoutGrid, Loader2, MessageSquare, UserRound, Wrench } from 'lucide-react';
import Seo from '@/components/Seo';
import { ProShell } from '@/components/pro/ProShell';
import { KycBanner, StatusChip } from '@/components/pro/dashboard/KycBanner';
import { AccountSection, Locked, OverviewSection, PlanSection, QuotesSection, ReviewsSection } from '@/components/pro/dashboard/sections';
import { WorkshopSection } from '@/components/pro/dashboard/WorkshopSection';
import { useAuth } from '@/contexts/AuthContext';
import { useProAccount, useProWorkspace } from '@/hooks/useProAccount';
import { useI18n } from '@/i18n/I18nProvider';
import { cn } from '@/lib/utils';

const SECTIONS = [
  { id: 'overview', icon: LayoutGrid },
  { id: 'reviews', icon: MessageSquare },
  { id: 'quotes', icon: FileText },
  { id: 'workshop', icon: Wrench },
  { id: 'plan', icon: CreditCard },
  { id: 'account', icon: UserRound },
] as const;
type SectionId = (typeof SECTIONS)[number]['id'];

const isSection = (v: string | null): v is SectionId => SECTIONS.some((s) => s.id === v);

export default function ProDashboard() {
  const { t } = useI18n();
  const { user, loading } = useAuth();
  const { data: pro, isLoading: proLoading, isError: proError, refetch } = useProAccount();
  const { data: workspace, isLoading: wsLoading, isError: wsError } = useProWorkspace();
  const [params, setParams] = useSearchParams();
  const raw = params.get('section');
  const section: SectionId = isSection(raw) ? raw : 'overview';

  if (loading || (user && proLoading)) {
    return (
      <div className="grid min-h-[100dvh] place-items-center bg-paper">
        <Loader2 className="h-6 w-6 animate-spin text-slate1" aria-hidden />
      </div>
    );
  }
  if (!user) return <Navigate to="/pro/connexion" replace />;
  if (proError) {
    return (
      <ProShell>
        <div className="py-16">
          <p className="text-[15px] text-slate1">{t('pro.dashboard.loadError')}</p>
          <button type="button" onClick={() => refetch()} className="btn-ghost-navy mt-4">
            {t('common.retry')}
          </button>
        </div>
      </ProShell>
    );
  }
  if (!pro) return <Navigate to="/pro/inscription" replace />;

  const approved = pro.kyc_status === 'approved';
  const owned = workspace?.owned ?? [];
  const go = (id: SectionId) => setParams(id === 'overview' ? {} : { section: id }, { replace: true });

  const body = (() => {
    if (section === 'account') return <AccountSection pro={pro} />;
    if (wsLoading) return <div className="h-48 animate-pulse rounded-2xl bg-paper-2" aria-hidden />;
    if (wsError || !workspace) return <p className="text-[15px] text-slate1">{t('pro.dashboard.loadError')}</p>;
    if (section === 'overview') return <OverviewSection pro={pro} workspace={workspace} />;
    if (!approved) return <Locked />;
    if (section === 'reviews') return <ReviewsSection owned={owned} />;
    if (section === 'quotes') return <QuotesSection owned={owned} />;
    if (section === 'workshop') return <WorkshopSection owned={owned} />;
    return <PlanSection owned={owned} />;
  })();

  return (
    <ProShell>
      <Seo title={t('pro.dashboard.metaTitle')} noindex />
      <div className="py-6 md:py-10">
        <header className="mb-6 md:mb-8">
          <h1 className="text-[30px] leading-tight text-strong md:text-[40px]">{pro.company_name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate1">
            <span>{t(`pro.dashboard.accountType.${pro.account_type}`)}</span>
            {approved && <StatusChip status={pro.kyc_status} />}
          </div>
        </header>

        <div className="lg:grid lg:grid-cols-[13rem_1fr] lg:gap-10">
          {/* Phones: sticky scrollable tabs under the header. Desktop: left rail. */}
          <nav
            aria-label={t('pro.dashboard.title')}
            className="scrollbar-hide sticky top-16 z-30 -mx-4 mb-6 flex gap-1 overflow-x-auto border-b border-line bg-paper/95 px-4 backdrop-blur sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:mb-0 lg:flex-col lg:self-start lg:overflow-visible lg:border-0 lg:bg-transparent lg:px-0 lg:backdrop-blur-none"
          >
            {SECTIONS.map(({ id, icon: Icon }) => {
              const active = section === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => go(id)}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative inline-flex min-h-[48px] shrink-0 items-center gap-2 px-3 text-[15px] font-semibold transition-colors lg:min-h-[44px] lg:rounded-lg',
                    active ? 'text-strong lg:bg-paper-2' : 'text-slate1 hover:text-ink',
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" aria-hidden />
                  {t(`pro.dashboard.sections.${id}`)}
                  {active && <span aria-hidden className="absolute inset-x-3 bottom-0 h-[3px] bg-amber lg:hidden" />}
                </button>
              );
            })}
          </nav>

          <section className="min-w-0 pb-16">
            <KycBanner pro={pro} />
            {body}
          </section>
        </div>
      </div>
    </ProShell>
  );
}
