import React from 'react';

import useSessionStorageState from 'use-session-storage-state';

export const useSessionStorage = <T>(
  key: string,
  value?: T
): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [storedValue, setStoredValue] = useSessionStorageState<T>(key, {
    defaultValue: value,
  });

  return [storedValue, setStoredValue];
};
