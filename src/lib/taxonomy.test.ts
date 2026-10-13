import { describe, expect, it } from 'vitest';
import fr from '@/i18n/locales/fr';
import nl from '@/i18n/locales/nl';
import de from '@/i18n/locales/de';
import en from '@/i18n/locales/en';
import type { Messages } from '@/i18n/types';
import { CITIES } from './cities';
import {
  FEATURED_TRADES,
  TRADE_GROUP,
  TRADE_OVERRIDES,
  TRADES,
  VEHICLE_TRADES,
  VEHICLES,
  groupedTrades,
} from './taxonomy';
import { TRADE_ICON, VEHICLE_ICON } from './tradeMeta';

const LOCALES: Record<string, Messages> = { fr, nl, de, en };

describe('taxonomy', () => {
  it('uses URL-safe slugs that never collide with each other or with towns', () => {
    const all = [...VEHICLES, ...TRADES];
    for (const s of all) expect(s).toMatch(/^[a-z][a-z0-9-]+$/);
    expect(new Set(all).size).toBe(all.length);
    for (const c of CITIES) expect(all).not.toContain(c.slug);
  });

  it('gives every trade a vehicle, a group and an icon', () => {
    const used = new Set(Object.values(VEHICLE_TRADES).flat());
    for (const t of TRADES) {
      expect(used.has(t), t).toBe(true);
      expect(TRADE_GROUP[t]).toBeTruthy();
      expect(TRADE_ICON[t], t).toBeTruthy();
    }
    for (const v of VEHICLES) expect(VEHICLE_ICON[v]).toBeTruthy();
  });

  it('features only trades the vehicle offers, without repeats', () => {
    for (const v of VEHICLES) {
      expect(new Set(FEATURED_TRADES[v]).size).toBe(4);
      for (const t of FEATURED_TRADES[v]) expect(VEHICLE_TRADES[v], `${v}/${t}`).toContain(t);
      expect(new Set(VEHICLE_TRADES[v]).size).toBe(VEHICLE_TRADES[v].length);
      expect(groupedTrades(v).flatMap((g) => g.trades).sort()).toEqual([...VEHICLE_TRADES[v]].sort());
    }
  });

  it('has every label in the four languages', () => {
    for (const [lang, m] of Object.entries(LOCALES)) {
      for (const t of TRADES) {
        expect(m.trades[t], `${lang} trades.${t}`).toBeTruthy();
        expect(m.tradeInfo[t], `${lang} tradeInfo.${t}`).toBeTruthy();
      }
      for (const v of VEHICLES) {
        for (const f of ['label', 'short', 'pros', 'heroTitle'] as const) expect(m.vehicles[v][f], `${lang} ${v}.${f}`).toBeTruthy();
      }
      for (const [v, list] of Object.entries(TRADE_OVERRIDES)) {
        const o = (m.tradeOverrides as Record<string, Record<string, { label: string; info: string }>>)[v];
        expect(Object.keys(o).sort(), `${lang} overrides ${v}`).toEqual([...list].sort());
        for (const t of list) expect(VEHICLE_TRADES[v as keyof typeof VEHICLE_TRADES]).toContain(t);
      }
    }
  });

  it('matches the database migration', () => {
    const files = import.meta.glob<string>('/supabase/migrations/*.sql', { query: '?raw', import: 'default', eager: true });
    const sql = Object.values(files).join('\n');
    expect(sql.length).toBeGreaterThan(0);
    for (const v of VEHICLES) {
      for (const t of VEHICLE_TRADES[v]) expect(sql, `${v}/${t}`).toContain(`('${v}', '${t}')`);
    }
    for (const t of TRADES) expect(sql).toContain(`('${t}', '${TRADE_GROUP[t]}'`);
  });
});
