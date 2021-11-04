import {
  StorageProvider,
  StorageProviderFactory,
  StorageProviderType,
} from '@platypus/platypus-core';
import { STORAGE_PROVIDERS_TYPES } from './storage-providers';

export class StorageProviderFactoryImpl implements StorageProviderFactory {
  getProvider(storageProviderType: StorageProviderType): StorageProvider {
    const provider = STORAGE_PROVIDERS_TYPES[storageProviderType];
    return provider;
  }
}
