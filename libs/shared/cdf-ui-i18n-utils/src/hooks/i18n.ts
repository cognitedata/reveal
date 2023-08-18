import { useCallback } from 'react';

import { TOptions } from 'i18next';
import { UseTranslationOptions, useTranslation } from 'react-i18next';
import { ExtendedTranslationKeys } from '../types';

export type StringMap = { [key: string]: any };
export type TFunction<K extends string> = (
  key: ExtendedTranslationKeys<K>,
  options?: TOptions<StringMap> | string
) => string;

export const useTypedTranslation = <K extends string>(
  ns?: string,
  options?: UseTranslationOptions<undefined>
) => {
  const { t: oldT, ...rest } = useTranslation(ns, options);

  const t = useCallback(
    (
      key: ExtendedTranslationKeys<K>,
      options?: TOptions<StringMap> | string
    ) => {
      // eslint-disable-next-line
      // @ts-ignore
      const translation = oldT(key, options);
      return translation;
    },
    [oldT]
  );

  return { t, ...rest };
};
