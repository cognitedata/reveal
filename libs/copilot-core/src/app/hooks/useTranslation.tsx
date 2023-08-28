import { useCallback } from 'react';

import { TOptions } from 'i18next';

import { useTypedTranslation } from '@cognite/cdf-i18n-utils';

// ENGLISH is the default language and source of truth.
import english from '../../i18n/en/copilot-core.json';

export type TFunction = (
  key: keyof typeof english,
  options?: TOptions
) => string;

const test = false;

export const useTranslation = () => {
  const { t: i18nTranslate } = useTypedTranslation();

  const translate = useCallback(
    (key: keyof typeof english, options: TOptions = {}) => {
      if (test) {
        return 'TRANSLATED_STRING' as string;
      }

      return i18nTranslate(key, {
        defaultValue: english[key],
        ...options,
      });
    },
    [i18nTranslate]
  );

  return {
    t: translate,
  };
};
