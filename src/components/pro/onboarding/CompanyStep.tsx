import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, CheckCircle2, Wrench } from 'lucide-react';
import { Field } from '@/components/pro/Field';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/i18n/I18nProvider';
import { companySchema, formatBce, isBceChecksumValid, normalizeBce, type CompanyInput, type CompanyValues } from '@/lib/pro/validation';
import { ChoiceCard, StepActions, StepHeader } from './parts';

export function CompanyStep({ initial, onNext }: { initial: Partial<CompanyInput>; onNext: (v: CompanyValues) => void }) {
  const { t } = useI18n();
  const form = useForm<CompanyInput, unknown, CompanyValues>({
    resolver: zodResolver(companySchema),
    defaultValues: { account_type: initial.account_type, company_name: initial.company_name ?? '', bce_number: initial.bce_number ?? '' },
    mode: 'onTouched',
  });
  const { errors } = form.formState;
  const bce = normalizeBce(form.watch('bce_number') ?? '');
  const bceOk = isBceChecksumValid(bce);

  return (
    <form onSubmit={form.handleSubmit(onNext)} noValidate>
      <StepHeader title={t('pro.onboarding.company.title')} lead={t('pro.onboarding.company.lead')} />

      <fieldset className="mb-6">
        <legend className="field-label">{t('pro.onboarding.company.typeLabel')}</legend>
        <Controller
          control={form.control}
          name="account_type"
          render={({ field }) => (
            <div role="radiogroup" className="grid gap-3 sm:grid-cols-2">
              <ChoiceCard
                checked={field.value === 'independent_garage'}
                onSelect={() => field.onChange('independent_garage')}
                title={t('pro.onboarding.company.typeGarage')}
                hint={t('pro.onboarding.company.typeGarageHint')}
                icon={<Wrench className="h-5 w-5" aria-hidden />}
              />
              <ChoiceCard
                checked={field.value === 'dealer'}
                onSelect={() => field.onChange('dealer')}
                title={t('pro.onboarding.company.typeDealer')}
                hint={t('pro.onboarding.company.typeDealerHint')}
                icon={<Building2 className="h-5 w-5" aria-hidden />}
              />
            </div>
          )}
        />
        {errors.account_type?.message && (
          <p className="field-error" role="alert">
            {t('validation.required')}
          </p>
        )}
      </fieldset>

      <div className="space-y-5">
        <Field label={t('pro.onboarding.company.legalName')} hint={t('pro.onboarding.company.legalNameHint')} error={errors.company_name?.message}>
          <Input autoComplete="organization" {...form.register('company_name')} />
        </Field>

        <Field
          label={t('pro.onboarding.company.bce')}
          hint={
            bceOk ? (
              <span className="inline-flex items-center gap-1.5 font-semibold text-teal">
                <CheckCircle2 className="h-4 w-4" aria-hidden />
                {t('pro.onboarding.company.bceValid')} · {formatBce(bce)}
              </span>
            ) : (
              t('pro.onboarding.company.bceHint')
            )
          }
          error={errors.bce_number?.message}
        >
          <Input inputMode="numeric" autoComplete="off" placeholder="0123.456.749" {...form.register('bce_number')} />
        </Field>
      </div>

      <StepActions primaryLabel={t('common.continue')} />
    </form>
  );
}
