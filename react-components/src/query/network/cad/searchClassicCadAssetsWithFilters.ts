import { type AddModelOptions, type ClassicDataSourceType } from '@cognite/reveal';
import { type CadModelOptions } from '../../../components';
import { type ClassicCadAssetMappingCache } from '../../../components/CacheProvider/cad/ClassicCadAssetMappingCache';
import type { Asset, CogniteClient } from '@cognite/sdk';
import { type AllAssetFilterProps } from '../common/filters';
import { type SearchClassicCadAssetsResponse } from './types';
import { getAssetsList } from '../../../hooks/network/getAssetsList';
import {
  HybridCadAssetTreeIndexMapping,
  isClassicCadAssetTreeIndexMapping
} from '../../../components/CacheProvider/cad/assetMappingTypes';

type ModelWithHybridTreeIndexMappings = {
  model: CadModelOptions;
  assetMappings: HybridCadAssetTreeIndexMapping[];
};

export async function searchClassicCadAssetsWithFilters(
  models: Array<AddModelOptions<ClassicDataSourceType>>,
  limit: number,
  cursor: string | undefined,
  filters: AllAssetFilterProps | undefined,
  sdk: CogniteClient,
  assetMappingAndNode3dCache: ClassicCadAssetMappingCache
): Promise<SearchClassicCadAssetsResponse> {
  if (models.length === 0) {
    return { data: [], nextCursor: undefined };
  }

  const isFirstPage = cursor === undefined;

  // Assume models are of type CAD
  const cadModels = models.map((model) => ({ ...model, type: 'cad' as const }));

  const assetMappingList = await fetchAssetMappedNodesForRevisions(
    cadModels,
    assetMappingAndNode3dCache
  );

  return await fetchAllAssetsForAssetMappings(
    assetMappingList,
    filters,
    sdk,
    limit,
    cursor,
    isFirstPage
  );
}

async function fetchAllAssetsForAssetMappings(
  assetMappingList: ModelWithHybridTreeIndexMappings[],
  filters: AllAssetFilterProps | undefined,
  sdk: CogniteClient,
  limit: number,
  cursor: string | undefined,
  isFirstPage: boolean
): Promise<SearchClassicCadAssetsResponse> {
  if (!isFirstPage && cursor === undefined) {
    return { data: [], nextCursor: undefined };
  }

  const mappedSearchedAssetIds = new Set<number>();

  const mapped3dAssetIds = new Set(
    assetMappingList.flatMap((mapping) =>
      mapping.assetMappings
        .filter(isClassicCadAssetTreeIndexMapping)
        .map((assetMapping) => assetMapping.assetId)
    )
  );

  const accumulatedAssets: Asset[] = [];

  let nextCursor: string | undefined = cursor;

  do {
    const searchedAssetsResponse = await getAssetsList(sdk, {
      limit: 1000,
      cursor: nextCursor,
      filters
    });

    const filteredMappedSearchedAssets = searchedAssetsResponse.items.filter(
      (asset) => mapped3dAssetIds.has(asset.id) && !mappedSearchedAssetIds.has(asset.id)
    );

    accumulatedAssets.push(...searchedAssetsResponse.items);

    nextCursor = searchedAssetsResponse.nextCursor;

    filteredMappedSearchedAssets.forEach((asset) => {
      mappedSearchedAssetIds.add(asset.id);
    });
  } while (accumulatedAssets.length < limit && nextCursor !== undefined);

  return { data: accumulatedAssets, nextCursor };
}

async function fetchAssetMappedNodesForRevisions(
  cadModels: CadModelOptions[],
  assetMappingAndNode3dCache: ClassicCadAssetMappingCache
): Promise<ModelWithHybridTreeIndexMappings[]> {
  const fetchPromises = cadModels.map(async (model) => {
    const assetMappings = await assetMappingAndNode3dCache.getAssetMappingsForModel(
      model.modelId,
      model.revisionId
    );
    return { model, assetMappings };
  });

  return await Promise.all(fetchPromises);
}
