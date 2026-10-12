import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink, Lock, MapPin, MessageSquare, Plus, Star } from 'lucide-react';
import { toast } from 'sonner';
import ScoreSeal from '@/components/safemarq/ScoreSeal';
import { PreferenceSegments } from '@/components/site/Preferences';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useI18n } from '@/i18n/I18nProvider';
import { useAuth } from '@/contexts/AuthContext';
import { calculateSAFEMARQScore } from '@/hooks/useGarages';
import { useGarageSubscription } from '@/hooks/useGarageTier';
import { useUpdateQuoteStatus, type QuoteStatus } from '@/hooks/useQuoteRequests';
import { useOwnerQuotes, useOwnerReviews, usePendingQuoteCounts, useReplyToReview, type OwnerQuote, type OwnerReview } from '@/hooks/useProDashboard';
import type { ProAccount, ProWorkspace, WorkspaceGarage } from '@/hooks/useProAccount';
import { supabase } from '@/integrations/supabase/client';
import { formatBce, formatPhone } from '@/lib/pro/validation';
import { LOCALE_META, isLocale } from '@/i18n/config';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

type Owned = ProWorkspace['owned'][number];

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <h2 className="text-[24px] leading-tight text-strong md:text-[28px]">{children}</h2>
      {action}
    </div>
  );
}

export function Locked() {
  const { t } = useI18n();
  return (
    <div className="flex items-start gap-3 rounded-xl border border-dashed border-line p-5">
      <Lock className="mt-0.5 h-5 w-5 shrink-0 text-slate1" aria-hidden />
      <p className="text-[15px] text-slate1">{t('pro.dashboard.locked')}</p>
    </div>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-xl border border-dashed border-line p-5 text-[15px] text-slate1">{children}</p>;
}

// ── Overview ─────────────────────────────────────────────────────────────────

export function OverviewSection({ pro, workspace }: { pro: ProAccount; workspace: ProWorkspace }) {
  const { t, tp, formatNumber } = useI18n();
  const ids = workspace.owned.map((o) => o.garage.id);
  const { data: pending = {} } = usePendingQuoteCounts(ids);
  const canAdd = pro.kyc_status !== 'rejected';
  const nothing = workspace.owned.length + workspace.claims.length + workspace.submissions.length === 0;

  const addButton = canAdd ? (
    <Link to="/pro/inscription?ajout=1" className="btn-ghost-navy min-h-[44px] px-4">
      <Plus className="h-4 w-4" aria-hidden />
      {t('pro.dashboard.addEstablishment')}
    </Link>
  ) : null;

  if (nothing) {
    return (
      <div className="rounded-2xl border border-line bg-card p-6 md:p-8">
        <h2 className="text-[24px] text-strong">{t('pro.dashboard.noEstablishmentTitle')}</h2>
        <p className="mt-2 max-w-prose text-[15px] text-slate1">{t('pro.dashboard.noEstablishmentBody')}</p>
        {canAdd && (
          <Link to="/pro/inscription?ajout=1" className="btn-amber mt-5">
            <Plus className="h-4 w-4" aria-hidden />
            {t('pro.dashboard.addEstablishment')}
          </Link>
        )}
      </div>
    );
  }

  return (
    <div>
      <SectionTitle action={addButton}>{t('pro.dashboard.establishments')}</SectionTitle>

      {workspace.owned.length > 0 && (
        <ul className="grid gap-4 md:grid-cols-2">
          {workspace.owned.map(({ garage }) => {
            const score = calculateSAFEMARQScore(garage.rating, garage.reviews_count);
            const open = pending[garage.id] ?? 0;
            return (
              <li key={garage.id} className="rounded-2xl border border-line bg-card p-5">
                <div className="flex items-start gap-4">
                  <ScoreSeal score={score} size={76} compact />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-teal">{t('pro.status.listingApproved')}</p>
                    <h3 className="mt-0.5 truncate text-xl text-strong">{garage.name}</h3>
                    <p className="mt-1 flex items-start gap-1.5 text-sm text-slate1">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                      <span className="line-clamp-2">{garage.address}</span>
                    </p>
                  </div>
                </div>
                <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-line pt-4">
                  <div>
                    <dt className="text-[13px] text-slate1">{t('pro.dashboard.googleRating')}</dt>
                    <dd className="mt-0.5 flex items-center gap-1 font-display text-xl text-ink num">
                      {formatNumber(garage.rating, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                      <Star className="h-4 w-4 fill-amber text-amber" aria-hidden />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[13px] text-slate1">{t('pro.dashboard.sections.reviews')}</dt>
                    <dd className="mt-0.5 font-display text-xl text-ink num">{formatNumber(garage.reviews_count)}</dd>
                  </div>
                </dl>
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[15px]">
                  {open > 0 && (
                    <Link to="?section=quotes" className="font-semibold text-strong underline underline-offset-4">
                      {tp('pro.dashboard.pendingQuotes', open)}
                    </Link>
                  )}
                  <Link to={`/garage/${garage.slug}`} className="inline-flex items-center gap-1.5 font-semibold text-slate1 hover:text-strong">
                    {t('pro.dashboard.viewListing')}
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {(workspace.claims.length > 0 || workspace.submissions.length > 0) && (
        <ul className={cn('divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card', workspace.owned.length > 0 && 'mt-4')}>
          {workspace.claims.map((c) => (
            <PendingRow key={c.id} name={c.garage?.name ?? '—'} sub={c.garage?.address ?? ''} status={c.status} note={c.review_note} />
          ))}
          {workspace.submissions.map((s) => (
            <PendingRow key={s.id} name={s.name} sub={s.city} status={s.status} note={s.review_note} />
          ))}
        </ul>
      )}
    </div>
  );
}

function PendingRow({ name, sub, status, note }: { name: string; sub: string; status: string; note: string | null }) {
  const { t } = useI18n();
  const rejected = status === 'rejected';
  return (
    <li className="flex flex-wrap items-start justify-between gap-3 p-4">
      <div className="min-w-0">
        <p className="truncate text-[15px] font-semibold text-ink">{name}</p>
        <p className="truncate text-sm text-slate1">{sub}</p>
        {note && <p className="mt-1 text-sm text-ink">{note}</p>}
      </div>
      <span
        className={cn(
          'shrink-0 rounded-md px-2 py-0.5 text-[13px] font-semibold',
          rejected ? 'bg-coral/10 text-coral' : 'bg-amber/15 text-amber-d dark:text-amber',
        )}
      >
        {rejected ? t('pro.status.listingRejected') : t('pro.status.listingPending')}
      </span>
    </li>
  );
}

// ── Establishment picker (reviews, quotes, plan) ────────────────────────────

function useSelectedGarage(owned: Owned[]) {
  const [id, setId] = useState(owned[0]?.garage.id);
  const current = owned.find((o) => o.garage.id === id) ?? owned[0];
  return { current, setId };
}

function GaragePicker({ owned, value, onChange }: { owned: Owned[]; value: string | undefined; onChange: (id: string) => void }) {
  if (owned.length < 2) return null;
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-11 max-w-full rounded-lg border border-input bg-card px-3 text-[15px] text-ink focus-visible:border-amber focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/30"
    >
      {owned.map((o) => (
        <option key={o.garage.id} value={o.garage.id}>
          {o.garage.name}
        </option>
      ))}
    </select>
  );
}

// ── Reviews ──────────────────────────────────────────────────────────────────

export function ReviewsSection({ owned }: { owned: Owned[] }) {
  const { t, tp } = useI18n();
  const { current, setId } = useSelectedGarage(owned);
  const { data: reviews = [], isLoading, isError } = useOwnerReviews(current?.garage.id);
  const unanswered = reviews.filter((r) => !r.response).length;

  if (!current) return <Empty>{t('pro.dashboard.noEstablishmentBody')}</Empty>;

  return (
    <div>
      <SectionTitle action={<GaragePicker owned={owned} value={current.garage.id} onChange={setId} />}>{t('pro.dashboard.sections.reviews')}</SectionTitle>
      {unanswered > 0 && <p className="-mt-2 mb-5 text-[15px] font-semibold text-ink">{tp('pro.dashboard.unanswered', unanswered)}</p>}
      {isLoading ? (
        <SkeletonList />
      ) : isError ? (
        <Empty>{t('pro.dashboard.loadError')}</Empty>
      ) : reviews.length === 0 ? (
        <Empty>{t('pro.dashboard.reviewsEmpty')}</Empty>
      ) : (
        <ul className="space-y-3">
          {reviews.map((r) => (
            <ReviewItem key={r.id} review={r} garageId={current.garage.id} ownershipId={current.ownershipId} />
          ))}
        </ul>
      )}
    </div>
  );
}

function ReviewItem({
  review,
  garageId,
  ownershipId,
}: {
  review: OwnerReview;
  garageId: string;
  ownershipId: string;
}) {
  const { t, dateFnsLocale } = useI18n();
  const reply = useReplyToReview(garageId);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');

  const send = async () => {
    if (text.trim().length < 2) return;
    try {
      await reply.mutateAsync({ reviewId: review.id, ownershipId, text });
      toast.success(t('pro.dashboard.replySent'));
      setOpen(false);
      setText('');
    } catch {
      toast.error(t('common.errorGeneric'));
    }
  };

  return (
    <li className="rounded-2xl border border-line bg-card p-4 md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[15px] font-semibold text-ink">{review.author_name}</p>
          <p className="text-[13px] text-slate1">{formatDistanceToNow(new Date(review.created_at), { addSuffix: true, locale: dateFnsLocale })}</p>
        </div>
        <span className="flex shrink-0 gap-0.5" aria-label={`${review.rating} / 5`}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} className={cn('h-4 w-4', i <= review.rating ? 'fill-amber text-amber' : 'text-line')} aria-hidden />
          ))}
        </span>
      </div>
      <p className="mt-3 text-[15px] leading-relaxed text-ink">{review.text}</p>

      {review.response ? (
        <div className="mt-4 border-l-2 border-strong/30 pl-3">
          <p className="text-[13px] font-semibold text-slate1">{t('pro.dashboard.replyFrom')}</p>
          <p className="mt-1 text-[15px] leading-relaxed text-ink">{review.response.text}</p>
        </div>
      ) : open ? (
        <div className="mt-4 space-y-3">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t('pro.dashboard.replyPlaceholder')}
            maxLength={1500}
            aria-label={t('pro.dashboard.reply')}
            autoFocus
          />
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-amber min-h-[44px]" onClick={send} disabled={reply.isPending || text.trim().length < 2}>
              {t('pro.dashboard.replySend')}
            </button>
            <button type="button" className="inline-flex min-h-[44px] items-center rounded-lg px-4 text-[15px] font-semibold text-slate1 hover:bg-paper-2" onClick={() => setOpen(false)}>
              {t('common.cancel')}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-ink/20 px-4 text-[15px] font-semibold text-ink hover:border-ink/40"
        >
          <MessageSquare className="h-4 w-4" aria-hidden />
          {t('pro.dashboard.reply')}
        </button>
      )}
    </li>
  );
}

// ── Quotes ───────────────────────────────────────────────────────────────────

const QUOTE_FILTERS = ['all', 'pending', 'accepted', 'completed'] as const;
type QuoteFilter = (typeof QUOTE_FILTERS)[number];

export function QuotesSection({ owned }: { owned: Owned[] }) {
  const { t } = useI18n();
  const { current, setId } = useSelectedGarage(owned);
  const { data: quotes = [], isLoading, isError } = useOwnerQuotes(current?.garage.id);
  const [filter, setFilter] = useState<QuoteFilter>('all');
  const shown = quotes.filter((q) => filter === 'all' || q.status === filter);

  if (!current) return <Empty>{t('pro.dashboard.noEstablishmentBody')}</Empty>;

  return (
    <div>
      <SectionTitle action={<GaragePicker owned={owned} value={current.garage.id} onChange={setId} />}>{t('pro.dashboard.sections.quotes')}</SectionTitle>
      <div className="scrollbar-hide -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="group">
        {QUOTE_FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
            className={cn(
              'min-h-[40px] shrink-0 rounded-full border px-4 text-sm font-semibold transition-colors',
              filter === f ? 'border-strong bg-strong text-paper' : 'border-line bg-card text-slate1 hover:text-ink',
            )}
          >
            {t(`pro.dashboard.quoteFilters.${f}`)}
          </button>
        ))}
      </div>
      {isLoading ? (
        <SkeletonList />
      ) : isError ? (
        <Empty>{t('pro.dashboard.loadError')}</Empty>
      ) : shown.length === 0 ? (
        <Empty>{t('pro.dashboard.quotesEmpty')}</Empty>
      ) : (
        <ul className="space-y-3">
          {shown.map((q) => (
            <QuoteItem key={q.id} quote={q} />
          ))}
        </ul>
      )}
    </div>
  );
}

const QUOTE_TONE: Record<QuoteStatus, string> = {
  pending: 'bg-amber/15 text-amber-d dark:text-amber',
  accepted: 'bg-strong/10 text-strong',
  rejected: 'bg-coral/10 text-coral',
  completed: 'bg-teal/10 text-teal',
};

function QuoteItem({ quote }: { quote: OwnerQuote }) {
  const { t, dateFnsLocale } = useI18n();
  const update = useUpdateQuoteStatus();
  const qc = useQueryClient();
  const [confirm, setConfirm] = useState<QuoteStatus | null>(null);
  const isNew = Date.now() - new Date(quote.created_at).getTime() < 24 * 3600 * 1000;

  const apply = async (status: QuoteStatus) => {
    setConfirm(null);
    try {
      await update.mutateAsync({ id: quote.id, status });
      qc.invalidateQueries({ queryKey: ['pro-pending-quotes'] });
      toast.success(t('pro.dashboard.quoteUpdated'));
    } catch {
      toast.error(t('common.errorGeneric'));
    }
  };

  const confirmText: Partial<Record<QuoteStatus, { title: string; body: string }>> = {
    accepted: { title: t('pro.dashboard.quoteAccept'), body: t('pro.dashboard.quoteAcceptConfirm') },
    rejected: { title: t('pro.dashboard.quoteDecline'), body: t('pro.dashboard.quoteDeclineConfirm') },
    completed: { title: t('pro.dashboard.quoteComplete'), body: t('pro.dashboard.quoteCompleteConfirm') },
  };

  return (
    <li className="rounded-2xl border border-line bg-card p-4 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[15px] font-semibold capitalize text-ink">
            {quote.service_type} · {quote.vehicle_type}
            {isNew && <span className="ml-2 rounded bg-amber px-1.5 py-0.5 align-middle text-[11px] font-bold normal-case text-amber-d">{t('pro.dashboard.quoteNew')}</span>}
          </p>
          <p className="mt-0.5 text-sm text-slate1">
            {t('pro.dashboard.quotePlate')} <span className="num font-semibold text-ink">{quote.plate}</span> ·{' '}
            {formatDistanceToNow(new Date(quote.created_at), { addSuffix: true, locale: dateFnsLocale })}
          </p>
        </div>
        <span className={cn('shrink-0 rounded-md px-2 py-0.5 text-[13px] font-semibold', QUOTE_TONE[quote.status])}>{t(`pro.dashboard.quoteStatus.${quote.status}`)}</span>
      </div>
      <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-ink">{quote.description}</p>

      {(quote.status === 'pending' || quote.status === 'accepted') && (
        <div className="mt-4 flex flex-wrap gap-2">
          {quote.status === 'pending' ? (
            <>
              <button type="button" className="btn-amber min-h-[44px]" disabled={update.isPending} onClick={() => setConfirm('accepted')}>
                {t('pro.dashboard.quoteAccept')}
              </button>
              <button type="button" className="btn-ghost-navy min-h-[44px]" disabled={update.isPending} onClick={() => setConfirm('rejected')}>
                {t('pro.dashboard.quoteDecline')}
              </button>
            </>
          ) : (
            <button type="button" className="btn-ghost-navy min-h-[44px]" disabled={update.isPending} onClick={() => setConfirm('completed')}>
              {t('pro.dashboard.quoteComplete')}
            </button>
          )}
        </div>
      )}

      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirm ? confirmText[confirm]?.title : ''}</AlertDialogTitle>
            <AlertDialogDescription>{confirm ? confirmText[confirm]?.body : ''}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirm && apply(confirm)}>{confirm ? confirmText[confirm]?.title : ''}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  );
}

// ── Plan ─────────────────────────────────────────────────────────────────────

const PLAN_PRICE: Record<WorkspaceGarage['tier'], number> = { free: 0, pro: 39, premium: 99 };
const PLAN_NAME: Record<Exclude<WorkspaceGarage['tier'], 'free'>, string> = { pro: 'Pro', premium: 'Premium' };

export function PlanSection({ owned }: { owned: Owned[] }) {
  const { t } = useI18n();
  return (
    <div>
      <SectionTitle>{t('pro.dashboard.sections.plan')}</SectionTitle>
      <p className="-mt-2 mb-5 max-w-prose text-[15px] text-slate1">{t('pro.dashboard.planNote')}</p>
      {owned.length === 0 ? (
        <Empty>{t('pro.dashboard.noEstablishmentBody')}</Empty>
      ) : (
        <ul className="space-y-3">
          {owned.map((o) => (
            <PlanRow key={o.garage.id} garage={o.garage} />
          ))}
        </ul>
      )}
    </div>
  );
}

function PlanRow({ garage }: { garage: WorkspaceGarage }) {
  const { t } = useI18n();
  const { data: sub } = useGarageSubscription(garage.id);
  const [busy, setBusy] = useState(false);
  const paid = garage.tier !== 'free';

  const manage = async () => {
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke<{ url?: string }>('create-portal-session', {
        body: { garage_id: garage.id, origin: window.location.origin },
      });
      if (error) throw error;
      if (data?.url) window.location.assign(data.url);
    } catch {
      toast.error(t('common.errorGeneric'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-card p-4 md:p-5">
      <div className="min-w-0">
        <p className="truncate text-[15px] font-semibold text-ink">{garage.name}</p>
        <p className="mt-2 text-[13px] text-slate1">{t('pro.dashboard.planCurrent')}</p>
        <p className="text-[15px] font-semibold text-ink">
          {paid ? `${PLAN_NAME[garage.tier as 'pro' | 'premium']} · ${t('pro.dashboard.planPerMonth', { price: PLAN_PRICE[garage.tier] })}` : t('pro.dashboard.planFree')}
        </p>
        {sub?.cancel_at_period_end && <p className="mt-1 text-sm text-coral">{t('pro.dashboard.planCanceling')}</p>}
      </div>
      {paid ? (
        <button type="button" onClick={manage} disabled={busy} className="btn-ghost-navy min-h-[44px]">
          {t('pro.dashboard.planManage')}
        </button>
      ) : (
        <Link to="/pricing" className="btn-ghost-navy min-h-[44px]">
          {t('pro.dashboard.planUpgrade')}
        </Link>
      )}
    </li>
  );
}

// ── Account ──────────────────────────────────────────────────────────────────

export function AccountSection({ pro }: { pro: ProAccount }) {
  const { t, formatDate } = useI18n();
  const { signOut } = useAuth();
  const rows: [string, ReactNode][] = [
    [t('pro.onboarding.company.typeLabel'), t(`pro.dashboard.accountType.${pro.account_type}`)],
    [t('pro.onboarding.company.legalName'), pro.company_name],
    [t('pro.onboarding.company.bce'), formatBce(pro.bce_number)],
  ];
  const contact: [string, ReactNode][] = [
    [t('pro.onboarding.contact.phone'), formatPhone(pro.phone)],
    [t('pro.onboarding.contact.businessEmail'), pro.business_email],
    [t('pro.onboarding.contact.street'), `${pro.street}, ${pro.postal_code} ${pro.city}`],
    [t('pro.onboarding.contact.contactLanguage'), isLocale(pro.contact_locale) ? LOCALE_META[pro.contact_locale].label : pro.contact_locale],
  ];

  return (
    <div className="space-y-6">
      <SectionTitle>{t('pro.dashboard.sections.account')}</SectionTitle>
      <p className="-mt-3 text-sm text-slate1">
        {pro.reviewed_at && pro.kyc_status === 'approved'
          ? t('pro.dashboard.accountReviewedOn', { date: formatDate(pro.reviewed_at) })
          : t('pro.dashboard.accountSubmittedOn', { date: formatDate(pro.submitted_at) })}
      </p>
      <InfoCard title={t('pro.dashboard.accountCompany')} rows={rows} />
      <InfoCard title={t('pro.dashboard.accountContact')} rows={contact} />
      <div className="rounded-2xl border border-line bg-card p-5">
        <PreferenceSegments />
      </div>
      <button type="button" onClick={() => signOut()} className="btn-ghost-navy min-h-[44px]">
        {t('common.signOut')}
      </button>
    </div>
  );
}

function InfoCard({ title, rows }: { title: string; rows: [string, ReactNode][] }) {
  return (
    <section className="rounded-2xl border border-line bg-card p-5">
      <h3 className="mb-3 font-sans text-base font-semibold text-ink">{title}</h3>
      <dl className="space-y-2.5">
        {rows.map(([label, value]) => (
          <div key={label} className="grid gap-0.5 sm:grid-cols-[13rem_1fr] sm:gap-4">
            <dt className="text-sm text-slate1">{label}</dt>
            <dd className="break-words text-[15px] text-ink">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function SkeletonList() {
  return (
    <ul className="space-y-3" aria-hidden>
      {[0, 1, 2].map((i) => (
        <li key={i} className="h-28 animate-pulse rounded-2xl bg-paper-2" />
      ))}
    </ul>
  );
}
