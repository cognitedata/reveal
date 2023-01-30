import { getProject } from '@cognite/cdf-utilities';

import { LocalStorageProvider } from './local-storage-provider';
import { SessionStorageProvider } from './session-storage-provider';
import { MemoryStorageService } from './in-memory-storage.service';

const project = getProject();

export const STORAGE_PROVIDERS_TYPES = {
  localStorage: new LocalStorageProvider(project),
  sessionStorage: new SessionStorageProvider(project),
  inMemoryStorage: new MemoryStorageService(),
};
