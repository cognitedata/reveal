import { USE_FDM_V3_LOCALSTORAGE_KEY } from '@platypus-app/constants';
import { TOKENS } from '@platypus-app/di';
import { useInjection } from '@platypus-app/hooks/useInjection';
import { StorageProviderType } from '@platypus/platypus-core';

export const useFDMV3 = () => {
  const localStorageProvider = useInjection(
    TOKENS.storageProviderFactory
  ).getProvider(StorageProviderType.localStorage);
  return localStorageProvider.getItem(USE_FDM_V3_LOCALSTORAGE_KEY);
};
