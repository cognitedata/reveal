/*!
 * Copyright 2023 Cognite AS
 */
import { useRef } from 'react';
import { type AddModelOptions } from '@cognite/reveal';
import {
  type Asset,
  type AssetMapping3D,
  type CogniteClient,
  type ListResponse
} from '@cognite/sdk';
import {
  type UseInfiniteQueryResult,
  useInfiniteQuery,
  type InfiniteData
} from '@tanstack/react-query';
import { useSDK } from '../components/RevealCanvas/SDKProvider';
import { getAssetsList } from '../hooks/network/getAssetsList';
import { useAssetMappedNodesForRevisions } from '../components/CacheProvider/AssetMappingAndNode3DCacheProvider';
import { isDefined } from '../utilities/isDefined';

export type ModelMappings = {
  model: AddModelOptions;
  mappings: ListResponse<AssetMapping3D[]>;
};

export type ModelMappingsWithAssets = ModelMappings & {
  assets: Asset[];
};

export type AssetPage = {
  assets: Asset[];
  nextCursor: string | undefined;
};

export type ModelAssetPage = {
  modelsAssets: ModelMappingsWithAssets[];
  nextCursor: string | undefined;
};

export const useSearchMappedEquipmentAssetMappings = (
  query: string,
  models: AddModelOptions[],
  limit: number = 100,
  userSdk?: CogniteClient
): UseInfiniteQueryResult<InfiniteData<AssetPage[]>, Error> => {
  const sdk = useSDK(userSdk);
  const { data: assetMappingList, isFetched } = useAssetMappedNodesForRevisions(
    models.map((model) => ({ ...model, type: 'cad' }))
  );
  const initialAssetMappings = useAllMappedEquipmentAssetMappings(models, sdk);

  return useInfiniteQuery({
    queryKey: [
      'reveal',
      'react-components',
      'search-mapped-asset-mappings',
      query,
      ...models.map((model) => [model.modelId, model.revisionId])
    ],
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      if (initialAssetMappings.data === undefined) {
        return { assets: [], nextCursor: undefined };
      }
      if (query === '') {
        const assets = initialAssetMappings.data?.pages.flatMap((modelWithAssets) =>
          modelWithAssets
            .map((modelWithAsset) =>
              modelWithAsset.modelsAssets.flatMap((modelsAsset) => modelsAsset.assets)
            )
            .flat()
        );
        return { assets, nextCursor: undefined };
      }
      if (assetMappingList === undefined) {
        return { assets: [], nextCursor: undefined };
      }
      const assetsResponse = await getAssetsList(sdk, {
        query,
        limit,
        cursor: pageParam
      });

      const assets = assetsResponse.items.filter(isDefined);
      const filteredSearchedAssets = assetMappingList.flatMap((mapping) => {
        return mapping.assetMappings
          .filter((assetMapping) => assets.some((asset) => asset.id === assetMapping.assetId))
          .map((assetMapping) => assets.find((asset) => asset.id === assetMapping.assetId))
          .filter(isDefined);
      });

      return {
        assets: filteredSearchedAssets,
        nextCursor: assetsResponse.nextCursor
      };
    },
    initialPageParam: undefined,
    staleTime: Infinity,
    getNextPageParam: (_lastPage, allPages) => {
      const lastPageData = allPages[allPages.length - 1];
      return lastPageData.nextCursor;
    },
    enabled: isFetched && assetMappingList !== undefined && assetMappingList.length > 0
  });
};

export const useAllMappedEquipmentAssetMappings = (
  models: AddModelOptions[],
  userSdk?: CogniteClient,
  limit: number = 1000
): UseInfiniteQueryResult<InfiniteData<ModelAssetPage[]>, Error> => {
  const sdk = useSDK(userSdk);
  const usedCursors = useRef(new Set());

  return useInfiniteQuery({
    queryKey: [
      'reveal',
      'react-components',
      'all-mapped-equipment-asset-mappings',
      ...models.map((model) => [model.modelId, model.revisionId])
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

        if (nextCursor === undefined) {
          return { mappings: { items: [] }, model };
        }

        const mappings = await sdk.assetMappings3D.filter(model.modelId, model.revisionId, {
          cursor: nextCursor === 'start' ? undefined : nextCursor,
          limit
        });

        usedCursors.current.add(nextCursor);

        return { mappings, model };
      });

      const currentPagesOfAssetMappings = await Promise.all(currentPagesOfAssetMappingsPromises);

      const modelsAssets = await getAssetsFromAssetMappings(sdk, currentPagesOfAssetMappings);
      const nextCursors = currentPagesOfAssetMappings
        .map(({ mappings }) => mappings.nextCursor)
        .filter(isDefined);

      return await Promise.resolve({
        modelsAssets,
        nextCursors
      });
    },
    initialPageParam: models.map((model) => ({ cursor: 'start', model })),
    staleTime: Infinity,
    getNextPageParam: (lastPage: {
      modelsAssets: ModelMappingsWithAssets[];
      nextCursors: string[];
    }): Array<{ cursor: string | undefined; model: AddModelOptions }> | undefined => {
      const nextCursors = lastPage.nextCursors
        .map((cursor, index) => ({ cursor, model: lastPage.modelsAssets[index].model }))
        .filter((mappingModel) => {
          if (mappingModel.cursor === undefined || usedCursors.current.has(mappingModel.cursor)) {
            return false;
          }
          usedCursors.current.add(mappingModel.cursor);
          return true;
        });
      if (nextCursors.length === 0) {
        return undefined;
      }
      return nextCursors;
    }
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

        if (nextCursor === undefined) {
          return { mappings: { items: [] }, model };
        }

        const mappings = await sdk.assetMappings3D.filter(model.modelId, model.revisionId, {
          cursor: nextCursor === 'start' ? undefined : nextCursor,
          limit: 1000,
          filter: { assetIds }
        });

        return { mappings, model };
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

async function getAssetsFromAssetMappings(
  sdk: CogniteClient,
  modelsMappings: Array<{ model: AddModelOptions; mappings: ListResponse<AssetMapping3D[]> }>
): Promise<ModelMappingsWithAssets[]> {
  const mappingsWithAssetsPromises = modelsMappings.map(async ({ mappings, model }) => {
    if (mappings.items.length === 0) {
      return { model, assets: [], mappings };
    }

    const deduplicatedAssetIds = Array.from(
      new Set(mappings.items.map((mapping) => mapping.assetId))
    );
    const assetIdObjects = deduplicatedAssetIds.map((id) => ({ id }));

    const assets = await sdk.assets.retrieve(assetIdObjects, { ignoreUnknownIds: true });

    return { model, assets, mappings };
  });

  const mappingsWithAssets = await Promise.all(mappingsWithAssetsPromises);

  return mappingsWithAssets;
}
