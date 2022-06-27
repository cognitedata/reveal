import { useCallback } from 'react';
import debounce from 'lodash/debounce';

export const useDebounce = (
  functionToDebounce: any,
  waitTime = 1000,
  sideEffects: any[] = []
) => {
  const debounceCallback = useCallback(debounce(functionToDebounce, waitTime), [
    ...sideEffects,
  ]);
  return debounceCallback;
};
