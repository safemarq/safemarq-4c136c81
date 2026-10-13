import { normalize, type City, type PlaceIndex } from './cities';
import { NEAR_ME_WORDS, STOP_WORDS, TRADE_WORDS, VEHICLE_WORDS } from './searchWords';
import { DEFAULT_VEHICLE, TRADES, VEHICLES, VEHICLE_TRADES, offers, type TradeSlug, type VehicleSlug } from './taxonomy';

/**
 * Reads a free-text search the way a person means it:
 *   "pneus liège"        → tyres, car, Liège
 *   "moto 5100"          → motorbike, Jambes
 *   "vidange près de moi"→ servicing, car, around me
 *   "garage delvaux"     → nothing recognised: "delvaux" is left for the name search
 */

type Hit = { kind: 'vehicle'; value: VehicleSlug } | { kind: 'trade'; value: TradeSlug } | { kind: 'near' } | { kind: 'stop' };

export interface ParsedQuery {
  vehicle: VehicleSlug | null;
  trade: TradeSlug | null;
  city: City | null;
  nearMe: boolean;
  /** Words not recognised, in the order typed (for names and completion). */
  rest: string;
}

const MAX_PHRASE = 4;

function buildVocabulary(extraTradeLabels: Partial<Record<TradeSlug, string[]>> = {}): Map<string, Hit> {
  const vocab = new Map<string, Hit>();
  const ambiguous = new Set<string>();
  const add = (phrase: string, hit: Hit) => {
    const key = normalize(phrase);
    if (!key || ambiguous.has(key)) return;
    const prev = vocab.get(key);
    if (prev && JSON.stringify(prev) !== JSON.stringify(hit)) {
      // A phrase that could mean two trades means neither.
      vocab.delete(key);
      ambiguous.add(key);
      return;
    }
    vocab.set(key, hit);
  };
  for (const w of STOP_WORDS) add(w, { kind: 'stop' });
  for (const w of NEAR_ME_WORDS) add(w, { kind: 'near' });
  for (const v of VEHICLES) for (const w of VEHICLE_WORDS[v]) add(w, { kind: 'vehicle', value: v });
  for (const t of TRADES) for (const w of TRADE_WORDS[t]) add(w, { kind: 'trade', value: t });
  // The site's own names ("Embrayage & boîte" → "embrayage boite", "embrayage", "boite").
  for (const [t, labels] of Object.entries(extraTradeLabels) as [TradeSlug, string[]][]) {
    for (const label of labels) {
      add(label.replace(/&/g, ' '), { kind: 'trade', value: t });
      for (const part of label.split(/&|,/)) if (normalize(part).length >= 4) add(part, { kind: 'trade', value: t });
    }
  }
  return vocab;
}

const baseVocabulary = buildVocabulary();
const vocabularyCache = new Map<string, Map<string, Hit>>();

/** Vocabulary including the site's trade names in the visitor's language. */
export function vocabularyFor(cacheKey: string, labels: Partial<Record<TradeSlug, string[]>>): Map<string, Hit> {
  let v = vocabularyCache.get(cacheKey);
  if (!v) {
    v = buildVocabulary(labels);
    vocabularyCache.set(cacheKey, v);
  }
  return v;
}

/** A town written as one short word ("as", "mont", "ham") must be a real town people search for. */
function cityFromPhrase(places: PlaceIndex | null, phrase: string, words: number): City | null {
  if (!places) return null;
  if (/^\d{4}$/.test(phrase)) return places.resolve(phrase);
  if (phrase.length < 3) return null;
  const city = places.byPhrase(phrase);
  if (!city) return null;
  if (words === 1 && phrase.length <= 4 && !places.isMajor(city.slug)) return null;
  return city;
}

export function parseQuery(input: string, places: PlaceIndex | null, vocab: Map<string, Hit> = baseVocabulary): ParsedQuery {
  const tokens = normalize(input).split(' ').filter(Boolean);
  const result: ParsedQuery = { vehicle: null, trade: null, city: null, nearMe: false, rest: '' };
  const rest: string[] = [];

  for (let i = 0; i < tokens.length; ) {
    let matched = 0;
    for (let len = Math.min(MAX_PHRASE, tokens.length - i); len >= 1 && !matched; len--) {
      const phrase = tokens.slice(i, i + len).join(' ');
      const hit = vocab.get(phrase);
      if (hit) {
        if (hit.kind === 'vehicle' && !result.vehicle) result.vehicle = hit.value;
        else if (hit.kind === 'trade' && !result.trade) result.trade = hit.value;
        else if (hit.kind === 'near') result.nearMe = true;
        else if (hit.kind !== 'stop') break; // second vehicle or trade: leave it in the rest
        matched = len;
        break;
      }
      if (!result.city) {
        const city = cityFromPhrase(places, phrase, len);
        if (city) {
          result.city = city;
          matched = len;
        }
      }
    }
    if (matched) i += matched;
    else rest.push(tokens[i++]);
  }

  result.rest = rest.join(' ');
  // "vélo distribution": a bike has no timing belt; keep the vehicle, drop the trade.
  if (result.vehicle && result.trade && !offers(result.vehicle, result.trade)) result.trade = null;
  return result;
}

/** Vehicles that offer the trade; cars first when they do. */
export function vehiclesFor(trade: TradeSlug): VehicleSlug[] {
  return VEHICLES.filter((v) => VEHICLE_TRADES[v].includes(trade));
}

// ---------------------------------------------------------------------------
// Suggestions
// ---------------------------------------------------------------------------

export type Suggestion =
  /** Run this search (vehicle, trade, place or "around me"). */
  | { kind: 'search'; vehicle: VehicleSlug; trade: TradeSlug | null; city: City | null; nearMe?: boolean }
  /** Pick a trade, keep the current place. */
  | { kind: 'trade'; vehicle: VehicleSlug; trade: TradeSlug }
  /** Pick a place, keep the current trade. */
  | { kind: 'city'; city: City };

export interface SuggestContext {
  places: PlaceIndex | null;
  /** Place already chosen on the page, or the visitor's last town. */
  currentCity: City | null;
  vocab?: Map<string, Hit>;
  limit?: number;
}

const sameSuggestion = (a: Suggestion, b: Suggestion) => JSON.stringify(key(a)) === JSON.stringify(key(b));
const key = (s: Suggestion) =>
  s.kind === 'search'
    ? ['s', s.vehicle, s.trade, s.city?.slug ?? null, !!s.nearMe]
    : s.kind === 'trade'
      ? ['t', s.vehicle, s.trade]
      : ['c', s.city.slug];

/** Trades and vehicles whose words start with `text` ("frei" → brakes, "fie" → bike). */
function completeWords(text: string, vocab: Map<string, Hit>, max: number): Hit[] {
  const q = normalize(text);
  if (q.length < 2) return [];
  const found: Hit[] = [];
  const seen = new Set<string>();
  for (const [phrase, hit] of vocab) {
    if (hit.kind !== 'trade' && hit.kind !== 'vehicle') continue;
    if (!(phrase.startsWith(q) || phrase.includes(` ${q}`))) continue;
    const id = `${hit.kind}:${hit.value}`;
    if (seen.has(id)) continue;
    seen.add(id);
    found.push(hit);
    if (found.length >= max) break;
  }
  return found;
}

export function suggest(parsed: ParsedQuery, ctx: SuggestContext): Suggestion[] {
  const { places, currentCity } = ctx;
  const vocab = ctx.vocab ?? baseVocabulary;
  const limit = ctx.limit ?? 6;
  const out: Suggestion[] = [];
  const push = (s: Suggestion) => {
    if (out.length < limit && !out.some((x) => sameSuggestion(x, s))) out.push(s);
  };

  const { trade, nearMe, rest } = parsed;
  const vehicles: VehicleSlug[] = parsed.vehicle
    ? [parsed.vehicle]
    : trade
      ? (offers(DEFAULT_VEHICLE, trade) ? [DEFAULT_VEHICLE] : vehiclesFor(trade)).slice(0, 3)
      : [DEFAULT_VEHICLE];
  const knowsWhat = !!(parsed.vehicle || trade);
  const restPlaces = rest && places && !parsed.city ? places.search(rest, 3) : [];

  if (knowsWhat) {
    for (const vehicle of vehicles) {
      if (parsed.city) push({ kind: 'search', vehicle, trade, city: parsed.city });
      if (nearMe) push({ kind: 'search', vehicle, trade, city: null, nearMe: true });
    }
    // "pneus nam…": complete the town.
    for (const city of restPlaces) for (const vehicle of vehicles) push({ kind: 'search', vehicle, trade, city });
    if (!parsed.city && !nearMe && !rest) {
      for (const vehicle of vehicles) {
        if (currentCity) push({ kind: 'search', vehicle, trade, city: currentCity });
        push({ kind: 'search', vehicle, trade, city: null, nearMe: true });
      }
    }
  }

  // "namur fre…": a known place, complete the trade.
  const completions = !trade && rest ? completeWords(rest, vocab, 5) : [];
  for (const hit of completions) {
    if (hit.kind === 'trade') {
      const vs = parsed.vehicle && offers(parsed.vehicle, hit.value) ? [parsed.vehicle] : vehiclesFor(hit.value).slice(0, 1);
      for (const vehicle of vs) {
        if (parsed.city ?? currentCity) push({ kind: 'search', vehicle, trade: hit.value, city: parsed.city ?? currentCity });
        else push({ kind: 'trade', vehicle, trade: hit.value });
      }
    } else if (hit.kind === 'vehicle' && !parsed.vehicle) {
      push({ kind: 'search', vehicle: hit.value, trade: null, city: parsed.city ?? currentCity });
    }
  }

  if (parsed.city && !knowsWhat) push({ kind: 'search', vehicle: DEFAULT_VEHICLE, trade: null, city: parsed.city });
  if (!knowsWhat && !parsed.city) for (const city of restPlaces) push({ kind: 'city', city });

  return out;
}
