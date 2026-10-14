/**
 * Favourites kept on the device for visitors without an account. The list is
 * merged into the account (table favorites) the first time they sign in.
 * Every reader subscribes, so a heart toggled in one place updates everywhere,
 * including other tabs.
 */
const KEY = 'safemarq-favorites';
const EVENT = 'safemarq-favorites-change';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const LOCAL_FAVORITES_MAX = 100;

/** Raw stored value: a stable string snapshot for useSyncExternalStore. */
export function readLocalRaw(): string {
  try {
    return localStorage.getItem(KEY) ?? '[]';
  } catch {
    return '[]';
  }
}

export function parseLocal(raw: string): string[] {
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    // Anything else in storage (edited by hand, older format) is dropped.
    return [...new Set(value.filter((v): v is string => typeof v === 'string' && UUID.test(v)))].slice(0, LOCAL_FAVORITES_MAX);
  } catch {
    return [];
  }
}

export function writeLocal(ids: string[]): void {
  try {
    if (ids.length === 0) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, JSON.stringify(ids.slice(0, LOCAL_FAVORITES_MAX)));
  } catch {
    /* storage blocked (private mode): the heart simply won't persist */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function subscribeLocal(onChange: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY || e.key === null) onChange();
  };
  window.addEventListener(EVENT, onChange);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener('storage', onStorage);
  };
}
