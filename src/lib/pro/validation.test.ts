import { describe, expect, it } from 'vitest';
import {
  companySchema,
  formatBce,
  formatPhone,
  isBceChecksumValid,
  normalizeBce,
  normalizePhone,
} from './validation';

describe('BCE / KBO enterprise number', () => {
  it('accepts real numbers', () => {
    expect(isBceChecksumValid('0417497106')).toBe(true); // AB InBev
    expect(isBceChecksumValid('0123456749')).toBe(true);
  });

  it('rejects a wrong check digit', () => {
    expect(isBceChecksumValid('0417497107')).toBe(false);
  });

  it('normalizes dotted input and the old 9-digit format', () => {
    expect(normalizeBce('0417.497.106')).toBe('0417497106');
    expect(normalizeBce('BE 417 497 106')).toBe('0417497106');
    expect(formatBce('0417497106')).toBe('0417.497.106');
  });

  it('schema returns the normalized number', () => {
    const r = companySchema.safeParse({ account_type: 'dealer', company_name: 'Garage Test', bce_number: '0417.497.106' });
    expect(r.success && r.data.bce_number).toBe('0417497106');
  });
});

describe('Belgian phone numbers', () => {
  it('converts national formats to E.164', () => {
    expect(normalizePhone('081 22 33 44')).toBe('+3281223344'); // Namur landline
    expect(normalizePhone('04 222 33 44')).toBe('+3242223344'); // Liège landline
    expect(normalizePhone('0470/12.34.56')).toBe('+32470123456'); // mobile
    expect(normalizePhone('0032 2 512 34 56')).toBe('+3225123456'); // Brussels
  });

  it('rejects impossible Belgian numbers', () => {
    expect(normalizePhone('0470 12 34')).toBeNull();
    expect(normalizePhone('12345')).toBeNull();
  });

  it('keeps foreign numbers', () => {
    expect(normalizePhone('+33 6 12 34 56 78')).toBe('+33612345678');
  });

  it('formats for display', () => {
    expect(formatPhone('+32470123456')).toBe('+32 470 12 34 56');
    expect(formatPhone('+3281223344')).toBe('+32 81 22 33 44');
  });
});
