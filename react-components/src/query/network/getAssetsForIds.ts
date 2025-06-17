import type { Asset, CogniteClient, IdEither } from '@cognite/sdk';
import { chunk } from 'lodash';
import { buildAssetIdFilter, combineAdvancedFilters } from './buildFilter';
import { getAssetsList } from '../../hooks/network/getAssetsList';
import type { AllAssetFilterProps } from './types';

const MAX_PARALLEL_ASSET_REQUESTS = 5;

const MAX_LIMIT_ASSETS_BY_IDS = 1000;
const MAX_LIMIT_ASSETS_BY_LIST_WITH_IDS = 100;

export async function getAssetsForIds(
  assetRefs: IdEither[],
  filter: AllAssetFilterProps | undefined,
  sdk: CogniteClient
): Promise<Asset[]> {
  if (assetRefs.length === 0) {
    return [];
  }

  if (filter === undefined) {
    return await getAssetsForIdsWithoutFilter(assetRefs, sdk);
  }

  return await getAssetsForIdsWithFilter(assetRefs, filter, sdk);
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
  filter: AllAssetFilterProps | undefined,
  sdk: CogniteClient
): Promise<Asset[]> {
  const assetRefChunks = chunk(assetRefs, MAX_LIMIT_ASSETS_BY_LIST_WITH_IDS);

  const allAssetResults: Asset[] = [];

  for (const assetRefChunkBatch of chunk(assetRefChunks, MAX_PARALLEL_ASSET_REQUESTS)) {
    const assetsForChunkBatch = await Promise.all(
      assetRefChunkBatch.map(async (assetRefChunk) => {
        const idFilter = buildAssetIdFilter(assetRefChunk);

        const { items } = await getAssetsList(sdk, {
          filter: {
            ...filter,
            advancedFilter: combineAdvancedFilters([filter?.advancedFilter, idFilter])
          },
          limit: MAX_LIMIT_ASSETS_BY_LIST_WITH_IDS
        });

        // Since the filter narrows down the result to only the input IDs, we
        // can expect that there will be no need for pagination
        return items;
      })
    );

    allAssetResults.push(...assetsForChunkBatch.flat());
  }

  return allAssetResults;
}
