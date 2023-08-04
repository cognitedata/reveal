import { TOptions } from 'i18next';

import { useTypedTranslation } from '@cognite/cdf-i18n-utils';
// import { useTypedTranslation, TFunction } from '@cognite/cdf-i18n-utils';

// TODO: Later add below type to `cdf-ui-i18n-utils/src/hooks/i18n.ts` and remove the unnecessary types below.
// export type TFunction<K extends string> = (
//   key: ExtendedTranslationKeys<K>,
//   options?: TOptions<StringMap> | string
// ) => string;

type PluralKeySuffix = `_one` | `_other`;
type PluralKey = `${string}${PluralKeySuffix}`;
type MakeSingular<Key extends PluralKey> =
  `${Key extends `${infer P}${PluralKeySuffix}` ? P : Key}`;
type ExtendedTranslationKeys<TKeys extends string> =
  | {
      [K in TKeys]: K extends PluralKey ? MakeSingular<K> : never;
    }[TKeys]
  | TKeys;
type StringMap = { [key: string]: any };
type TFunction<K extends string> = (
  key: ExtendedTranslationKeys<K>,
  options?: TOptions<StringMap> | string
) => string;
export type TFunctionType = TFunction<string>;

// Hook so we can use translate in our code
export const useTranslation = () => {
  const { t } = useTypedTranslation();

  return {
    t,
  };
};
