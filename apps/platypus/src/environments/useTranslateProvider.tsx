import { useCallback } from 'react';

import { useTypedTranslation } from '@cognite/cdf-i18n-utils';

// Dummy hook so we can use translate in our code
// We will switch later to the react package
export const useTranslateProvider = (_: string) => {
  const { t: i18nTranslate } = useTypedTranslation();

  const translate = useCallback(
    (key: string, referenceValue: string, options = {}) => {
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
