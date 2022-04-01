import { createLocalStorageStateHook } from 'use-local-storage-state';

import { AZURE_TENANT_IDS_LS_KEY } from '../constants';

const useSavedTenants = createLocalStorageStateHook<string[]>(
  AZURE_TENANT_IDS_LS_KEY,
  []
);

export default useSavedTenants;
