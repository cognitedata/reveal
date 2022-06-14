import { LocalStorageProvider } from './local-storage-provider';
import { SessionStorageProvider } from './session-storage-provider';
import { MemoryStorageService } from './in-memory-storage.service';

export const STORAGE_PROVIDERS_TYPES = {
  localStorage: new LocalStorageProvider(),
  sessionStorage: new SessionStorageProvider(),
  inMemoryStorage: new MemoryStorageService(),
};
