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
  type UseQueryResult,
  useInfiniteQuery,
  useQuery,
  type InfiniteData
} from '@tanstack/react-query';
import { useSDK } from '../components/RevealCanvas/SDKProvider';
import { chunk } from 'lodash';

export type ModelMappings = {
  model: AddModelOptions;
  mappings: ListResponse<AssetMapping3D[]>;
};

export type ModelMappingsWithAssets = ModelMappings & {
  assets: Asset[];
};

export const useSearchMappedEquipmentAssetMappings = (
  query: string,
  models: AddModelOptions[],
  limit: number = 100,
  userSdk?: CogniteClient
): UseQueryResult<Asset[]> => {
  const sdk = useSDK(userSdk);
  const modelsKey = models.map((model) => [model.modelId, model.revisionId]);
  const { data: assetMappings, isFetched } = useAllMappedEquipmentAssetMappings(models, sdk);

  return useQuery({
    queryKey: ['reveal', 'react-components', 'search-mapped-asset-mappings', query, modelsKey],
    queryFn: async () => {
      if (query === '') {
        const mappedAssets =
          assetMappings?.pages
            .flat()
            .map((item) => item.assets)
            .flat() ?? [];
        return mappedAssets;
      }

      const searchedAssets = await sdk.assets.search({ search: { query }, limit: 1000 });
      const assetMappingsWithSearch = await getAssetMappingsByModels(
        sdk,
        models,
        limit,
        searchedAssets.map((asset) => asset.id)
      );

      const assetMappingsSet = createAssetMappingsSet(assetMappingsWithSearch);
      const filteredSearchedAssets = searchedAssets.filter((asset) =>
        assetMappingsSet.has(asset.id)
      );

      return filteredSearchedAssets;
    },
    staleTime: Infinity,
    enabled: isFetched && assetMappings !== undefined
  });
};

export const useAllMappedEquipmentAssetMappings = (
  models: AddModelOptions[],
  userSdk?: CogniteClient
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
          limit: 1000
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
): UseInfiniteQueryResult<ModelMappingsWithAssets[]> => {
  const sdk = useSDK();

  return useInfiniteQuery(
    [
      'reveal',
      'react-components',
      'mappings-for-asset-ids',
      ...models.map((model) => [model.modelId, model.revisionId]),
      ...assetIds
    ],
    async ({ pageParam = models.map((model) => ({ cursor: 'start', model })) }) => {
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
    {
      staleTime: Infinity,
      getNextPageParam
    }
  );
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

async function getAssetMappingsByModels(
  sdk: CogniteClient,
  models: AddModelOptions[],
  limit: number = 1000,
  assetIdsFilter?: number[]
): Promise<ModelMappings[]> {
  const mappedEquipmentPromises = models.map(async (model) => {
    if (assetIdsFilter === undefined) {
      const mappings = await sdk.assetMappings3D.filter(model.modelId, model.revisionId, {
        limit
      });
      return [{ mappings, model }];
    }

    const deduplicatedAssetIds = Array.from(new Set(assetIdsFilter));
    const chunkedFilter = chunk(deduplicatedAssetIds, 100);

    const chunkedPromises = chunkedFilter.map(async (chunk) => {
      const mappings = await sdk.assetMappings3D.filter(model.modelId, model.revisionId, {
        filter: { assetIds: chunk },
        limit
      });
      return { mappings, model };
    });

    return await Promise.all(chunkedPromises);
  });

  const mappedEquipment = await Promise.all(mappedEquipmentPromises);

  return mappedEquipment.flat();
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

function createAssetMappingsSet(
  assetMappings: Array<{ model: AddModelOptions; mappings: ListResponse<AssetMapping3D[]> }>
): Set<number> {
  return new Set(
    assetMappings.map(({ mappings }) => mappings.items.map((item) => item.assetId)).flat()
  );
}
