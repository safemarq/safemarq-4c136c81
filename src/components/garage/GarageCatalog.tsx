import { Link } from 'react-router-dom';
import { OfficialTag } from '@/components/ranking/GarageRow';
import { useGarageCatalog } from '@/hooks/useCatalog';
import { useI18n } from '@/i18n/I18nProvider';
import { EQUIPMENT_KINDS, getToolBrand } from '@/lib/equipment';
import { makePath, toolPath } from '@/lib/links';
import { getMake } from '@/lib/makes';

/**
 * What the establishment services and works with, as declared by its owner
 * ("official dealer" is checked by SafeMarq). Nothing shows until there is something.
 */
export function GarageCatalog({ garageId, citySlug }: { garageId: string; citySlug?: string | null }) {
  const { t, locale } = useI18n();
  const { data } = useGarageCatalog(garageId);
  if (!data || (data.makes.length === 0 && data.tools.length === 0)) return null;

  const collator = new Intl.Collator(locale, { sensitivity: 'base' });
  const makes = data.makes
    .map((m) => ({ ...m, info: getMake(m.make) }))
    .filter((m) => m.info)
    // Official makes first: they say the most about the place.
    .sort((a, b) => Number(b.official) - Number(a.official) || collator.compare(a.info!.name, b.info!.name));
  const kinds = EQUIPMENT_KINDS.map((k) => ({
    kind: k,
    brands: data.tools
      .map((slug) => getToolBrand(slug))
      .filter((b): b is NonNullable<typeof b> => !!b && b.kinds.includes(k))
      .sort((a, b) => collator.compare(a.name, b.name)),
  })).filter((g) => g.brands.length > 0);
  // A brand listed under its first matching kind only.
  const seen = new Set<string>();
  for (const g of kinds) g.brands = g.brands.filter((b) => (seen.has(b.slug) ? false : (seen.add(b.slug), true)));
  const shownKinds = kinds.filter((g) => g.brands.length > 0);

  return (
    <div className="grid gap-8 border-t border-line py-7 md:grid-cols-2 md:gap-12">
      {makes.length > 0 && (
        <section aria-labelledby="garage-makes">
          <h2 id="garage-makes" className="font-display text-[22px] font-semibold text-strong">
            {t('garage.makesTitle')}
          </h2>
          <ul className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2.5">
            {makes.map((m) => (
              <li key={m.make} className="flex flex-wrap items-center gap-2">
                <Link to={makePath(m.make, citySlug)} className="text-[17px] font-semibold text-ink underline-offset-4 hover:text-strong hover:underline">
                  {m.info!.name}
                </Link>
                {m.official && <OfficialTag label={t('garage.officialNote')} />}
              </li>
            ))}
          </ul>
        </section>
      )}
      {shownKinds.length > 0 && (
        <section aria-labelledby="garage-equipment">
          <h2 id="garage-equipment" className="font-display text-[22px] font-semibold text-strong">
            {t('garage.equipmentTitle')}
          </h2>
          <dl className="mt-3 space-y-2.5">
            {shownKinds.map((g) => (
              <div key={g.kind} className="grid grid-cols-[minmax(0,10rem)_1fr] gap-3">
                <dt className="text-[15px] text-slate1">{t(`equipment.kinds.${g.kind}.label`)}</dt>
                <dd className="flex flex-wrap gap-x-4 gap-y-1">
                  {g.brands.map((b) => (
                    <Link key={b.slug} to={toolPath(b.slug)} className="text-[16px] font-semibold text-ink underline-offset-4 hover:text-strong hover:underline">
                      {b.name}
                    </Link>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>
  );
}
