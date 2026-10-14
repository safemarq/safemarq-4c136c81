import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';
import { cn } from '@/lib/utils';

export interface Crumb {
  label: string;
  /** Omitted on the current page (the last crumb). */
  to?: string;
}

/**
 * Trail at the top of a page. Also emitted as schema.org BreadcrumbList by
 * `breadcrumbJsonLd` so search results can show it.
 */
export function Breadcrumbs({ items, onDark = false, className }: { items: Crumb[]; onDark?: boolean; className?: string }) {
  const { t } = useI18n();
  return (
    <nav aria-label={t('ranking.breadcrumbLabel')} className={cn('text-sm', onDark ? 'text-chalk/75' : 'text-slate1', className)}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <Fragment key={`${c.label}-${i}`}>
              <li>
                {c.to && !last ? (
                  <Link to={c.to} className={cn('hover:underline', onDark ? 'hover:text-chalk' : 'hover:text-strong')}>
                    {c.label}
                  </Link>
                ) : (
                  <span aria-current={last ? 'page' : undefined} className={cn(last && 'font-semibold', last && (onDark ? 'text-chalk' : 'text-ink'))}>
                    {c.label}
                  </span>
                )}
              </li>
              {!last && (
                <li aria-hidden>
                  <ChevronRight className="h-3.5 w-3.5" />
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

export function breadcrumbJsonLd(items: Crumb[], origin = 'https://safemarq.com') {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.label,
      ...(c.to ? { item: `${origin}${c.to}` } : {}),
    })),
  };
}
