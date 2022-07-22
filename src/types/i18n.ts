export type PluralKeySuffix = `_one` | `_other`;

export type PluralKey = `${string}${PluralKeySuffix}`;

export type MakeSingular<Key extends PluralKey> =
  `${Key extends `${infer P}${PluralKeySuffix}` ? P : Key}`;

export type ExtendedTranslationKeys<TKeys extends string> =
  | {
      [K in TKeys]: K extends PluralKey ? MakeSingular<K> : never;
    }[TKeys]
  | TKeys;
