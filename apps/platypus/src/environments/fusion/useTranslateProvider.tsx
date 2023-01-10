import { useTypedTranslation } from '@cognite/cdf-i18n-utils';
import { useCallback } from 'react';

// Dummy hook so we can use translate in our code
// We will switch later to the react package
export const useTranslateProvider = (namespace: string) => {
  const { t: i18nTranslate } = useTypedTranslation();

  const translate = useCallback(
    (key: string, referenceValue: string, options = {}) => {
      return i18nTranslate(key, {
        defaultValue: referenceValue,
        ...options,
      });
    },
    []
  );

  return {
    t: translate,
  };
};
