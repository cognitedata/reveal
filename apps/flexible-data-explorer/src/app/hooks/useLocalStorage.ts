import useLocalStorageState from 'use-local-storage-state';

import { useSDK } from '@cognite/sdk-provider';

import { localStorageKeys } from '../constants/localStorageKeys';
import { DataModelV2 } from '../services/types';

import { RecentlyViewed } from './useRecentlyVisited';

export const useRecentlyVisitedLocalStorage = () => {
  const { project } = useSDK();

  return useLocalStorageState<RecentlyViewed[]>(
    localStorageKeys.recentlyVisited(project),
    {
      defaultValue: [],
    }
  );
};

export const useDataModelsLocalStorage = () => {
  const { project } = useSDK();

  return useLocalStorageState<DataModelV2[] | undefined>(
    localStorageKeys.dataModels(project),
    {
      defaultValue: undefined,
    }
  );
};
