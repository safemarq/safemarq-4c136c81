import { describe, expect, it } from 'vitest';
import robots from '../../public/robots.txt?raw';
import { SITE_ORIGIN, STATIC_PATHS, sitemapXml } from './sitemap';

describe('sitemap', () => {
  it('lists each path once, with its day of last change', () => {
    const xml = sitemapXml([
      { path: '/' },
      { path: '/blog/pneus-hiver-belgique', lastmod: '2026-10-14T04:23:27.233118+00:00' },
      { path: '/blog/pneus-hiver-belgique', lastmod: '2026-10-15' },
      { path: 'relative/ignored' },
      { path: '/garage/garage-a&b', lastmod: 'not a date' },
    ]);
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml.match(/<url>/g)).toHaveLength(3);
    expect(xml).toContain(`<loc>${SITE_ORIGIN}/blog/pneus-hiver-belgique</loc><lastmod>2026-10-14</lastmod>`);
    expect(xml).toContain(`<loc>${SITE_ORIGIN}/garage/garage-a&amp;b</loc></url>`);
    expect(xml).not.toContain('relative');
  });

  it('encodes characters a URL cannot hold', () => {
    expect(sitemapXml([{ path: '/garage/garage-liège' }])).toContain('/garage/garage-li%C3%A8ge');
  });

  it('never lists a page that robots.txt keeps out', () => {
    const blocked = [...robots.matchAll(/^Disallow: (\S+)$/gm)].map((m) => m[1]);
    expect(blocked.length).toBeGreaterThan(5);
    for (const path of STATIC_PATHS) expect(blocked.filter((b) => path.startsWith(b))).toEqual([]);
    expect(robots).toMatch(new RegExp(`^Sitemap: ${SITE_ORIGIN}/sitemap\\.xml$`, 'm'));
  });
});
