/* eslint-disable  */

import { useCallback } from 'react';

// Dummy hook so we can use translate in our code
// We will switch later to the react package
export const useTranslateProvider = (namespace: string) => {
  const translate = useCallback(
    (key: string, referenceValue: string, options = {}) => {
      return referenceValue;
    },
    []
  );

  return {
    t: translate,
  };
};
