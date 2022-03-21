import { createLocalStorageStateHook } from 'use-local-storage-state';

import { AUTH_ENV_LS_KEY } from '../constants';

const useEnv = createLocalStorageStateHook(AUTH_ENV_LS_KEY, '');

export default useEnv;
