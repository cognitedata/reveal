import { useEffect, useState } from 'react';
import { TOKENS } from '@platypus-app/di';
import { StorageProviderType } from '@platypus/platypus-core';
import { useInjection } from './useInjection';

/*
This hook can be used in place of useState to keep a copy of the state synced
to local storage.
 */
export const usePersistedState = <T>(defaultValue: T, key: string) => {
  const localStorageProvider = useInjection(
    TOKENS.storageProviderFactory
  ).getProvider(StorageProviderType.localStorage);

  const [value, setValue] = useState(() => {
    const localStorageValue = localStorageProvider.getItem(key);
    return localStorageValue || defaultValue;
  });

  useEffect(() => {
    localStorageProvider.setItem(key, value);
  });

  return [value, setValue];
};
