import { type AddModelOptions, type ClassicDataSourceType } from '@cognite/reveal';
import { type CadModelOptions } from '../../components';
import { type ClassicCadAssetMappingCache } from '../../components/CacheProvider/cad/ClassicCadAssetMappingCache';
import { type ModelWithAssetTreeIndexMappings } from '../../hooks/cad/modelWithAssetMappings';
import type { Asset, CogniteClient } from '@cognite/sdk';
import { type AllAssetFilterProps } from './filters';
import { type SearchClassicCadAssetsResponse } from './types';
import { getAssetsList } from '../../hooks/network/getAssetsList';
import { isDefined } from '../../utilities/isDefined';
import { isClassicCadAssetTreeIndexMapping } from '../../components/CacheProvider/cad/assetMappingTypes';

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

  // Assume models are of type CAD
  const cadModels = models.map((model) => ({ ...model, type: 'cad' as const }));

  const assetMappingList = await fetchAssetMappedNodesForRevisions(
    cadModels,
    assetMappingAndNode3dCache
  );

  const mapped3dAssetIds = new Set(
    assetMappingList.flatMap((mapping) =>
      mapping.assetMappings
        .filter(isClassicCadAssetTreeIndexMapping)
        .map((assetMapping) => assetMapping.assetId)
    )
  );

  const fetchAssets = async (
    cursor: string | undefined,
    accumulatedAssets: Asset[],
    mappedSearchedAssetIds: Set<number>
  ): Promise<{ assets: Asset[]; nextCursor: string | undefined }> => {
    const searchedAssetsResponse = await getAssetsList(sdk, {
      limit: 1000,
      cursor,
      filters
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

  const mappedSearchedAssetIds = new Set<number>();

  const { assets, nextCursor } = await fetchAssets(cursor, [], mappedSearchedAssetIds);

  return { data: assets, nextCursor };
}

async function fetchAssetMappedNodesForRevisions(
  cadModels: CadModelOptions[],
  assetMappingAndNode3dCache: ClassicCadAssetMappingCache
): Promise<ModelWithAssetTreeIndexMappings[]> {
  const fetchPromises = cadModels.map(async (model) => {
    const assetMappings = await assetMappingAndNode3dCache.getAssetMappingsForModel(
      model.modelId,
      model.revisionId
    );

    return { model, assetMappings: assetMappings.filter(isClassicCadAssetTreeIndexMapping) };
  });

  return await Promise.all(fetchPromises);
}
