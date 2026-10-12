import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, MapPin, Plus, Search, Store } from 'lucide-react';
import { Field } from '@/components/pro/Field';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/i18n/I18nProvider';
import { tradeKey } from '@/i18n/keys';
import { useClaimableGarageSearch, type ClaimableGarage } from '@/hooks/useProAccount';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { TRADES } from '@/lib/trades';
import { newGarageSchema, type ContactInput, type NewGarageInput, type NewGarageValues } from '@/lib/pro/validation';
import { cn } from '@/lib/utils';
import type { EstablishmentMode, OnboardingDraft } from './draft';
import { ChoiceCard, StepActions, StepHeader } from './parts';

interface Props {
  initial: OnboardingDraft['establishment'];
  isDealer: boolean;
  headOffice: Partial<ContactInput>;
  onNext: (v: { mode: 'existing'; existing: ClaimableGarage } | { mode: 'new'; newGarage: NewGarageValues }) => void;
  onBack: () => void;
  onChange: (patch: Partial<OnboardingDraft['establishment']>) => void;
}

export function EstablishmentStep({ initial, isDealer, headOffice, onNext, onBack, onChange }: Props) {
  const { t } = useI18n();
  const [mode, setMode] = useState<EstablishmentMode>(initial.mode);
  const [selected, setSelected] = useState<ClaimableGarage | null>(initial.existing);
  const [missingSelection, setMissingSelection] = useState(false);

  const pickMode = (m: EstablishmentMode) => {
    setMode(m);
    onChange({ mode: m });
  };

  return (
    <div>
      <StepHeader title={t('pro.onboarding.establishment.title')} lead={t('pro.onboarding.establishment.lead')} />

      <div role="radiogroup" className="mb-7 grid gap-3 sm:grid-cols-2">
        <ChoiceCard
          checked={mode === 'existing'}
          onSelect={() => pickMode('existing')}
          title={t('pro.onboarding.establishment.modeExisting')}
          icon={<Search className="h-5 w-5" aria-hidden />}
        />
        <ChoiceCard
          checked={mode === 'new'}
          onSelect={() => pickMode('new')}
          title={t('pro.onboarding.establishment.modeNew')}
          icon={<Plus className="h-5 w-5" aria-hidden />}
        />
      </div>

      {mode === 'existing' ? (
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (!selected) return setMissingSelection(true);
            onNext({ mode: 'existing', existing: selected });
          }}
        >
          {selected ? (
            <div className="rounded-xl border border-strong bg-card p-4">
              <p className="text-sm font-semibold text-slate1">{t('pro.onboarding.establishment.selected')}</p>
              <p className="mt-1 text-lg font-semibold text-ink">{selected.name}</p>
              <p className="mt-0.5 flex items-start gap-1.5 text-[15px] text-slate1">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                {selected.address}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelected(null);
                  onChange({ existing: null });
                }}
                className="mt-3 text-[15px] font-semibold text-strong underline underline-offset-4"
              >
                {t('pro.onboarding.establishment.change')}
              </button>
            </div>
          ) : (
            <GarageSearch
              onPick={(g) => {
                setSelected(g);
                setMissingSelection(false);
                onChange({ existing: g });
              }}
              onAddAsNew={() => pickMode('new')}
              error={missingSelection ? t('validation.required') : undefined}
            />
          )}
          <StepActions onBack={onBack} primaryLabel={t('common.continue')} />
        </form>
      ) : (
        <NewGarageForm
          initial={initial.newGarage}
          isDealer={isDealer}
          headOffice={headOffice}
          onBack={onBack}
          onChange={(v) => onChange({ newGarage: v })}
          onSubmit={(v) => onNext({ mode: 'new', newGarage: v })}
        />
      )}
    </div>
  );
}

function GarageSearch({ onPick, onAddAsNew, error }: { onPick: (g: ClaimableGarage) => void; onAddAsNew: () => void; error?: string }) {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const debounced = useDebouncedValue(query, 250);
  const { data = [], isFetching, isError, isFetched } = useClaimableGarageSearch(debounced);
  const ready = debounced.trim().length >= 2;

  return (
    <div>
      <Field label={t('pro.onboarding.establishment.searchLabel')} hint={t('pro.onboarding.establishment.searchHint')} error={error}>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate1" aria-hidden />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('pro.onboarding.establishment.searchPlaceholder')}
            className="pl-10 pr-10"
            autoComplete="off"
            aria-controls="garage-results"
          />
          {isFetching && <Loader2 className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate1" aria-hidden />}
        </div>
      </Field>

      <div id="garage-results" aria-live="polite" className="mt-3">
        {ready && isError && <p className="text-[15px] text-destructive">{t('pro.onboarding.establishment.searchError')}</p>}
        {ready && !isError && isFetched && data.length === 0 && !isFetching && (
          <div className="rounded-xl border border-dashed border-line p-4">
            <p className="text-[15px] text-slate1">{t('pro.onboarding.establishment.searchEmpty')}</p>
            <button type="button" onClick={onAddAsNew} className="mt-3 inline-flex items-center gap-2 text-[15px] font-semibold text-strong underline underline-offset-4">
              <Plus className="h-4 w-4" aria-hidden />
              {t('pro.onboarding.establishment.addAsNew')}
            </button>
          </div>
        )}
        {ready && data.length > 0 && (
          <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-card">
            {data.map((g) => (
              <li key={g.id}>
                <button
                  type="button"
                  disabled={g.managed}
                  onClick={() => onPick(g)}
                  className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-paper-2 disabled:cursor-not-allowed disabled:opacity-55"
                >
                  <Store className="mt-0.5 h-5 w-5 shrink-0 text-slate1" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-semibold text-ink">{g.name}</span>
                    <span className="block truncate text-sm text-slate1">{g.address}</span>
                  </span>
                  {g.managed && <span className="shrink-0 rounded-md bg-paper-2 px-2 py-1 text-xs font-semibold text-slate1">{t('pro.onboarding.establishment.alreadyManaged')}</span>}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function NewGarageForm({
  initial,
  isDealer,
  headOffice,
  onSubmit,
  onBack,
  onChange,
}: {
  initial: Partial<NewGarageInput>;
  isDealer: boolean;
  headOffice: Partial<ContactInput>;
  onSubmit: (v: NewGarageValues) => void;
  onBack: () => void;
  onChange: (v: Partial<NewGarageInput>) => void;
}) {
  const { t } = useI18n();
  const form = useForm<NewGarageInput, unknown, NewGarageValues>({
    resolver: zodResolver(newGarageSchema),
    defaultValues: {
      name: initial.name ?? '',
      street: initial.street ?? '',
      postal_code: initial.postal_code ?? '',
      city: initial.city ?? '',
      phone: initial.phone ?? '',
      website: initial.website ?? '',
      brand: initial.brand ?? '',
      trades: initial.trades ?? [],
    },
    mode: 'onTouched',
  });
  const { errors } = form.formState;

  const copyHeadOffice = () => {
    form.setValue('street', headOffice.street ?? '', { shouldValidate: true });
    form.setValue('postal_code', headOffice.postal_code ?? '', { shouldValidate: true });
    form.setValue('city', headOffice.city ?? '', { shouldValidate: true });
    if (!form.getValues('phone')) form.setValue('phone', headOffice.phone ?? '');
  };

  return (
    <form
      noValidate
      onBlur={() => onChange(form.getValues())}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <div className="space-y-5">
        <Field label={t('pro.onboarding.establishment.name')} error={errors.name?.message}>
          <Input autoComplete="organization" {...form.register('name')} />
        </Field>

        {headOffice.street && (
          <button type="button" onClick={copyHeadOffice} className="text-[15px] font-semibold text-strong underline underline-offset-4">
            {t('pro.onboarding.establishment.sameAsCompany')}
          </button>
        )}

        <Field label={t('pro.onboarding.establishment.street')} error={errors.street?.message}>
          <Input autoComplete="street-address" {...form.register('street')} />
        </Field>
        <div className="grid grid-cols-[7.5rem_1fr] gap-3">
          <Field label={t('pro.onboarding.establishment.postalCode')} error={errors.postal_code?.message}>
            <Input inputMode="numeric" autoComplete="postal-code" maxLength={4} className="num" {...form.register('postal_code')} />
          </Field>
          <Field label={t('pro.onboarding.establishment.city')} error={errors.city?.message}>
            <Input autoComplete="address-level2" {...form.register('city')} />
          </Field>
        </div>
        <Field label={t('pro.onboarding.establishment.phone')} optional error={errors.phone?.message}>
          <Input type="tel" inputMode="tel" autoComplete="tel" {...form.register('phone')} />
        </Field>
        <Field label={t('pro.onboarding.establishment.website')} optional error={errors.website?.message}>
          <Input type="url" inputMode="url" autoCapitalize="none" spellCheck={false} placeholder={t('pro.onboarding.establishment.websitePlaceholder')} {...form.register('website')} />
        </Field>
        {isDealer && (
          <Field label={t('pro.onboarding.establishment.brand')} optional error={errors.brand?.message}>
            <Input placeholder={t('pro.onboarding.establishment.brandPlaceholder')} {...form.register('brand')} />
          </Field>
        )}

        <fieldset>
          <legend className="field-label">{t('pro.onboarding.establishment.trades')}</legend>
          <p className="field-hint mb-3 mt-0">{t('pro.onboarding.establishment.tradesHint')}</p>
          <Controller
            control={form.control}
            name="trades"
            render={({ field }) => {
              const value = field.value ?? [];
              return (
                <div className="flex flex-wrap gap-2">
                  {TRADES.map((tr) => {
                    const on = value.includes(tr.slug);
                    return (
                      <button
                        key={tr.slug}
                        type="button"
                        aria-pressed={on}
                        onClick={() => {
                          const next = on ? value.filter((s) => s !== tr.slug) : [...value, tr.slug];
                          field.onChange(next);
                          onChange({ ...form.getValues(), trades: next });
                        }}
                        className={cn(
                          'min-h-[40px] rounded-full border px-3.5 text-sm font-medium transition-colors',
                          on ? 'border-strong bg-strong text-paper' : 'border-line bg-card text-ink hover:border-ink/30',
                        )}
                      >
                        {t(tradeKey(tr.slug))}
                      </button>
                    );
                  })}
                </div>
              );
            }}
          />
          {errors.trades?.message && (
            <p className="field-error" role="alert">
              {t('validation.tradesMin')}
            </p>
          )}
        </fieldset>
      </div>
      <StepActions onBack={onBack} primaryLabel={t('common.continue')} />
    </form>
  );
}
