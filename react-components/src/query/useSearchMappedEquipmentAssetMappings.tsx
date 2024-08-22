/*!
 * Copyright 2023 Cognite AS
 */
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
import { uniq } from 'lodash';

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
): UseInfiniteQueryResult<InfiniteData<AssetPage>, Error> => {
  const sdk = useSDK(userSdk);
  const { data: assetMappingList, isFetched: isAssetMappingNodesFetched } =
    useAssetMappedNodesForRevisions(models.map((model) => ({ ...model, type: 'cad' })));

  return useInfiniteQuery({
    queryKey: [
      'reveal',
      'react-components',
      'search-mapped-asset-mappings',
      query,
      ...models.map((model) => [model.modelId, model.revisionId])
    ],
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      if (query === '' || assetMappingList === undefined) {
        return { assets: [], nextCursor: undefined };
      }

      const fetchAssets = async (
        cursor: string | undefined,
        accumulatedAssets: Asset[]
      ): Promise<{ assets: Asset[]; nextCursor: string | undefined }> => {
        const assetsResponse = await getAssetsList(sdk, {
          query,
          limit,
          cursor
        });

        const fetchedAssets = assetsResponse.items.filter(isDefined);
        const filteredSearchedAssets = assetMappingList.flatMap((mapping) => {
          return mapping.assetMappings
            .filter((assetMapping) =>
              fetchedAssets.some((asset) => asset.id === assetMapping.assetId)
            )
            .map((assetMapping) => fetchedAssets.find((asset) => asset.id === assetMapping.assetId))
            .filter(isDefined);
        });

        const uniqueAssets = uniq([...accumulatedAssets, ...filteredSearchedAssets]);

        if (uniqueAssets.length >= limit || assetsResponse.nextCursor === undefined) {
          return { assets: uniqueAssets, nextCursor: assetsResponse.nextCursor };
        }

        return await fetchAssets(assetsResponse.nextCursor, uniqueAssets);
      };

      const { assets, nextCursor } = await fetchAssets(pageParam, []);

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

export const useAllMappedEquipmentAssetMappings = (
  models: AddModelOptions[],
  userSdk?: CogniteClient,
  limit: number = 1000
): UseInfiniteQueryResult<InfiniteData<ModelMappingsWithAssets[]>, Error> => {
  const sdk = useSDK(userSdk);

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
