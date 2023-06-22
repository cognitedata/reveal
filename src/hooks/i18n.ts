import { useCallback } from 'react';

import { TOptions, StringMap } from 'i18next';
import { UseTranslationOptions, useTranslation } from 'react-i18next';

import { ExtendedTranslationKeys } from '..';

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
      const translation = oldT(key, options);
      return translation;
    },
    [oldT]
  );

  return { t, ...rest };
};
