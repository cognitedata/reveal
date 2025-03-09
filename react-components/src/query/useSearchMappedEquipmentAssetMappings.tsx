/*!
 * Copyright 2023 Cognite AS
 */
import { type AddModelOptions } from '@cognite/reveal';
import { type UnitDMSUniqueIdentifier, type Asset, type CogniteClient } from '@cognite/sdk';
import {
  type UseInfiniteQueryResult,
  useInfiniteQuery,
  type InfiniteData,
  useQuery,
  type UseQueryResult
} from '@tanstack/react-query';
import { useFdmSdk, useSDK } from '../components/RevealCanvas/SDKProvider';
import { getAssetsList } from '../hooks/network/getAssetsList';
import { isDefined } from '../utilities/isDefined';
import { type InstancesWithView } from './useSearchMappedEquipmentFDM';
import { COGNITE_ASSET_SOURCE, NodeItem, type Source } from '../data-providers';
import { useMemo } from 'react';
import { type ModelWithAssetMappings } from '../hooks/cad/ModelWithAssetMappings';
import {
  type AssetPage,
  type ModelMappingsWithAssets,
  type NodeDefinitionWithModelAndMappings
} from './types';
import { getAssetsFromAssetMappings } from '../utilities/getAssetsFromAssetMappings';
import {
  fetchAllMappedEquipmentAssetMappingsClassic,
  fetchAllMappedEquipmentAssetMappingsHybrid
} from '../utilities/fetchMappedEquipmentAssetMappings';
import { queryKeys } from '../utilities/queryKeys';
import {
  createFdmKey,
  createModelRevisionKey
} from '../components/CacheProvider/idAndKeyTranslation';
import { createEmptyArray } from '../utilities/createEmptyArray';

export const useSearchMappedEquipmentAssetMappingsClassic = (
  query: string,
  models: AddModelOptions[],
  limit: number = 100,
  assetMappingList: ModelWithAssetMappings[],
  isAssetMappingNodesFetched: boolean,
  userSdk?: CogniteClient
): UseInfiniteQueryResult<InfiniteData<AssetPage>, Error> => {
  const sdk = useSDK(userSdk);

  const mapped3dAssetIds = useMemo(() => {
    if (assetMappingList === undefined) return new Set<number>();
    return new Set(
      assetMappingList.flatMap((mapping) =>
        mapping.assetMappings.map((assetMapping) => assetMapping.assetId)
      )
    );
  }, [assetMappingList]);

  const queryKey = useMemo(
    () => [
      'reveal',
      'react-components',
      'search-mapped-asset-mappings',
      query,
      ...mapped3dAssetIds.values(),
      ...models.map((model) => [model.modelId, model.revisionId])
    ],
    [query, models]
  );

  const fetchAssets = async (
    cursor: string | undefined,
    accumulatedAssets: Asset[],
    mappedSearchedAssetIds: Set<number>
  ): Promise<{ assets: Asset[]; nextCursor: string | undefined }> => {
    const searchedAssetsResponse = await getAssetsList(sdk, {
      query,
      limit: 1000,
      cursor
    });

    const filteredSearchedAssets = searchedAssetsResponse.items.filter(isDefined);
    const filteredMappedSearchedAssets = filteredSearchedAssets.filter(
      (asset) => mapped3dAssetIds.has(asset.id) && !mappedSearchedAssetIds.has(asset.id)
    );

    accumulatedAssets.push(...filteredMappedSearchedAssets);

    if (accumulatedAssets.length >= limit || searchedAssetsResponse.nextCursor === undefined) {
      return { assets: accumulatedAssets, nextCursor: searchedAssetsResponse.nextCursor };
    }

    filteredMappedSearchedAssets.forEach((asset) => {
      mappedSearchedAssetIds.add(asset.id);
    });

    return await fetchAssets(
      searchedAssetsResponse.nextCursor,
      accumulatedAssets,
      mappedSearchedAssetIds
    );
  };

  return useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      if (query === '' || assetMappingList === undefined) {
        return { assets: [], nextCursor: undefined };
      }
      const mappedSearchedAssetIds = new Set<number>();

      const { assets, nextCursor } = await fetchAssets(pageParam, [], mappedSearchedAssetIds);

      return {
        assets,
        nextCursor
      };
    },
    initialPageParam: undefined,
    staleTime: Infinity,
    getNextPageParam: (_lastPage, allPages) => {
      const lastPageData = allPages[allPages.length - 1];
      return lastPageData.nextCursor;
    },
    enabled:
      isAssetMappingNodesFetched && assetMappingList !== undefined && assetMappingList.length > 0
  });
};

export const useSearchMappedEquipmentAssetMappingsHybrid = (
  query: string,
  viewsToSearch: Source[],
  models: AddModelOptions[],
  limit: number = 1000,
  assetMappingList: ModelWithAssetMappings[],
  isAssetMappingNodesFetched: boolean
): UseQueryResult<InstancesWithView[]> => {
  const fdmSdk = useFdmSdk();

  const mapped3dCDMAssetIdentifiers = useMemo(() => {
    if (assetMappingList === undefined) return [];
    return assetMappingList.flatMap((mapping) =>
      mapping.assetMappings.map((assetMapping) => assetMapping.assetInstanceId).filter(isDefined)
    );
  }, [assetMappingList]);

  const assetIdentifiersKeys = useMemo(
    () => mapped3dCDMAssetIdentifiers.map(createFdmKey),
    [mapped3dCDMAssetIdentifiers]
  );
  const modelKeys = useMemo(
    () => models.map((model) => createModelRevisionKey(model.modelId, model.revisionId)),
    [models]
  );

  const viewKeys = useMemo(() => viewsToSearch.map(createFdmKey), [viewsToSearch]);

  return useQuery({
    queryKey: queryKeys.searchedMappedCoreAssetsForHybridMappings(
      query,
      limit,
      assetIdentifiersKeys,
      viewKeys,
      modelKeys
    ),
    queryFn: async () => {
      if (query === '' || assetMappingList === undefined) {
        return [];
      }

      const searchResults: InstancesWithView[] = createEmptyArray();

      for await (const view of viewsToSearch) {
        const result = await fdmSdk.searchInstances(view, query, 'node', limit, undefined);

        searchResults.push({
          view,
          instances: result.instances
        });
      }
      return connectMappedInstancesWithSearchResult(searchResults, mapped3dCDMAssetIdentifiers);
    },
    staleTime: Infinity,
    enabled:
      isAssetMappingNodesFetched && assetMappingList !== undefined && assetMappingList.length > 0
  });
};

export const useAllMappedEquipmentAssetMappingsClassic = (
  models: AddModelOptions[],
  userSdk?: CogniteClient,
  limit: number = 1000
): UseInfiniteQueryResult<InfiniteData<ModelMappingsWithAssets[]>, Error> => {
  const sdk = useSDK(userSdk);

  return useInfiniteQuery({
    queryKey: [
      'reveal',
      'react-components',
      'all-mapped-equipment-asset-mappings-classic',
      limit,
      ...models.map((model) => [model.modelId, model.revisionId])
    ],
    queryFn: async ({ pageParam }) => {
      const mappedAssetsClassic = await fetchAllMappedEquipmentAssetMappingsClassic(
        sdk,
        models,
        pageParam
      );
      return mappedAssetsClassic;
    },
    initialPageParam: models.map((model) => ({ cursor: 'start', model })),
    staleTime: Infinity,
    getNextPageParam
  });
};

export const useAllMappedEquipmentAssetMappingsHybrid = (
  models: AddModelOptions[],
  limit: number = 1000,
  assetMappingList: ModelWithAssetMappings[],
  userSdk?: CogniteClient
): UseQueryResult<NodeDefinitionWithModelAndMappings[]> => {
  const sdk = useSDK(userSdk);

  const assetsFromHybridMappings = useMemo(() => {
    return assetMappingList.flatMap((mapping) =>
      mapping.assetMappings.map((item) => item.assetInstanceId)
    );
  }, [assetMappingList]).filter(isDefined);

  const assetsFromHybridMappingsKeys = useMemo(
    () => assetsFromHybridMappings.map(createFdmKey),
    [assetsFromHybridMappings]
  );

  const modelKeys = useMemo(
    () => models.map((model) => createModelRevisionKey(model.modelId, model.revisionId)),
    [models]
  );

  return useQuery({
    queryKey: queryKeys.allMappedCoreAssetsForHybridMappings(
      assetsFromHybridMappingsKeys,
      modelKeys,
      limit
    ),
    queryFn: async () => {
      const viewToSearch = COGNITE_ASSET_SOURCE;
      const mappedHybridAssets = await fetchAllMappedEquipmentAssetMappingsHybrid({
        sdk,
        viewToSearch,
        assetMappingList
      });

      return mappedHybridAssets;
    },
    staleTime: Infinity,
    enabled: assetsFromHybridMappingsKeys !== undefined && assetsFromHybridMappingsKeys.length > 0
  });
};

export const useMappingsForAssetIds = (
  models: AddModelOptions[],
  assetIds: number[]
): UseInfiniteQueryResult<InfiniteData<ModelMappingsWithAssets[]>, Error> => {
  const sdk = useSDK();

  return useInfiniteQuery({
    queryKey: [
      'reveal',
      'react-components',
      'mappings-for-asset-ids',
      ...models.map((model) => [model.modelId, model.revisionId]),
      ...assetIds
    ],
    queryFn: async ({ pageParam }) => {
      const currentPagesOfAssetMappingsPromises = models.map(async (model) => {
        const nextCursors = pageParam as Array<{
          cursor: string | 'start' | undefined;
          model: AddModelOptions;
        }>;

        const nextCursor = nextCursors.find(
          (nextCursor) =>
            nextCursor.model.modelId === model.modelId &&
            nextCursor.model.revisionId === model.revisionId
        )?.cursor;

        if (nextCursor === undefined || assetIds.length === 0) {
          return { mappings: { items: [] }, model };
        }

        const filterQueryClassic = {
          cursor: nextCursor === 'start' ? undefined : nextCursor,
          limit: 1000,
          filter: { assetIds }
        };

        const filterQueryHybrid = {
          cursor: nextCursor === 'start' ? undefined : nextCursor,
          limit: 1000,
          filter: { assetIds },
          getDmsInstances: true
        };

        const mappingsClassic = await sdk.assetMappings3D.filter(
          model.modelId,
          model.revisionId,
          filterQueryClassic
        );

        const mappingsHybrid = await sdk.assetMappings3D.filter(
          model.modelId,
          model.revisionId,
          filterQueryHybrid
        );

        const allMappings = mappingsClassic.items.concat(mappingsHybrid.items);
        return { mappings: { items: allMappings }, model };
      });

      const currentPagesOfAssetMappings = await Promise.all(currentPagesOfAssetMappingsPromises);

      const modelsAssets = await getAssetsFromAssetMappings(sdk, currentPagesOfAssetMappings);

      return modelsAssets;
    },
    initialPageParam: models.map((model) => ({ cursor: 'start', model })),
    staleTime: Infinity,
    getNextPageParam
  });
};

function getNextPageParam(
  lastPage: ModelMappingsWithAssets[]
): Array<{ cursor: string | undefined; model: AddModelOptions }> | undefined {
  const nextCursors = lastPage
    .map(({ mappings, model }) => ({ cursor: mappings.nextCursor, model }))
    .filter((mappingModel) => mappingModel.cursor !== undefined);
  if (nextCursors.length === 0) {
    return undefined;
  }
  return nextCursors;
}

function connectMappedInstancesWithSearchResult(
  searchResults: InstancesWithView[],
  mapped3dCDMAssetIdentifiers: UnitDMSUniqueIdentifier[]
): InstancesWithView[] {
  const filteredResults = searchResults.map((result) => {
    const filteredInstances = result.instances.filter((instance) =>
      mapped3dCDMAssetIdentifiers.find(
        (mappedItem) =>
          mappedItem.space === instance.space && mappedItem.externalId === instance.externalId
      )
    );
    return {
      view: result.view,
      instances: filteredInstances
    };
  });

  return filteredResults;
}
