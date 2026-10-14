/**
 * sitemap.xml, written at build time (scripts/sitemap-plugin.ts). Pure code:
 * no imports, so the Vite config can load it without the app's path aliases.
 */
export const SITE_ORIGIN = 'https://safemarq.com';

/** Public pages that always exist. Search, account and pro tools are left out (noindex). */
export const STATIC_PATHS: readonly string[] = [
  '/',
  '/about',
  '/pro',
  '/pricing',
  '/marques',
  '/outillage',
  '/blog',
  '/legal/terms',
  '/legal/privacy',
  '/legal/cookies',
  '/legal/mentions',
];

export interface SitemapEntry {
  path: string;
  /** ISO date or timestamp; only the day is kept. */
  lastmod?: string | null;
}

const escapeXml = (s: string): string =>
  s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c] as string);

/** One <url> per path (first occurrence wins), paths must start with "/". */
export function sitemapXml(entries: readonly SitemapEntry[], origin: string = SITE_ORIGIN): string {
  const seen = new Set<string>();
  const urls: string[] = [];
  for (const { path, lastmod } of entries) {
    if (!path.startsWith('/') || seen.has(path)) continue;
    seen.add(path);
    const day = lastmod && /^\d{4}-\d{2}-\d{2}/.test(lastmod) ? lastmod.slice(0, 10) : null;
    urls.push(`  <url><loc>${escapeXml(encodeURI(origin + path))}</loc>${day ? `<lastmod>${day}</lastmod>` : ''}</url>`);
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}
