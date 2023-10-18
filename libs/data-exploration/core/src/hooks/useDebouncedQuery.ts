import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import debounce from 'lodash/debounce';

const DEBOUNCE_DELAY = 500;

export const useDebouncedQuery = <T>(
  onChange: (newValue?: T) => void,
  value?: T,
  delay: number = DEBOUNCE_DELAY
): [T | undefined, Dispatch<SetStateAction<T | undefined>>] => {
  const debouncedSetQuery = debounce(onChange, delay);
  const [localQuery, setLocalQuery] = useState<T | undefined>(value);

  useEffect(() => {
    if (localQuery !== value) {
      debouncedSetQuery(localQuery);
    }
    return () => debouncedSetQuery.cancel();
  }, [debouncedSetQuery, localQuery, value]);

  return [localQuery, setLocalQuery];
};
