import { useFlag } from '@cognite/react-feature-flags';
import { TOptions, StringMap } from 'i18next';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { ExtendedTranslationKeys, getLanguage } from '..';

export const useLanguage = () => {
  const { isClientReady, isEnabled } = useFlag('FUSION_TRANSLATIONS', {
    forceRerender: true,
  });

  let data: string;
  if (isClientReady) {
    data = isEnabled ? getLanguage() : 'en';
  }

  return { isClientReady, data };
};

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
