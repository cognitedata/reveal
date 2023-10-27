import { CopilotDataModelQueryResponse } from '@fusion/copilot-core';
import useLocalStorageState from 'use-local-storage-state';

import { useSDK } from '@cognite/sdk-provider';

import { localStorageKeys } from '../constants/localStorageKeys';
import { DataModelV2, SearchResponse } from '../types/services';

import { useProjectConfig } from './useConfig';
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

export const useSelectedSiteLocalStorage = () => {
  const { project } = useSDK();
  const config = useProjectConfig();

  return useLocalStorageState<string | undefined>(
    localStorageKeys.selectedSite(project),
    {
      defaultValue: config?.sites?.[0]?.name,
    }
  );
};

export const useAIQueryLocalStorage = () => {
  const { project } = useSDK();

  return useLocalStorageState<
    | {
        search: string;
        results?: Record<string, SearchResponse>;
        dataModels: DataModelV2[];
        message: CopilotDataModelQueryResponse;
      }
    | undefined
  >(localStorageKeys.aiResults(project), {
    defaultValue: undefined,
  });
};
