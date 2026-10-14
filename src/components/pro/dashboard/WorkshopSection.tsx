import { useId, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Lock, Search } from 'lucide-react';
import { toast } from 'sonner';
import { VehicleTabs } from '@/components/site/VehicleTabs';
import { GaragePicker, SectionTitle, useSelectedGarage } from '@/components/pro/dashboard/sections';
import { useGarageCatalog, useToggleCatalogItem } from '@/hooks/useCatalog';
import type { ProWorkspace } from '@/hooks/useProAccount';
import { useI18n } from '@/i18n/I18nProvider';
import { fold } from '@/lib/cities';
import { EQUIPMENT_KINDS, brandsOfKind } from '@/lib/equipment';
import { makePath } from '@/lib/links';
import { getMake, makesFor } from '@/lib/makes';
import { DEFAULT_VEHICLE, type VehicleSlug } from '@/lib/taxonomy';
import { cn } from '@/lib/utils';

type Owned = ProWorkspace['owned'][number];

const OFFICIAL_MAIL = 'pro@safemarq.com';

const chip = (on: boolean) =>
  cn(
    'inline-flex min-h-[40px] items-center gap-1.5 rounded-full border px-3.5 text-[14px] font-semibold transition-colors disabled:cursor-not-allowed',
    on ? 'border-strong bg-strong text-paper' : 'border-line bg-card text-ink hover:border-ink/40',
  );

/** Pro dashboard: the makes an establishment services and its workshop equipment. Saved on each tap. */
export function WorkshopSection({ owned }: { owned: Owned[] }) {
  const { t, tp, locale } = useI18n();
  const ids = useId();
  const { current, setId } = useSelectedGarage(owned);
  const garageId = current?.garage.id;
  const { data, isLoading, isError } = useGarageCatalog(garageId);
  const toggle = useToggleCatalogItem(garageId);
  const [vehicle, setVehicle] = useState<VehicleSlug>(DEFAULT_VEHICLE);
  const [filter, setFilter] = useState('');

  const makes = useMemo(() => new Map((data?.makes ?? []).map((m) => [m.make, m.official])), [data]);
  const tools = useMemo(() => new Set(data?.tools ?? []), [data]);
  const q = fold(filter);
  const shownMakes = makesFor(vehicle, locale).filter((m) => !q || fold(m.name).includes(q));
  // Declared makes of other vehicles stay visible as a reminder, at the top.
  const elsewhere = [...makes.keys()]
    .map((slug) => getMake(slug))
    .filter((m): m is NonNullable<typeof m> => !!m && !m.vehicles.includes(vehicle));

  if (!current) return <p className="rounded-xl border border-dashed border-line p-5 text-[15px] text-slate1">{t('pro.dashboard.noEstablishmentBody')}</p>;

  const flip = (kind: 'make' | 'tool', slug: string, on: boolean) =>
    toggle.mutate({ kind, slug, on }, { onError: () => toast.error(t('pro.workshop.error')) });

  const officialHref = `mailto:${OFFICIAL_MAIL}?subject=${encodeURIComponent(t('pro.workshop.officialMailSubject', { name: current.garage.name }))}`;

  return (
    <div>
      <SectionTitle action={<GaragePicker owned={owned} value={current.garage.id} onChange={setId} />}>{t('pro.dashboard.sections.workshop')}</SectionTitle>
      <p className="-mt-2 max-w-prose text-[15px] leading-relaxed text-slate1">{t('pro.workshop.lead')}</p>
      <p className="mt-2 text-[13px] text-slate1">{t('pro.workshop.autosave')}</p>

      {isLoading ? (
        <div className="mt-6 h-48 animate-pulse rounded-2xl bg-paper-2" aria-hidden />
      ) : isError ? (
        <p className="mt-6 text-[15px] text-slate1">{t('pro.dashboard.loadError')}</p>
      ) : (
        <>
          <section aria-labelledby={`${ids}-makes`} className="mt-8 rounded-2xl border border-line bg-card p-5 md:p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 id={`${ids}-makes`} className="font-display text-[22px] font-semibold text-strong">
                {t('pro.workshop.makesTitle')}
              </h3>
              <span className="text-[14px] text-slate1">{tp('pro.workshop.makesCount', makes.size)}</span>
            </div>

            <VehicleTabs value={vehicle} onChange={setVehicle} idBase={ids} size="sm" className="mt-4" />
            <div role="tabpanel" id={`${ids}-panel`} aria-labelledby={`${ids}-${vehicle}`} className="pt-4">
              <div className="relative max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate1" aria-hidden />
                <input
                  type="search"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder={t('pro.workshop.makesFilter')}
                  aria-label={t('pro.workshop.makesFilter')}
                  className="h-10 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-[15px] text-ink focus-visible:border-amber focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/30"
                />
              </div>

              {elsewhere.length > 0 && !q && (
                <ul className="mt-4 flex flex-wrap gap-2" aria-label={t('pro.workshop.makesTitle')}>
                  {elsewhere.map((m) => (
                    <MakeChip key={m.slug} name={m.name} on official={!!makes.get(m.slug)} onToggle={() => flip('make', m.slug, false)} />
                  ))}
                </ul>
              )}

              <ul className="mt-4 flex flex-wrap gap-2">
                {shownMakes.map((m) => {
                  const on = makes.has(m.slug);
                  return <MakeChip key={m.slug} name={m.name} on={on} official={!!makes.get(m.slug)} onToggle={() => flip('make', m.slug, !on)} />;
                })}
              </ul>
            </div>

            <div className="mt-6 border-t border-line pt-4 text-[14px] leading-relaxed text-slate1">
              <p className="max-w-prose">{t('pro.workshop.officialHow')}</p>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
                <a href={officialHref} className="font-semibold text-strong underline underline-offset-4">
                  {t('pro.workshop.officialMailLink')}
                </a>
                {makes.size > 0 && (
                  <Link to={makePath([...makes.keys()][0])} className="font-semibold text-strong underline underline-offset-4">
                    {t('pro.workshop.viewMakes')}
                  </Link>
                )}
              </div>
            </div>
          </section>

          <section aria-labelledby={`${ids}-tools`} className="mt-6 rounded-2xl border border-line bg-card p-5 md:p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 id={`${ids}-tools`} className="font-display text-[22px] font-semibold text-strong">
                {t('pro.workshop.equipmentTitle')}
              </h3>
              <span className="text-[14px] text-slate1">{tp('pro.workshop.equipmentCount', tools.size)}</span>
            </div>
            <dl className="mt-4 divide-y divide-line">
              {EQUIPMENT_KINDS.map((k) => (
                <div key={k} className="grid gap-2 py-4 md:grid-cols-[12rem_1fr] md:gap-6">
                  <dt className="text-[15px] font-semibold text-ink">{t(`equipment.kinds.${k}.label`)}</dt>
                  <dd>
                    <ul className="flex flex-wrap gap-2">
                      {brandsOfKind(k).map((b) => {
                        const on = tools.has(b.slug);
                        return (
                          <li key={b.slug}>
                            <button type="button" aria-pressed={on} onClick={() => flip('tool', b.slug, !on)} className={chip(on)}>
                              {on && <Check className="h-3.5 w-3.5" aria-hidden />}
                              {b.name}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        </>
      )}
    </div>
  );
}

function MakeChip({ name, on, official, onToggle }: { name: string; on: boolean; official: boolean; onToggle: () => void }) {
  const { t } = useI18n();
  return (
    <li>
      <button
        type="button"
        aria-pressed={on}
        onClick={onToggle}
        // Verified by SafeMarq: removing it by mistake would lose the verification.
        disabled={official}
        title={official ? t('pro.workshop.officialLocked') : undefined}
        className={chip(on)}
      >
        {official ? <Lock className="h-3.5 w-3.5" aria-hidden /> : on ? <Check className="h-3.5 w-3.5" aria-hidden /> : null}
        {name}
        {official && <span className="sr-only">, {t('pro.workshop.officialLocked')}</span>}
      </button>
    </li>
  );
}
