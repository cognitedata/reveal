import useLocalStorageState from 'use-local-storage-state';

import { useSDK } from '@cognite/sdk-provider';

import { localStorageKeys } from '../constants/localStorageKeys';
import { DataModel } from '../services/types';

import { RecentlyViewed } from './useRecentlyVisited';

export const useDataModelLocalStorage = () => {
  const { project } = useSDK();

  return useLocalStorageState<Required<DataModel> | undefined>(
    localStorageKeys.dataModel(project),
    {
      defaultValue: undefined,
    }
  );
};

export const useRecentlyVisitedLocalStorage = () => {
  return useLocalStorageState<RecentlyViewed[]>(
    localStorageKeys.recentlyVisited(),
    {
      defaultValue: [],
    }
  );
};
