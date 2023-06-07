import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import { StorageProviderType } from '@platypus/platypus-core';
import { TOKENS } from '@platypus-app/di';

import { useInjection } from './useInjection';

/*
This hook can be used in place of useState to keep a copy of the state synced
to local storage.
 */
export const usePersistedState = <T>(
  defaultValue: T,
  key: string
): [T, Dispatch<SetStateAction<T>>] => {
  const localStorageProvider = useInjection(
    TOKENS.storageProviderFactory
  ).getProvider(StorageProviderType.localStorage);

  const [value, setValue] = useState<T>(() => {
    const localStorageValue = localStorageProvider.getItem(key);
    return localStorageValue !== null ? localStorageValue : defaultValue;
  });

  useEffect(() => {
    localStorageProvider.setItem(key, value);
  }, [key, localStorageProvider, value]);

  return [value, setValue];
};
