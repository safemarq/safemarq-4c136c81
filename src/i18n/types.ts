import type fr from './locales/fr';

/** Same shape as the French source, with every leaf widened to `string`. */
type Widen<T> = T extends string ? string : { readonly [K in keyof T]: Widen<T[K]> };
export type Messages = Widen<typeof fr>;

type PluralForms = { readonly one: string; readonly other: string };

/** Dotted paths to string leaves, e.g. "pro.auth.title". */
type StringPaths<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string
    ? `${P}${K}`
    : T[K] extends PluralForms
      ? never
      : StringPaths<T[K], `${P}${K}.`>;
}[keyof T & string];

/** Dotted paths to { one, other } plural objects. */
type PluralPaths<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string
    ? never
    : T[K] extends PluralForms
      ? `${P}${K}`
      : PluralPaths<T[K], `${P}${K}.`>;
}[keyof T & string];

export type MessageKey = StringPaths<Messages>;
export type PluralKey = PluralPaths<Messages>;
export type Vars = Record<string, string | number>;
