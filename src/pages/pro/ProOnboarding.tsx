import { useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Seo from '@/components/Seo';
import { ProShell } from '@/components/pro/ProShell';
import { CompanyStep } from '@/components/pro/onboarding/CompanyStep';
import { ContactStep } from '@/components/pro/onboarding/ContactStep';
import { EstablishmentStep } from '@/components/pro/onboarding/EstablishmentStep';
import { ReviewStep } from '@/components/pro/onboarding/ReviewStep';
import { Progress } from '@/components/pro/onboarding/parts';
import { useOnboardingDraft, type OnboardingDraft } from '@/components/pro/onboarding/draft';
import { useAuth } from '@/contexts/AuthContext';
import { onboardingErrorKey, useProAccount, useSubmitProOnboarding, type ProAccount } from '@/hooks/useProAccount';
import { useI18n } from '@/i18n/I18nProvider';
import { isLocale } from '@/i18n/config';
import type { MessageKey } from '@/i18n/types';
import { companySchema, contactSchema, newGarageSchema } from '@/lib/pro/validation';

type StepId = 'company' | 'contact' | 'establishment' | 'review';

function Loading() {
  return (
    <div className="grid min-h-[100dvh] place-items-center bg-paper">
      <Loader2 className="h-6 w-6 animate-spin text-slate1" aria-hidden />
    </div>
  );
}

export default function ProOnboarding() {
  const { user, loading } = useAuth();
  const { data: pro, isLoading, isError } = useProAccount();
  const [params] = useSearchParams();
  const adding = params.get('ajout') === '1';

  if (loading || (user && isLoading)) return <Loading />;
  if (!user) return <Navigate to="/pro/connexion" replace />;
  if (isError) return <Navigate to="/pro/dashboard" replace />;

  // Decide which flow this person needs.
  if (!pro) return <Flow uid={user.id} email={user.email ?? ''} steps={['company', 'contact', 'establishment', 'review']} />;
  if (pro.kyc_status === 'needs_info' && !adding) return <Flow uid={user.id} email={user.email ?? ''} steps={['company', 'contact', 'review']} existing={pro} />;
  if (adding && pro.kyc_status !== 'rejected') return <Flow uid={user.id} email={user.email ?? ''} steps={['establishment', 'review']} existing={pro} />;
  return <Navigate to="/pro/dashboard" replace />;
}

function Flow({ uid, email, steps, existing }: { uid: string; email: string; steps: StepId[]; existing?: ProAccount }) {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const submit = useSubmitProOnboarding();
  const [error, setError] = useState<MessageKey | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const { draft, setDraft, clear } = useOnboardingDraft(uid, () => seedFrom(existing, email, locale));
  const step = Math.min(draft.step, steps.length - 1);
  const current = steps[step];

  const go = (index: number) => {
    setDraft((d) => ({ ...d, step: Math.max(0, Math.min(index, steps.length - 1)) }));
    setError(null);
    // Each step starts at the top on phones.
    requestAnimationFrame(() => topRef.current?.scrollIntoView({ block: 'start' }));
  };
  const next = () => go(step + 1);
  const back = () => go(step - 1);

  // Validated snapshots for the review step and the request.
  const parsed = useMemo(() => {
    const company = companySchema.safeParse(draft.company);
    const contact = contactSchema.safeParse(draft.contact);
    const est = draft.establishment;
    const newGarage = newGarageSchema.safeParse(est.newGarage);
    return {
      company: company.success ? company.data : null,
      contact: contact.success ? contact.data : null,
      establishment:
        est.mode === 'existing'
          ? est.existing
            ? ({ mode: 'existing', existing: est.existing } as const)
            : null
          : newGarage.success
            ? ({ mode: 'new', newGarage: newGarage.data } as const)
            : null,
    };
  }, [draft]);

  const needsAccount = steps.includes('company');
  const needsEstablishment = steps.includes('establishment');

  const onSubmit = async () => {
    // A step may have been skipped by editing localStorage or a stale draft: send them back to it.
    if (needsAccount && !parsed.company) return go(steps.indexOf('company'));
    if (needsAccount && !parsed.contact) return go(steps.indexOf('contact'));
    if (needsEstablishment && !parsed.establishment) return go(steps.indexOf('establishment'));
    setError(null);
    try {
      await submit.mutateAsync({
        account: needsAccount && parsed.company && parsed.contact ? { ...parsed.company, ...parsed.contact } : null,
        establishment: needsEstablishment && parsed.establishment
          ? parsed.establishment.mode === 'existing'
            ? { mode: 'existing', garage: parsed.establishment.existing }
            : { mode: 'new', values: parsed.establishment.newGarage }
          : null,
      });
      clear();
      toast.success(t('pro.status.pending'));
      navigate('/pro/dashboard', { replace: true });
    } catch (e) {
      setError(onboardingErrorKey(e));
    }
  };

  const labels = steps.map((s) => t(`pro.onboarding.steps.${s}`));

  return (
    <ProShell width="narrow">
      <Seo title={t('pro.onboarding.metaTitle')} noindex />
      <div ref={topRef} className="scroll-mt-20 py-8 md:py-12">
        <h1 className="mb-6 font-sans text-sm font-semibold text-slate1">{t('pro.onboarding.title')}</h1>
        <Progress labels={labels} current={step} />

        {current === 'company' && (
          <CompanyStep
            initial={draft.company}
            onNext={(v) => {
              setDraft((d) => ({ ...d, company: v }));
              next();
            }}
          />
        )}
        {current === 'contact' && (
          <ContactStep
            initial={draft.contact}
            onBack={back}
            onNext={(v) => {
              setDraft((d) => ({ ...d, contact: v }));
              next();
            }}
          />
        )}
        {current === 'establishment' && (
          <EstablishmentStep
            initial={draft.establishment}
            isDealer={(draft.company.account_type ?? existing?.account_type) === 'dealer'}
            headOffice={existing ? { street: existing.street, postal_code: existing.postal_code, city: existing.city, phone: existing.phone } : draft.contact}
            onBack={step > 0 ? back : () => navigate('/pro/dashboard')}
            onChange={(patch) => setDraft((d) => ({ ...d, establishment: { ...d.establishment, ...patch } }))}
            onNext={(v) => {
              setDraft((d) => ({
                ...d,
                establishment:
                  v.mode === 'existing'
                    ? { ...d.establishment, mode: 'existing', existing: v.existing }
                    : { ...d.establishment, mode: 'new', newGarage: v.newGarage },
              }));
              next();
            }}
          />
        )}
        {current === 'review' && (
          <ReviewStep
            company={needsAccount ? parsed.company : null}
            contact={needsAccount ? parsed.contact : null}
            establishment={needsEstablishment ? parsed.establishment : null}
            onEdit={(s) => go(steps.indexOf(s))}
            onBack={back}
            onSubmit={onSubmit}
            busy={submit.isPending}
            error={error}
          />
        )}

        <p className="mt-8 text-center text-[13px] text-slate1 sm:text-left">{t('pro.onboarding.draftSaved')}</p>
      </div>
    </ProShell>
  );
}

/** Pre-fills from the existing account (needs_info / add flows) or the login email. */
function seedFrom(existing: ProAccount | undefined, email: string, locale: string): Partial<OnboardingDraft> {
  if (!existing) return { contact: { business_email: email, contact_locale: isLocale(locale) ? locale : 'fr' } };
  return {
    company: { account_type: existing.account_type, company_name: existing.company_name, bce_number: existing.bce_number },
    contact: {
      phone: existing.phone,
      business_email: existing.business_email,
      street: existing.street,
      postal_code: existing.postal_code,
      city: existing.city,
      contact_locale: isLocale(existing.contact_locale) ? existing.contact_locale : 'fr',
    },
  };
}
