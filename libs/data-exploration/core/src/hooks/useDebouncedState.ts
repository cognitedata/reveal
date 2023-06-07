import React, { useState } from 'react';

import { useDebounce } from 'use-debounce';

const DEBOUNCE_DELAY = 300;

export const useDebouncedState = <T>(
  initialValue?: T,
  delay: number = DEBOUNCE_DELAY
): [T | undefined, React.Dispatch<React.SetStateAction<T | undefined>>] => {
  const [value, setValue] = useState<T | undefined>(initialValue);
  const [debouncedValue] = useDebounce(value, delay);

  return [debouncedValue, setValue];
};
