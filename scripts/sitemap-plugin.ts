import { loadEnv, type Plugin } from 'vite';
import { STATIC_PATHS, sitemapXml, type SitemapEntry } from '../src/lib/sitemap';

/**
 * Emits dist/sitemap.xml on every `vite build`, whatever the host's build
 * command: static pages, then what the database holds (published articles,
 * garage pages, make and equipment pages that have garages). Reads the public
 * API with the publishable key, so it only sees what visitors see.
 * The database out of reach (offline build, sandbox): static pages only, with a
 * warning. A build never fails because of the sitemap.
 */
const PAGE = 1000; // PostgREST's default max rows on Supabase
const MAX_URLS = 45_000; // a sitemap file holds 50 000 URLs at most

type Row = Record<string, string | null>;

async function fetchRows(base: string, key: string, query: string, paginate: boolean): Promise<Row[]> {
  const rows: Row[] = [];
  for (let offset = 0; offset < MAX_URLS; offset += PAGE) {
    const res = await fetch(`${base}/rest/v1/${query}&limit=${PAGE}&offset=${offset}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`${query.split('?')[0]}: HTTP ${res.status}`);
    const page = (await res.json()) as Row[];
    rows.push(...page);
    if (!paginate || page.length < PAGE) break;
  }
  return rows;
}

export function sitemap(): Plugin {
  let env: Record<string, string> = {};
  return {
    name: 'safemarq-sitemap',
    apply: 'build',
    configResolved(config) {
      env = loadEnv(config.mode, config.envDir || process.cwd(), 'VITE_');
    },
    async generateBundle() {
      const entries: SitemapEntry[] = STATIC_PATHS.map((path) => ({ path }));
      const base = env.VITE_SUPABASE_URL;
      const key = env.VITE_SUPABASE_PUBLISHABLE_KEY;

      if (!base || !key) {
        this.warn('sitemap: VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY missing, static pages only');
      } else {
        const sources = [
          // Articles: one URL per slug, whatever the language.
          { label: 'articles', query: 'posts?select=slug,updated_at&status=eq.published&order=published_at.desc', paginate: true, path: (r: Row) => `/blog/${r.slug}` },
          { label: 'garages', query: 'garages?select=slug,updated_at&order=slug', paginate: true, path: (r: Row) => `/garage/${r.slug}` },
          // Make and equipment pages without garages are noindex: only those with at least one.
          { label: 'makes', query: 'makes?select=slug,garage_makes!inner(make)&garage_makes.limit=1&order=slug', paginate: false, path: (r: Row) => `/marques/${r.slug}` },
          { label: 'equipment', query: 'tool_brands?select=slug,garage_tool_brands!inner(brand)&garage_tool_brands.limit=1&order=slug', paginate: false, path: (r: Row) => `/outillage/${r.slug}` },
        ];
        const results = await Promise.allSettled(sources.map((s) => fetchRows(base, key, s.query, s.paginate)));
        results.forEach((result, i) => {
          const source = sources[i];
          if (result.status === 'rejected') {
            const reason = result.reason instanceof Error ? result.reason.message : String(result.reason);
            this.warn(`sitemap: ${source.label} left out (${reason})`);
            return;
          }
          for (const row of result.value) if (row.slug) entries.push({ path: source.path(row), lastmod: row.updated_at ?? null });
        });
      }

      if (entries.length > MAX_URLS) {
        this.warn(`sitemap: ${entries.length} URLs, only the first ${MAX_URLS} are listed (split into a sitemap index)`);
        entries.length = MAX_URLS;
      }
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemapXml(entries) });
    },
  };
}
