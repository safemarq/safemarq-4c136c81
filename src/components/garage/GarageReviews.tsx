import { useId, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { FileCheck2, Paperclip, Star, ThumbsUp, X } from 'lucide-react';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useReviewResponses } from '@/hooks/useDashboard';
import { INVOICE_MAX_BYTES, INVOICE_TYPES, useCreateReview, useGarageReviews, useHelpfulVotes, useToggleHelpful, type Review } from '@/hooks/useReviews';
import { useI18n } from '@/i18n/I18nProvider';
import type { MessageKey } from '@/i18n/types';
import { cn } from '@/lib/utils';

interface Props {
  garageId: string;
  garageName: string;
}

/**
 * Reviews left on SafeMarq. They are shown apart from the Google figures used
 * by the score, and marked "invoice checked" once SafeMarq has seen the invoice.
 */
export default function GarageReviews({ garageId, garageName }: Props) {
  const { t, tp } = useI18n();
  const { user } = useAuth();
  const { pathname } = useLocation();
  const { data: reviews = [], isLoading } = useGarageReviews(garageId);
  const ids = reviews.map((r) => r.id);
  const { data: voted = new Set<string>() } = useHelpfulVotes(ids);
  const { data: responses = [] } = useReviewResponses(ids);
  const responseOf = new Map(responses.map((r) => [r.review_id, r]));
  const mine = user ? reviews.find((r) => r.user_id === user.id) : undefined;

  return (
    <section aria-labelledby="reviews-title" className="border-t border-line pt-7">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="reviews-title" className="font-display text-[26px] font-semibold text-strong">
          {t('reviews.title')}
        </h2>
        {reviews.length > 0 && <span className="text-[15px] text-slate1">{tp('reviews.count', reviews.length)}</span>}
      </div>
      <p className="mt-1 max-w-[62ch] text-[15px] leading-relaxed text-slate1">{t('reviews.lead')}</p>

      <div className="mt-5">
        {!user ? (
          <p className="rounded-xl bg-paper-2 px-4 py-3.5 text-[15px] text-ink">
            {t('reviews.signInPrompt')}{' '}
            <Link to={`/auth?retour=${encodeURIComponent(pathname)}`} className="font-semibold text-strong underline underline-offset-4">
              {t('pro.auth.tabSignIn')}
            </Link>
          </p>
        ) : mine ? (
          <p className="rounded-xl bg-paper-2 px-4 py-3.5 text-[15px] text-ink">{t('reviews.alreadyReviewed')}</p>
        ) : (
          <ReviewForm garageId={garageId} garageName={garageName} userId={user.id} />
        )}
      </div>

      <div className="mt-6" aria-live="polite" aria-busy={isLoading}>
        {isLoading ? (
          <div className="h-24 animate-pulse rounded-xl bg-paper-2" aria-hidden />
        ) : reviews.length === 0 ? (
          <p className="text-[15px] text-slate1">{t('reviews.empty')}</p>
        ) : (
          <ul className="divide-y divide-line border-y border-line">
            {reviews.map((r) => (
              <ReviewItem key={r.id} review={r} reply={responseOf.get(r.id)?.text} voted={voted.has(r.id)} signedIn={!!user} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function ReviewItem({ review, reply, voted, signedIn }: { review: Review; reply?: string; voted: boolean; signedIn: boolean }) {
  const { t, dateFnsLocale } = useI18n();
  const toggle = useToggleHelpful();
  return (
    <li className="py-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex flex-wrap items-center gap-2 text-[15px] font-semibold text-ink">
            {review.author_name}
            {review.verified && (
              <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-teal">
                <FileCheck2 className="h-4 w-4" aria-hidden />
                {t('reviews.verified')}
              </span>
            )}
          </p>
          <p className="text-[13px] text-slate1">{formatDistanceToNow(new Date(review.created_at), { addSuffix: true, locale: dateFnsLocale })}</p>
        </div>
        <span className="flex gap-0.5" role="img" aria-label={t('reviews.ratingValue', { n: review.rating })}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} className={cn('h-4 w-4', i <= review.rating ? 'fill-amber text-amber' : 'text-line')} aria-hidden />
          ))}
        </span>
      </div>
      <p className="mt-3 whitespace-pre-line text-[16px] leading-relaxed text-ink">{review.text}</p>
      {reply && (
        <div className="mt-4 border-l-2 border-strong/30 pl-3">
          <p className="text-[13px] font-semibold text-slate1">{t('reviews.reply')}</p>
          <p className="mt-1 text-[15px] leading-relaxed text-ink">{reply}</p>
        </div>
      )}
      <button
        type="button"
        aria-pressed={voted}
        disabled={toggle.isPending}
        onClick={() => {
          if (!signedIn) return toast(t('reviews.helpfulSignIn'));
          toggle.mutate({ reviewId: review.id, hasVoted: voted }, { onError: () => toast.error(t('common.errorGeneric')) });
        }}
        className={cn('mt-3 inline-flex min-h-[36px] items-center gap-1.5 rounded-lg px-2 text-[14px] font-semibold transition-colors hover:bg-paper-2', voted ? 'text-strong' : 'text-slate1')}
      >
        <ThumbsUp className={cn('h-4 w-4', voted && 'fill-current')} aria-hidden />
        {t('reviews.helpful', { count: review.helpful_count })}
      </button>
    </li>
  );
}

function ReviewForm({ garageId, garageName, userId }: { garageId: string; garageName: string; userId: string }) {
  const { t } = useI18n();
  const create = useCreateReview();
  const ids = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<MessageKey | null>(null);

  const pickFile = (f: File | null) => {
    setError(null);
    if (!f) return setFile(null);
    if (!(INVOICE_TYPES as readonly string[]).includes(f.type)) return setError('reviews.invoiceType');
    if (f.size > INVOICE_MAX_BYTES) return setError('reviews.invoiceTooBig');
    setFile(f);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return setError('reviews.errorRating');
    if (text.trim().length < 10) return setError('reviews.errorText');
    setError(null);
    try {
      const res = await create.mutateAsync({ garage_id: garageId, user_id: userId, rating, text: text.trim(), invoice: file });
      toast.success(t('reviews.published'));
      if (res.invoiceFailed) toast.error(t('reviews.invoiceFailed'));
      setRating(0);
      setText('');
      setFile(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : String((err as { message?: string })?.message ?? '');
      setError(
        /OWN_GARAGE/.test(message)
          ? 'reviews.errorOwn'
          : /RATE_LIMITED/.test(message)
            ? 'reviews.errorRate'
            : /duplicate|unique/i.test(message)
              ? 'reviews.alreadyReviewed'
              : 'common.errorGeneric',
      );
    }
  };

  const shown = hover || rating;
  return (
    <form onSubmit={submit} noValidate className="rounded-2xl border border-line bg-card p-4 md:p-5">
      <h3 className="font-display text-[20px] font-semibold text-strong">{t('reviews.formTitle', { name: garageName })}</h3>

      <fieldset className="mt-3">
        <legend className="text-sm font-semibold text-ink">{t('reviews.ratingLabel')}</legend>
        <div className="mt-1 flex gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="cursor-pointer p-1" onMouseEnter={() => setHover(n)}>
              <input type="radio" name={`${ids}-rating`} value={n} checked={rating === n} onChange={() => setRating(n)} className="peer sr-only" />
              <Star className={cn('h-8 w-8 transition-colors peer-focus-visible:rounded peer-focus-visible:ring-2 peer-focus-visible:ring-amber', n <= shown ? 'fill-amber text-amber' : 'text-line')} aria-hidden />
              <span className="sr-only">{t('reviews.ratingValue', { n })}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label htmlFor={`${ids}-text`} className="mt-4 block text-sm font-semibold text-ink">
        {t('reviews.textLabel')}
      </label>
      <Textarea
        id={`${ids}-text`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t('reviews.textPlaceholder')}
        maxLength={4000}
        rows={4}
        className="mt-1.5"
      />

      <div className="mt-4">
        <input ref={fileRef} type="file" accept={INVOICE_TYPES.join(',')} className="sr-only" id={`${ids}-file`} onChange={(e) => pickFile(e.target.files?.[0] ?? null)} />
        {file ? (
          <p className="flex items-center gap-2 text-[15px] text-ink">
            <Paperclip className="h-4 w-4 text-slate1" aria-hidden />
            <span className="min-w-0 truncate">{file.name}</span>
            <button
              type="button"
              onClick={() => {
                setFile(null);
                if (fileRef.current) fileRef.current.value = '';
              }}
              aria-label={t('common.cancel')}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate1 hover:bg-paper-2"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </p>
        ) : (
          <label htmlFor={`${ids}-file`} className="inline-flex min-h-[40px] cursor-pointer items-center gap-2 rounded-lg border border-ink/20 px-3 text-[14px] font-semibold text-ink hover:border-ink/40">
            <Paperclip className="h-4 w-4" aria-hidden />
            {t('reviews.invoiceLabel')}
          </label>
        )}
        <p className="mt-1.5 text-[13px] leading-snug text-slate1">{t('reviews.invoiceHint')}</p>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-3.5 py-3 text-sm font-medium text-destructive">
          {t(error)}
        </p>
      )}

      <button type="submit" className="btn-amber mt-4 min-h-[48px] px-6" disabled={create.isPending}>
        {create.isPending ? t('pro.auth.submitting') : t('reviews.submit')}
      </button>
    </form>
  );
}
