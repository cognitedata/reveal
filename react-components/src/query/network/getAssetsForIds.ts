import type { Asset, CogniteClient, IdEither } from '@cognite/sdk';
import { chunk } from 'lodash';
import { buildClassicAssetIdFilter, combineClassicAssetFilters } from './buildClassicAssetFilter';
import { getAssetsList } from '../../hooks/network/getAssetsList';
import type { AllAssetFilterProps } from './types';

const MAX_PARALLEL_ASSET_REQUESTS = 5;

const MAX_LIMIT_ASSETS_BY_IDS = 1000;
const MAX_LIMIT_ASSETS_BY_LIST_WITH_IDS = 100;

export async function getAssetsForIds(
  assetRefs: IdEither[],
  filters: AllAssetFilterProps | undefined,
  sdk: CogniteClient
): Promise<Asset[]> {
  if (assetRefs.length === 0) {
    return [];
  }

  if (filters === undefined) {
    return await getAssetsForIdsWithoutFilter(assetRefs, sdk);
  }

  return await getAssetsForIdsWithFilter(assetRefs, filters, sdk);
}

async function getAssetsForIdsWithoutFilter(
  assetRefs: IdEither[],
  sdk: CogniteClient
): Promise<Asset[]> {
  const assetRefChunks = chunk(assetRefs, MAX_LIMIT_ASSETS_BY_IDS);

  const allAssetResults: Asset[] = [];

  for (const assetRefChunkBatch of chunk(assetRefChunks, MAX_PARALLEL_ASSET_REQUESTS)) {
    const assetsForChunkBatch = await Promise.all(
      assetRefChunkBatch.map(
        async (assetRefChunk) =>
          await sdk.assets.retrieve(assetRefChunk, { ignoreUnknownIds: true })
      )
    );

    allAssetResults.push(...assetsForChunkBatch.flat());
  }

  return allAssetResults;
}

async function getAssetsForIdsWithFilter(
  assetRefs: IdEither[],
  filters: AllAssetFilterProps | undefined,
  sdk: CogniteClient
): Promise<Asset[]> {
  const assetRefChunks = chunk(assetRefs, MAX_LIMIT_ASSETS_BY_LIST_WITH_IDS);

  const allAssetResults: Asset[] = [];

  for (const assetRefChunkBatch of chunk(assetRefChunks, MAX_PARALLEL_ASSET_REQUESTS)) {
    const assetsForChunkBatch = await getAssetsForChunks(assetRefChunkBatch, filters, sdk);

    allAssetResults.push(...assetsForChunkBatch.flat());
  }

  return allAssetResults;
}

async function getAssetsForChunks(
  assetRefChunkBatch: IdEither[][],
  filters: AllAssetFilterProps | undefined,
  sdk: CogniteClient
): Promise<Asset[][]> {
  return await Promise.all(
    assetRefChunkBatch.map(async (assetRefChunk) => {
      const idFilter = buildClassicAssetIdFilter(assetRefChunk);
      const advancedFilter = combineClassicAssetFilters([filters?.advancedFilter, idFilter]);

      const { items } = await getAssetsList(sdk, {
        filters: {
          ...filters,
          advancedFilter
        },
        limit: MAX_LIMIT_ASSETS_BY_LIST_WITH_IDS
      });

      // Since the filter narrows down the result to only the input IDs, we
      // can expect that there will be no need for pagination
      return items;
    })
  );
}
