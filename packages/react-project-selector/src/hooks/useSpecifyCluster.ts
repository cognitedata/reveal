import { createLocalStorageStateHook } from 'use-local-storage-state';

import { SPECIFY_CLUSTER_LS_KEY } from '../constants';

export const useSpecifyCluster = createLocalStorageStateHook(
  SPECIFY_CLUSTER_LS_KEY,
  false
);

export default useSpecifyCluster;
