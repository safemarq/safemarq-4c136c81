import { useI18n } from '@/i18n/I18nProvider';
import { cn } from '@/lib/utils';

interface Props {
  hours: { day: string; open: string; close: string }[];
}

/** Stored day names are French; JS weekdays start on Sunday (0). */
const DAY_INDEX: Record<string, number> = { dimanche: 0, lundi: 1, mardi: 2, mercredi: 3, jeudi: 4, vendredi: 5, samedi: 6 };

/** Opening hours, today highlighted, day names in the visitor's language. */
export default function GarageHours({ hours }: Props) {
  const { t, locale } = useI18n();
  const today = new Date().getDay();
  const weekday = new Intl.DateTimeFormat(locale, { weekday: 'long' });
  // 2023-01-01 was a Sunday: day i of that week has index i.
  const dayName = (i: number) => {
    const name = weekday.format(new Date(2023, 0, 1 + i));
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <section aria-labelledby="hours-title" className="border-t border-line pt-7">
      <h2 id="hours-title" className="font-display text-[22px] font-semibold text-strong">
        {t('garage.hoursTitle')}
      </h2>
      <dl className="mt-3 max-w-md divide-y divide-line">
        {hours.map((h) => {
          const index = DAY_INDEX[h.day.trim().toLowerCase()];
          const isToday = index === today;
          const closed = !h.open;
          return (
            <div key={h.day} className={cn('flex items-center justify-between gap-4 py-2 text-[15px]', isToday && 'font-semibold')}>
              <dt className={isToday ? 'text-strong' : 'text-slate1'}>
                {index === undefined ? h.day : dayName(index)}
                {isToday && <span className="ml-2 text-[13px] font-semibold text-teal">{t('garage.today')}</span>}
              </dt>
              <dd className={cn('num', closed ? 'text-slate1' : 'text-ink')}>{closed ? t('garage.closed') : `${h.open} – ${h.close}`}</dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
