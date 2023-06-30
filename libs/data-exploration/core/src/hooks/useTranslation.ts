import { useCallback } from 'react';

import { useTypedTranslation } from '@cognite/cdf-i18n-utils';

export type TFunction = (
  key: string,
  referenceValue: string,
  options?: {}
) => string;

export const useTranslation = () => {
  const { t: i18nTranslate } = useTypedTranslation();
  const translate: TFunction = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (key: string, referenceValue: string, options?: {}) => {
      return i18nTranslate(key, {
        defaultValue: referenceValue,
        ...options,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return {
    t: translate,
  };
};
