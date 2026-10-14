const NBSP = ' ';
const MONTHS = 'janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre';

/**
 * French typesetting for text typed with ordinary spaces (articles written in
 * the admin, titles): a no-break space keeps a mark, a unit or a month with its
 * number or word, so a line never starts with "?", "€" or "octobre".
 *  - before : ; ! ? when followed by a space, the end or markdown emphasis
 *    ("| :--- |", table alignment, is left alone), and always before »;
 *  - after «;
 *  - inside numbers (110 000) and between a number and its unit (40,90 €, 4 mm);
 *  - between a day, its month and its year (1er octobre 2024, février 2026).
 */
export function keepPunctuation(text: string): string {
  return text
    .replace(/ ([:;!?])(?=[\s*_)]|$)/g, `${NBSP}$1`)
    .replace(/ »/g, `${NBSP}»`)
    .replace(/« /g, `«${NBSP}`)
    .replace(/(\d) (?=\d{3}(?!\d))/g, `$1${NBSP}`)
    .replace(/(\d) (€|%|°C|km\/h|km|mm|kg)(?![\p{L}\d])/gu, `$1${NBSP}$2`)
    .replace(new RegExp(`\\b(\\d{1,2}(?:er)?) (${MONTHS})\\b`, 'g'), `$1${NBSP}$2`)
    .replace(new RegExp(`\\b(${MONTHS}) (\\d{4})\\b`, 'g'), `$1${NBSP}$2`);
}
