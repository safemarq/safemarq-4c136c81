import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, LogIn } from 'lucide-react';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Field } from '@/components/pro/Field';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateQuoteRequest } from '@/hooks/useQuoteRequests';
import { useI18n } from '@/i18n/I18nProvider';
import { tradeLabelKey, vehicleKey } from '@/i18n/keys';
import type { MessageKey } from '@/i18n/types';
import { DEFAULT_VEHICLE, FEATURED_TRADES, VEHICLES, type VehicleSlug } from '@/lib/taxonomy';
import { vehicleIcon } from '@/lib/tradeMeta';
import { cn } from '@/lib/utils';

const OTHER = 'autre';

const schema = z.object({
  plate: z.string().trim().max(16, { message: 'quote.errorPlate' }),
  description: z.string().trim().min(10, { message: 'quote.errorDescription' }).max(2000, { message: 'quote.errorDescriptionLong' }),
  name: z.string().trim().max(80, { message: 'quote.errorName' }),
  phone: z
    .string()
    .trim()
    .regex(/^(\+?[0-9 ./()-]{6,24})?$/, { message: 'quote.errorPhone' }),
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  garageId: string;
  garageName: string;
}

/**
 * Quote request to one establishment. Sent from an account, so the garage can
 * answer: its email comes from the account, name and phone are optional.
 */
export function QuoteDialog({ open, onOpenChange, garageId, garageName }: Props) {
  const { t } = useI18n();
  const { user } = useAuth();
  const { pathname } = useLocation();
  const create = useCreateQuoteRequest();

  const [vehicle, setVehicle] = useState<VehicleSlug>(DEFAULT_VEHICLE);
  const [service, setService] = useState<string>(FEATURED_TRADES[DEFAULT_VEHICLE][0]);
  const [plate, setPlate] = useState('');
  const [description, setDescription] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Partial<Record<'plate' | 'description' | 'name' | 'phone' | 'form', MessageKey>>>({});
  const [sent, setSent] = useState(false);

  // A fresh form each time the dialog opens (after a request was sent).
  useEffect(() => {
    if (open && sent) {
      setSent(false);
      setDescription('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const pickVehicle = (v: VehicleSlug) => {
    setVehicle(v);
    setService((s) => (s === OTHER || (FEATURED_TRADES[v] as readonly string[]).includes(s) ? s : FEATURED_TRADES[v][0]));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ plate, description, name, phone });
    if (!parsed.success) {
      const next: typeof errors = {};
      for (const issue of parsed.error.issues) next[issue.path[0] as keyof typeof errors] ??= issue.message as MessageKey;
      return setErrors(next);
    }
    setErrors({});
    try {
      await create.mutateAsync({
        garage_id: garageId,
        user_id: user?.id,
        plate: parsed.data.plate.toUpperCase(),
        vehicle_type: vehicle,
        service_type: service,
        description: parsed.data.description,
        contact_name: parsed.data.name || null,
        contact_phone: parsed.data.phone || null,
      });
      setSent(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      setErrors({ form: /RATE_LIMITED/.test(message) ? 'quote.errorRate' : 'common.errorGeneric' });
    }
  };

  const back = `${pathname}#devis`;
  const chip = (on: boolean) =>
    cn(
      'inline-flex min-h-[40px] items-center gap-1.5 rounded-full border px-3.5 text-[14px] font-semibold transition-colors',
      on ? 'border-strong bg-strong text-paper' : 'border-line bg-card text-ink hover:border-ink/40',
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        closeLabel={t('common.close')}
        className="max-h-[92dvh] max-w-xl gap-0 overflow-y-auto rounded-2xl border-line bg-card p-5 sm:rounded-2xl md:p-7"
      >
        <DialogTitle className="pr-8 font-display text-[26px] font-semibold leading-tight text-strong">{t('quote.title')}</DialogTitle>
        <DialogDescription className="mt-1 text-[15px] text-slate1">{t('quote.to', { name: garageName })}</DialogDescription>

        {!user ? (
          <div className="mt-6">
            <LogIn className="h-7 w-7 text-strong" aria-hidden />
            <p className="mt-3 text-[16px] leading-relaxed text-ink">{t('quote.signInBody')}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link to={`/auth?retour=${encodeURIComponent(back)}`} className="btn-amber min-h-[48px] px-5" onClick={() => onOpenChange(false)}>
                {t('quote.signIn')}
              </Link>
              <Link to={`/auth?retour=${encodeURIComponent(back)}&mode=inscription`} className="btn-ghost-navy min-h-[48px] px-5" onClick={() => onOpenChange(false)}>
                {t('quote.signUp')}
              </Link>
            </div>
          </div>
        ) : sent ? (
          <div className="mt-6" role="status">
            <CheckCircle2 className="h-8 w-8 text-teal" aria-hidden />
            <p className="mt-3 font-display text-[22px] font-semibold text-strong">{t('quote.sentTitle')}</p>
            <p className="mt-2 text-[16px] leading-relaxed text-slate1">{t('quote.sentBody', { name: garageName })}</p>
            <button type="button" onClick={() => onOpenChange(false)} className="btn-ghost-navy mt-6 min-h-[44px] px-5">
              {t('common.close')}
            </button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="mt-6 space-y-5">
            <fieldset>
              <legend className="mb-2 text-sm font-semibold text-ink">{t('search.vehicleLabel')}</legend>
              <div className="flex flex-wrap gap-2">
                {VEHICLES.map((v) => {
                  const Icon = vehicleIcon(v);
                  return (
                    <button key={v} type="button" aria-pressed={v === vehicle} onClick={() => pickVehicle(v)} className={chip(v === vehicle)}>
                      <Icon className="h-4 w-4" aria-hidden />
                      {t(vehicleKey(v, 'short'))}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-2 text-sm font-semibold text-ink">{t('quote.service')}</legend>
              <div className="flex flex-wrap gap-2">
                {[...FEATURED_TRADES[vehicle], OTHER].map((s) => (
                  <button key={s} type="button" aria-pressed={s === service} onClick={() => setService(s)} className={chip(s === service)}>
                    {s === OTHER ? t('quote.other') : t(tradeLabelKey(s, vehicle))}
                  </button>
                ))}
              </div>
            </fieldset>

            <Field label={t('quote.description')} hint={t('quote.descriptionHint')} error={errors.description}>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} maxLength={2000} />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={t('quote.plate')} optional error={errors.plate}>
                <Input value={plate} onChange={(e) => setPlate(e.target.value)} maxLength={16} autoCapitalize="characters" spellCheck={false} />
              </Field>
              <Field label={t('quote.phone')} optional hint={t('quote.phoneHint')} error={errors.phone}>
                <Input type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={24} />
              </Field>
            </div>
            <Field label={t('quote.name')} optional error={errors.name}>
              <Input autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
            </Field>

            <p className="text-[13px] leading-relaxed text-slate1">{t('quote.privacy', { name: garageName, email: user.email ?? '' })}</p>

            {errors.form && (
              <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 px-3.5 py-3 text-sm font-medium text-destructive">
                {t(errors.form)}
              </p>
            )}

            <button type="submit" className="btn-amber min-h-[52px] w-full" disabled={create.isPending}>
              {create.isPending ? t('pro.auth.submitting') : t('quote.send')}
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
