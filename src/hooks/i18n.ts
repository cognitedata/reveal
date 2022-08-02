import { useCallback } from 'react';

import { TOptions, StringMap } from 'i18next';
import { useTranslation } from 'react-i18next';

import { ExtendedTranslationKeys } from '..';

export const useTypedTranslation = <K extends string>() => {
  const { t: oldT, ...rest } = useTranslation();

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
