import { useCallback, useEffect, useState } from 'react';
import type { ClaimableGarage } from '@/hooks/useProAccount';
import type { CompanyInput, ContactInput, NewGarageInput } from '@/lib/pro/validation';

export type EstablishmentMode = 'existing' | 'new';

export interface OnboardingDraft {
  company: Partial<CompanyInput>;
  contact: Partial<ContactInput>;
  establishment: {
    mode: EstablishmentMode;
    existing: ClaimableGarage | null;
    newGarage: Partial<NewGarageInput>;
  };
  step: number;
}

export const emptyDraft = (): OnboardingDraft => ({
  company: {},
  contact: {},
  establishment: { mode: 'existing', existing: null, newGarage: { vehicles: ['voiture'], trades: [] } },
  step: 0,
});

const keyFor = (uid: string) => `safemarq-pro-draft:${uid}`;

/**
 * Keeps answers on this device between steps and visits: a garagiste often
 * leaves the form to look up the enterprise number on an invoice.
 * Stored per user id, cleared once the request is sent.
 */
export function useOnboardingDraft(uid: string | undefined, seed?: () => Partial<OnboardingDraft>) {
  const [draft, setDraft] = useState<OnboardingDraft>(() => {
    const base = { ...emptyDraft(), ...(seed?.() ?? {}) };
    if (!uid) return base;
    try {
      const raw = localStorage.getItem(keyFor(uid));
      if (raw) return { ...base, ...(JSON.parse(raw) as Partial<OnboardingDraft>) };
    } catch {
      /* corrupted or blocked storage: start fresh */
    }
    return base;
  });

  useEffect(() => {
    if (!uid) return;
    try {
      localStorage.setItem(keyFor(uid), JSON.stringify(draft));
    } catch {
      /* quota or private mode: the form still works, it just won't persist */
    }
  }, [uid, draft]);

  const clear = useCallback(() => {
    if (!uid) return;
    try {
      localStorage.removeItem(keyFor(uid));
    } catch {
      /* ignore */
    }
  }, [uid]);

  return { draft, setDraft, clear };
}
