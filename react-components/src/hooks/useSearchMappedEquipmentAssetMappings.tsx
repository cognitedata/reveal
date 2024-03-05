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
  useQuery
} from '@tanstack/react-query';
import { useSDK } from '../components/RevealCanvas/SDKProvider';

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
  userSdk: CogniteClient
): UseQueryResult<Asset[]> => {
  const modelsKey = models.map((model) => [model.modelId, model.revisionId]);
  const { data: assetMappings, isFetched } = useAllMappedEquipmentAssetMappings(models, userSdk);

  return useQuery(
    ['reveal', 'react-components', 'search-mapped-asset-mappings', query, modelsKey],
    async () => {
      const mappedAssets =
        assetMappings?.pages
          .flat()
          .map((item) => item.assets)
          .flat() ?? [];
      if (query === '') {
        return mappedAssets;
      }

      const filteredSearchedAssets =
        mappedAssets.filter((asset) => {
          const isInName = asset.name.toLowerCase().includes(query.toLowerCase());
          const isInDescription = asset.description?.toLowerCase().includes(query.toLowerCase());

          return isInName || isInDescription;
        }) ?? [];

      return filteredSearchedAssets;
    },
    {
      staleTime: Infinity,
      enabled: isFetched && assetMappings !== undefined
    }
  );
};

export const useAllMappedEquipmentAssetMappings = (
  models: AddModelOptions[],
  userSdk?: CogniteClient
): UseInfiniteQueryResult<ModelMappingsWithAssets[]> => {
  const sdk = useSDK(userSdk);

  return useInfiniteQuery(
    [
      'reveal',
      'react-components',
      'all-mapped-equipment-asset-mappings',
      ...models.map((model) => [model.modelId, model.revisionId])
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
          limit: 1000
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
