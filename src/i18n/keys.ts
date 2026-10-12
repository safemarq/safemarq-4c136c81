import type { MessageKey } from './types';

/** Trade slugs come from data, so the key is checked at runtime (t() falls back to French). */
export const tradeKey = (slug: string) => `trades.${slug}` as MessageKey;
