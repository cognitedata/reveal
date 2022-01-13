import { useContext } from 'react';
import { StorageContext, StorageDispatchContext } from 'scarlet/contexts';

export const useStorageState = () => useContext(StorageContext);

export const useStorageDispatch = () => useContext(StorageDispatchContext);

export const useStorage = () => {
  const storageState = useStorageState();
  const storageDispatch = useStorageDispatch();

  return {
    storageState,
    storageDispatch,
  };
};
