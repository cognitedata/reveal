import { StorageProvider } from './storage-provider';
import { StorageProviderType } from './storage-provider-type.enum';

export abstract class StorageProviderFactory {
  abstract getProvider(
    storageProviderType: StorageProviderType
  ): StorageProvider;
}
