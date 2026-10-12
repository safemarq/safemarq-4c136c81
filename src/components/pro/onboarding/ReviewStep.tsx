import { useState, type ReactNode } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';
import { tradeKey } from '@/i18n/keys';
import { LOCALE_META, isLocale } from '@/i18n/config';
import type { MessageKey } from '@/i18n/types';
import { formatBce, formatPhone, type CompanyValues, type ContactValues, type NewGarageValues } from '@/lib/pro/validation';
import type { ClaimableGarage } from '@/hooks/useProAccount';
import { StepActions, StepHeader } from './parts';

interface Props {
  company: CompanyValues | null;
  contact: ContactValues | null;
  establishment: { mode: 'existing'; existing: ClaimableGarage } | { mode: 'new'; newGarage: NewGarageValues } | null;
  onEdit: (step: 'company' | 'contact' | 'establishment') => void;
  onBack: () => void;
  onSubmit: () => void;
  busy: boolean;
  error: MessageKey | null;
}

export function ReviewStep({ company, contact, establishment, onEdit, onBack, onSubmit, busy, error }: Props) {
  const { t } = useI18n();
  const [certified, setCertified] = useState(false);
  const [showCertifyError, setShowCertifyError] = useState(false);

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (!certified) return setShowCertifyError(true);
        onSubmit();
      }}
    >
      <StepHeader title={t('pro.onboarding.review.title')} lead={t('pro.onboarding.review.lead')} />

      <div className="space-y-4">
        {company && (
          <Summary title={t('pro.onboarding.review.companySection')} onEdit={() => onEdit('company')}>
            <Row label={t('pro.onboarding.company.typeLabel')}>
              {company.account_type === 'dealer' ? t('pro.onboarding.company.typeDealer') : t('pro.onboarding.company.typeGarage')}
            </Row>
            <Row label={t('pro.onboarding.company.legalName')}>{company.company_name}</Row>
            <Row label={t('pro.onboarding.company.bce')}>
              {formatBce(company.bce_number)}
            </Row>
          </Summary>
        )}

        {contact && (
          <Summary title={t('pro.onboarding.review.contactSection')} onEdit={() => onEdit('contact')}>
            <Row label={t('pro.onboarding.contact.phone')}>
              {formatPhone(contact.phone)}
            </Row>
            <Row label={t('pro.onboarding.contact.businessEmail')}>{contact.business_email}</Row>
            <Row label={t('pro.onboarding.contact.street')}>
              {contact.street}, {contact.postal_code} {contact.city}
            </Row>
            <Row label={t('pro.onboarding.contact.contactLanguage')}>
              {isLocale(contact.contact_locale) ? LOCALE_META[contact.contact_locale].label : contact.contact_locale}
            </Row>
          </Summary>
        )}

        {establishment && (
          <Summary title={t('pro.onboarding.review.establishmentSection')} onEdit={() => onEdit('establishment')}>
            {establishment.mode === 'existing' ? (
              <>
                <Row label={t('pro.onboarding.review.existingListing')}>{establishment.existing.name}</Row>
                <Row label={t('pro.onboarding.establishment.street')}>{establishment.existing.address}</Row>
              </>
            ) : (
              <>
                <Row label={t('pro.onboarding.review.newListing')}>{establishment.newGarage.name}</Row>
                <Row label={t('pro.onboarding.establishment.street')}>
                  {establishment.newGarage.street}, {establishment.newGarage.postal_code} {establishment.newGarage.city}
                </Row>
                <Row label={t('pro.onboarding.establishment.trades')}>
                  {establishment.newGarage.trades.map((s) => t(tradeKey(s))).join(', ')}
                </Row>
              </>
            )}
          </Summary>
        )}
      </div>

      <section className="mt-8 rounded-xl bg-paper-2 p-5">
        <h3 className="flex items-center gap-2 font-sans text-base font-semibold text-ink">
          <ShieldCheck className="h-5 w-5 text-teal" aria-hidden />
          {t('pro.onboarding.review.whatWeCheck')}
        </h3>
        <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-slate1">
          {(['check1', 'check2', 'check3'] as const).map((k) => (
            <li key={k} className="flex gap-2.5">
              <span aria-hidden className="mt-[9px] h-1.5 w-1.5 shrink-0 bg-amber" />
              {t(`pro.onboarding.review.${k}`)}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[15px] font-semibold text-ink">{t('pro.onboarding.review.delay')}</p>
      </section>

      <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-card p-4">
        <input
          type="checkbox"
          checked={certified}
          onChange={(e) => {
            setCertified(e.target.checked);
            if (e.target.checked) setShowCertifyError(false);
          }}
          className="mt-0.5 h-5 w-5 shrink-0 accent-[hsl(var(--navy-900))] dark:accent-[hsl(var(--amber))]"
          aria-invalid={showCertifyError || undefined}
          aria-describedby={showCertifyError ? 'certify-error' : undefined}
        />
        <span className="text-[15px] leading-snug text-ink">{t('pro.onboarding.review.certify')}</span>
      </label>
      {showCertifyError && (
        <p id="certify-error" className="field-error" role="alert">
          {t('validation.certify')}
        </p>
      )}

      {error && (
        <p role="alert" className="mt-5 rounded-lg border border-destructive/30 bg-destructive/5 px-3.5 py-3 text-sm font-medium text-destructive">
          {t(error)}
        </p>
      )}

      <StepActions onBack={onBack} busy={busy} primaryLabel={busy ? t('pro.onboarding.review.submitting') : t('pro.onboarding.review.submit')} />
    </form>
  );
}

function Summary({ title, onEdit, children }: { title: string; onEdit: () => void; children: ReactNode }) {
  const { t } = useI18n();
  return (
    <section className="card-warm p-4 md:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="font-sans text-base font-semibold text-ink">{title}</h3>
        <button type="button" onClick={onEdit} className="text-sm font-semibold text-strong underline underline-offset-4" aria-label={`${t('common.edit')} : ${title}`}>
          {t('common.edit')}
        </button>
      </div>
      <dl className="space-y-2.5">{children}</dl>
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-0.5 sm:grid-cols-[12rem_1fr] sm:gap-4">
      <dt className="text-sm text-slate1">{label}</dt>
      <dd className="break-words text-[15px] text-ink">{children}</dd>
    </div>
  );
}
