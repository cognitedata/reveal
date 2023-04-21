import { TOKENS } from '@platypus-app/di';
import { StorageProviderType } from '@platypus/platypus-core';
import { useInjection } from 'brandi-react';

export const useFeatureToggle = (key: string) => {
  const localStorageProvider = useInjection(
    TOKENS.storageProviderFactory
  ).getProvider(StorageProviderType.localStorage);
  return {
    isEnabled:
      `${localStorageProvider.getItem(key)}`.toLowerCase() === 'true' || false,
  };
};

export const useUpdateFeatureToggle = (key: string) => {
  const localStorageProvider = useInjection(
    TOKENS.storageProviderFactory
  ).getProvider(StorageProviderType.localStorage);
  return (status: boolean) =>
    localStorageProvider.setItem(key, JSON.stringify(status));
};
