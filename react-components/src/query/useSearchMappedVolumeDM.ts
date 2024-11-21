/*!
 * Copyright 2024 Cognite AS
 */
import { type AddModelOptions } from '@cognite/reveal';
import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { useFdmSdk, useFdm3dDataProvider } from '../components/RevealCanvas/SDKProvider';
import { type Source } from '../data-providers';
import { type FdmSDK, type InstanceFilter } from '../data-providers/FdmSDK';
import { type InstancesWithView } from './useSearchMappedEquipmentFDM';
import { queryKeys } from '../utilities/queryKeys';
import { chunk, uniq } from 'lodash';
import { useMemo } from 'react';
import { type Fdm3dDataProvider } from '../data-providers/Fdm3dDataProvider';

export const useSearchMappedVolumeDM = (
  query: string,
  viewsToSearch: Source[],
  models: AddModelOptions[],
  instancesFilter: InstanceFilter | undefined,
  limit: number = 25
): UseQueryResult<InstancesWithView[]> => {
  const fdmSdk = useFdmSdk();
  const fdmDataProvider = useFdm3dDataProvider();
  const spacesToSearch = useMemo(
    () => uniq(viewsToSearch.map((view) => view.space)),
    [viewsToSearch]
  );

  return useQuery({
    queryKey: [
      queryKeys.pointCloudDMVolumeSearch(),
      query,
      ...viewsToSearch
        .map((view) => `${view.externalId}/${view.space}/${view.type}/${view.version}`)
        .sort(),
      ...models.map((model) => `${model.modelId}/${model.revisionId}`).sort(),
      instancesFilter,
      limit.toString()
    ],
    queryFn: async () => {
      if (models.length === 0) {
        return [];
      }
      const chunkedSources = chunk(viewsToSearch, 10);
      if (chunkedSources.length === 0) {
        chunkedSources.push([]);
      }

      const queryResults: InstancesWithView[] = [];
      for (const sourceChunk of chunkedSources) {
        const chunkResult = await searchVolumesWithViewsAndModels(
          query,
          spacesToSearch,
          sourceChunk,
          models,
          instancesFilter,
          fdmSdk,
          fdmDataProvider,
          limit
        );
        queryResults.push(...chunkResult);
      }

      return queryResults;
    },
    staleTime: Infinity
  });
};

const searchVolumesWithViewsAndModels = async (
  query: string,
  spacesToSearch: string[],
  sourcesToSearch: Source[],
  models: AddModelOptions[],
  instancesFilter: InstanceFilter | undefined,
  fdmSdk: FdmSDK,
  fdmDataProvider: Fdm3dDataProvider,
  limit: number = 100
): Promise<InstancesWithView[]> => {
  if (query === '') {
    const volmeItems = await fdmDataProvider.listMappedFdmNodes(
      models,
      sourcesToSearch,
      instancesFilter,
      limit
    );
    const transformedResults = convertQueryNodeItemsToSearchResultsWithViews(volmeItems);

    const combinedWithOtherViews = sourcesToSearch.map((view) => ({
      view,
      instances:
        transformedResults.find(
          (result) => result.view.externalId === view.externalId && result.view.space === view.space
        )?.instances ?? []
    }));

    return combinedWithOtherViews;
  }

  const searchResults: InstancesWithView[] = [];

  for (const view of sourcesToSearch) {
    const result = await fdmSdk.searchInstances(view, query, 'node', limit, instancesFilter);

    searchResults.push({
      view,
      instances: result.instances
    });
  }

  return await fdmDataProvider.filterNodesByMappedTo3d(searchResults, models, spacesToSearch);
};
