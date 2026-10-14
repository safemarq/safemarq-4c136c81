import { describe, expect, it, beforeEach } from 'vitest';
import migration from '../../supabase/migrations/20261014080000_makes_equipment_blog.sql?raw';
import { CITIES } from './cities';
import { EQUIPMENT_KINDS, TOOL_BRANDS, brandsOfKind } from './equipment';
import { MAKES, byLetter, makesFor } from './makes';
import { TRADES, VEHICLES } from './taxonomy';
import { parseLocal, readLocalRaw, writeLocal } from './favorites';
import { safeReturn } from './returnPath';
import { slugify } from '@/hooks/useBlog';
import { keepPunctuation } from './typography';

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

describe('makes and equipment', () => {
  it('use unique, URL-safe slugs and names', () => {
    for (const list of [MAKES, TOOL_BRANDS]) {
      const slugs = list.map((x) => x.slug);
      for (const s of slugs) expect(s).toMatch(SLUG);
      expect(new Set(slugs).size).toBe(slugs.length);
      expect(new Set(list.map((x) => x.name.toLowerCase())).size).toBe(list.length);
    }
  });

  it('are all seeded in the database (foreign keys of garage_makes / garage_tool_brands)', () => {
    for (const m of MAKES) expect(migration, m.slug).toContain(`('${m.slug}', '${m.name.replace(/'/g, "''")}'`);
    for (const b of TOOL_BRANDS) expect(migration, b.slug).toContain(`('${b.slug}', '${b.name.replace(/'/g, "''")}'`);
  });

  it('cover every vehicle and every kind of equipment', () => {
    for (const v of VEHICLES) expect(makesFor(v).length, v).toBeGreaterThan(3);
    for (const k of EQUIPMENT_KINDS) expect(brandsOfKind(k).length, k).toBeGreaterThan(1);
  });

  it('group makes by initial, accents folded', () => {
    const groups = byLetter(makesFor('voiture'));
    expect(groups.map((g) => g.letter)).toEqual([...groups.map((g) => g.letter)].sort());
    expect(groups.find((g) => g.letter === 'S')?.makes.map((m) => m.slug)).toContain('skoda');
  });

  it('never collide with the first segment of other pages', () => {
    const reserved = ['marques', 'outillage', 'blog', 'favoris', 'favorites', 'recherche', 'garage', 'pro', 'auth', 'about', 'pricing', 'legal', 'admin', 'profile', 'vehicles', 'nouveau-mot-de-passe'];
    const taken = new Set<string>([...VEHICLES, ...TRADES, ...CITIES.map((c) => c.slug)]);
    for (const r of reserved) expect(taken.has(r), r).toBe(false);
  });
});

describe('sign-in return path', () => {
  it('only accepts paths on this site', () => {
    expect(safeReturn('/favoris')).toBe('/favoris');
    expect(safeReturn('/marques/bmw/namur?tri=distance')).toBe('/marques/bmw/namur?tri=distance');
    expect(safeReturn(null)).toBe('/');
    expect(safeReturn('https://evil.example')).toBe('/');
    expect(safeReturn('/\t/evil.example')).toBe('/');
    expect(safeReturn('/\n/evil.example')).toBe('/');
    expect(safeReturn('//evil.example')).toBe('/');
    expect(safeReturn('/\\evil.example')).toBe('/');
    expect(safeReturn('/auth?retour=/auth')).toBe('/');
    expect(safeReturn('javascript:alert(1)')).toBe('/');
  });
});

describe('favourites kept on the device', () => {
  beforeEach(() => localStorage.clear());

  it('keeps only valid ids, once, newest first', () => {
    const a = '11111111-1111-4111-8111-111111111111';
    const b = '22222222-2222-4222-8222-222222222222';
    expect(parseLocal(JSON.stringify([a, 'nope', 42, a, b]))).toEqual([a, b]);
    expect(parseLocal('not json')).toEqual([]);
    expect(parseLocal('{"a":1}')).toEqual([]);
  });

  it('round-trips through storage and clears when empty', () => {
    const a = '11111111-1111-4111-8111-111111111111';
    writeLocal([a]);
    expect(parseLocal(readLocalRaw())).toEqual([a]);
    writeLocal([]);
    expect(readLocalRaw()).toBe('[]');
  });
});

describe('blog slugs', () => {
  it('are readable and URL-safe', () => {
    expect(slugify('Prix d’un entretien : à quoi s’attendre en 2026 ?')).toBe('prix-d-un-entretien-a-quoi-s-attendre-en-2026');
    expect(slugify('Œuvre & Cœur')).toBe('oeuvre-coeur');
    expect(slugify('  --Car-Pass--  ')).toBe('car-pass');
    expect(slugify('a'.repeat(150)).length).toBeLessThanOrEqual(100);
  });
});

describe('French typesetting', () => {
  const nb = (s: string) => s.replace(/_/g, ' ');

  it('keeps : ; ! ? » with the preceding word, leaves table syntax alone', () => {
    expect(keepPunctuation('Belgique : à quoi s’attendre ?')).toBe(nb('Belgique_: à quoi s’attendre_?'));
    expect(keepPunctuation('**Prix :** fixe')).toBe(nb('**Prix_:** fixe'));
    expect(keepPunctuation('| :--- | ---: |')).toBe('| :--- | ---: |');
    expect(keepPunctuation('« garage »')).toBe(nb('«_garage_»'));
    expect(keepPunctuation('un disque « 60 ».')).toBe(nb('un disque «_60_».'));
  });

  it('keeps numbers, units and dates together', () => {
    expect(keepPunctuation('110 000 km, 1 200 € et 40,90 €')).toBe(nb('110_000_km, 1_200_€ et 40,90_€'));
    expect(keepPunctuation('77 % à 7 °C, 4 mm, 60 km/h')).toBe(nb('77_% à 7_°C, 4_mm, 60_km/h'));
    expect(keepPunctuation('le 1er octobre et le 31 mars')).toBe(nb('le 1er_octobre et le 31_mars'));
    expect(keepPunctuation('VoitureBelgique, février 2026')).toBe(nb('VoitureBelgique, février_2026'));
    // Years and plain counts stay breakable.
    expect(keepPunctuation('en 2024 2025 fois, 3 kmz')).toBe('en 2024 2025 fois, 3 kmz');
    expect(keepPunctuation('7 à 10 ans')).toBe('7 à 10 ans');
  });
});
