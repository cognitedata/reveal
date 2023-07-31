import { useCallback } from 'react';

import { TS_FIX_ME } from 'core';
import debounce from 'lodash/debounce';

export const useDebounce = (
  functionToDebounce: TS_FIX_ME,
  waitTime = 1000,
  sideEffects: TS_FIX_ME[] = []
) => {
  const debounceCallback = useCallback(debounce(functionToDebounce, waitTime), [
    ...sideEffects,
  ]);
  return debounceCallback;
};
