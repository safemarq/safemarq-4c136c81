/**
 * French puts a space before : ; ! ? and inside « ». A plain space lets the
 * line break before the colon; a no-break space keeps the mark with its word.
 * Only before a space, the end, or markdown emphasis: "| :--- |" (table
 * alignment) is left alone.
 */
export function keepPunctuation(text: string): string {
  return text.replace(/ ([:;!?»])(?=[\s*_)]|$)/g, ' $1').replace(/« /g, '« ');
}
