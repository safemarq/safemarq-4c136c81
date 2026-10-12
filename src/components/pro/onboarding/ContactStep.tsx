import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Field } from '@/components/pro/Field';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/i18n/I18nProvider';
import { LOCALES, LOCALE_META } from '@/i18n/config';
import { contactSchema, type ContactInput, type ContactValues } from '@/lib/pro/validation';
import { StepActions, StepHeader } from './parts';

export function ContactStep({
  initial,
  onNext,
  onBack,
}: {
  initial: Partial<ContactInput>;
  onNext: (v: ContactValues) => void;
  onBack: () => void;
}) {
  const { t, locale } = useI18n();
  const form = useForm<ContactInput, unknown, ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      phone: initial.phone ?? '',
      business_email: initial.business_email ?? '',
      street: initial.street ?? '',
      postal_code: initial.postal_code ?? '',
      city: initial.city ?? '',
      contact_locale: initial.contact_locale ?? locale,
    },
    mode: 'onTouched',
  });
  const { errors } = form.formState;

  return (
    <form onSubmit={form.handleSubmit(onNext)} noValidate>
      <StepHeader title={t('pro.onboarding.contact.title')} lead={t('pro.onboarding.contact.lead')} />
      <div className="space-y-5">
        <Field label={t('pro.onboarding.contact.phone')} hint={t('pro.onboarding.contact.phoneHint')} error={errors.phone?.message}>
          <Input type="tel" inputMode="tel" autoComplete="tel" placeholder="081 22 33 44" {...form.register('phone')} />
        </Field>
        <Field label={t('pro.onboarding.contact.businessEmail')} hint={t('pro.onboarding.contact.businessEmailHint')} error={errors.business_email?.message}>
          <Input type="email" inputMode="email" autoComplete="email" autoCapitalize="none" spellCheck={false} {...form.register('business_email')} />
        </Field>
        <Field label={t('pro.onboarding.contact.street')} error={errors.street?.message}>
          <Input autoComplete="street-address" placeholder={t('pro.onboarding.contact.streetPlaceholder')} {...form.register('street')} />
        </Field>
        <div className="grid grid-cols-[7.5rem_1fr] gap-3">
          <Field label={t('pro.onboarding.contact.postalCode')} error={errors.postal_code?.message}>
            <Input inputMode="numeric" autoComplete="postal-code" maxLength={4} className="num" {...form.register('postal_code')} />
          </Field>
          <Field label={t('pro.onboarding.contact.city')} error={errors.city?.message}>
            <Input autoComplete="address-level2" {...form.register('city')} />
          </Field>
        </div>
        <Field label={t('pro.onboarding.contact.contactLanguage')}>
          <select
            className="flex h-12 w-full rounded-lg border border-input bg-card px-3 text-base text-foreground focus-visible:border-amber focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/30 md:h-11 md:text-[15px]"
            {...form.register('contact_locale')}
          >
            {LOCALES.map((l) => (
              <option key={l} value={l}>
                {LOCALE_META[l].label}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <StepActions onBack={onBack} primaryLabel={t('common.continue')} />
    </form>
  );
}
