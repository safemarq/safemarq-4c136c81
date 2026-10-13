import { z } from 'zod';
import type { MessageKey } from '@/i18n/types';
import { TRADES, VEHICLES, VEHICLE_TRADES, type TradeSlug, type VehicleSlug } from '@/lib/taxonomy';
import { LOCALES } from '@/i18n/config';

/*
 * Zod messages are i18n keys; forms translate them with t() at render time.
 * The same rules exist as CHECK constraints in the database, so a client that
 * skips this validation is still rejected server-side.
 */
const msg = (key: MessageKey) => ({ message: key });

// ── Enterprise number (BCE / KBO) ─────────────────────────────────────────────

/** Keeps digits only; restores the leading 0 of the old 9-digit format. */
export function normalizeBce(input: string): string {
  const digits = input.replace(/\D/g, '');
  return digits.length === 9 ? `0${digits}` : digits;
}

export function isBceFormat(n: string): boolean {
  return /^[01]\d{9}$/.test(n);
}

/** Check digits = 97 − (first 8 digits mod 97). */
export function isBceChecksumValid(n: string): boolean {
  if (!isBceFormat(n)) return false;
  return 97 - (Number(n.slice(0, 8)) % 97) === Number(n.slice(8));
}

/** 0123456749 → 0123.456.749 */
export function formatBce(n: string): string {
  const d = normalizeBce(n);
  if (d.length !== 10) return n;
  return `${d.slice(0, 4)}.${d.slice(4, 7)}.${d.slice(7)}`;
}

/** Official public lookup, used by the admin to verify by hand. */
export function kboLookupUrl(n: string): string {
  return `https://kbopub.economie.fgov.be/kbopub/toonondernemingps.html?ondernemingsnummer=${normalizeBce(n)}`;
}

// ── Phone (stored as E.164) ───────────────────────────────────────────────────

/**
 * Accepts Belgian national formats (081 22 33 44, 0470/12.34.56) and
 * international ones (+32…, 0032…). Returns E.164 or null.
 */
export function normalizePhone(input: string): string | null {
  let s = input.trim().replace(/[\s./()-]/g, '');
  if (s.startsWith('00')) s = `+${s.slice(2)}`;
  if (/^0\d+$/.test(s)) s = `+32${s.slice(1)}`;
  if (!/^\+[1-9]\d{7,14}$/.test(s)) return null;
  if (s.startsWith('+32')) {
    const nsn = s.slice(3);
    // Mobiles are 9 digits (04xx…), landlines 8 digits (04 = Liège, 081 = Namur…).
    const isMobile = /^4\d{8}$/.test(nsn);
    const isLandline = /^[1-9]\d{7}$/.test(nsn);
    if (!isMobile && !isLandline) return null;
  }
  return s;
}

/** +3281223344 → +32 81 22 33 44 (display only). */
export function formatPhone(e164: string): string {
  if (!e164.startsWith('+32')) return e164;
  const n = e164.slice(3);
  if (n.length === 9) return `+32 ${n.slice(0, 3)} ${n.slice(3, 5)} ${n.slice(5, 7)} ${n.slice(7)}`;
  const area = /^[2349]/.test(n) ? 1 : 2; // Brussels, Antwerp, Ghent, Liège use 1-digit zones
  const rest = n.slice(area);
  return `+32 ${n.slice(0, area)} ${rest.replace(/(\d{2,3})(\d{2})(\d{2})$/, '$1 $2 $3')}`;
}

export function normalizeWebsite(input: string): string {
  return input.trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '');
}

// ── Schemas ───────────────────────────────────────────────────────────────────

const text = (min: number, max: number) =>
  z
    .string()
    .trim()
    .min(1, msg('validation.required'))
    .min(min, msg('validation.tooShort'))
    .max(max, msg('validation.tooLong'));

const postalCode = z.string().trim().regex(/^[1-9]\d{3}$/, msg('validation.postalCode'));

const phone = z
  .string()
  .trim()
  .min(1, msg('validation.required'))
  .refine((v) => normalizePhone(v) !== null, msg('validation.phone'))
  .transform((v) => normalizePhone(v) as string);

const optionalPhone = z
  .string()
  .trim()
  .refine((v) => v === '' || normalizePhone(v) !== null, msg('validation.phone'))
  .transform((v) => (v === '' ? '' : (normalizePhone(v) as string)));

export const companySchema = z.object({
  account_type: z.enum(['independent_garage', 'dealer'], {
    errorMap: () => msg('validation.required'),
  }),
  company_name: text(2, 160),
  bce_number: z
    .string()
    .trim()
    .min(1, msg('validation.required'))
    .transform(normalizeBce)
    .refine(isBceFormat, msg('validation.bceFormat'))
    .refine(isBceChecksumValid, msg('validation.bceChecksum')),
});

export const contactSchema = z.object({
  phone,
  business_email: z.string().trim().toLowerCase().min(1, msg('validation.required')).email(msg('validation.email')).max(254),
  street: text(3, 200),
  postal_code: postalCode,
  city: text(2, 100),
  contact_locale: z.enum(LOCALES),
});

const tradeSlug = z.enum(TRADES as [TradeSlug, ...TradeSlug[]]);
const vehicleSlug = z.enum(VEHICLES);

export const newGarageSchema = z.object({
  name: text(2, 160),
  street: text(3, 200),
  postal_code: postalCode,
  city: text(2, 100),
  phone: optionalPhone,
  website: z
    .string()
    .trim()
    .max(300, msg('validation.tooLong'))
    .refine((v) => v === '' || /^(https?:\/\/)?[\w-]+(\.[\w-]+)+(\/\S*)?$/i.test(v), msg('validation.url'))
    .transform((v) => (v === '' ? '' : normalizeWebsite(v))),
  brand: z.string().trim().max(80, msg('validation.tooLong')),
  vehicles: z.array(vehicleSlug).min(1, msg('validation.vehiclesMin')),
  trades: z.array(tradeSlug).min(1, msg('validation.tradesMin')),
}).superRefine((v, ctx) => {
  // Same rule as the database: every trade must exist for one of the chosen vehicles.
  const offered = new Set<TradeSlug>(v.vehicles.flatMap((veh: VehicleSlug) => VEHICLE_TRADES[veh]));
  if (v.trades.some((t) => !offered.has(t))) ctx.addIssue({ code: 'custom', path: ['trades'], ...msg('validation.tradesMin') });
});

export const passwordSchema = z
  .string()
  .min(8, msg('validation.passwordMin'))
  .regex(/\d/, msg('validation.passwordMin'))
  .max(72, msg('validation.tooLong')); // bcrypt limit used by Supabase Auth

export const emailSchema = z.string().trim().toLowerCase().min(1, msg('validation.required')).email(msg('validation.email'));

export type CompanyValues = z.infer<typeof companySchema>;
export type ContactValues = z.infer<typeof contactSchema>;
export type NewGarageValues = z.infer<typeof newGarageSchema>;
export type CompanyInput = z.input<typeof companySchema>;
export type ContactInput = z.input<typeof contactSchema>;
export type NewGarageInput = z.input<typeof newGarageSchema>;
