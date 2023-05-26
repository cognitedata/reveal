import useLocalStorageState from 'use-local-storage-state';

import { SEARCH_CONFIG_LOCAL_STORAGE_KEY } from '../../constants';
import { SearchConfigDataType } from '../../types';

type HookDef = (() => SearchConfigDataType | undefined) &
  (<T extends keyof SearchConfigDataType>(
    resource: T
  ) => SearchConfigDataType[T] | undefined);

// @ts-ignore need to fix this later
export const useGetSearchConfigFromLocalStorage: HookDef = (
  resource?: keyof SearchConfigDataType
) => {
  const [searchConfig] = useLocalStorageState<SearchConfigDataType>(
    SEARCH_CONFIG_LOCAL_STORAGE_KEY
  );

  if (!searchConfig) return undefined;

  if (resource) {
    return searchConfig[resource];
  }

  return searchConfig;
};
