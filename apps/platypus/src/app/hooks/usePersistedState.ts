import { useEffect, useState } from 'react';
import services from '@platypus-app/di';
import { StorageProviderType } from '@platypus/platypus-core';

/*
This hook can be used in place of useState to keep a copy of the state synced
to local storage.
 */
export const usePersistedState = <T>(defaultValue: T, key: string) => {
  const localStorageProvider = services().storageProviderFactory.getProvider(
    StorageProviderType.localStorage
  );

  const [value, setValue] = useState(() => {
    const localStorageValue = localStorageProvider.getItem(key);
    return localStorageValue || defaultValue;
  });

  useEffect(() => {
    localStorageProvider.setItem(key, value);
  });

  return [value, setValue];
};
