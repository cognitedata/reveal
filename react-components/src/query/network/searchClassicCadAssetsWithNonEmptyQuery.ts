import { AddModelOptions, ClassicDataSourceType } from '@cognite/reveal';
import { CadModelOptions } from '../../components';
import { AssetMappingAndNode3DCache } from '../../components/CacheProvider/AssetMappingAndNode3DCache';
import { ModelWithAssetMappings } from '../../hooks/cad/ModelWithAssetMappings';
import { Asset, CogniteClient } from '@cognite/sdk';
import { SearchClassicCadAssetsResponse } from './types';
import { getAssetsList } from '../../hooks/network/getAssetsList';
import { isDefined } from '../../utilities/isDefined';

export async function searchClassicCadAssetsWithNonEmptyQuery(
  searchQuery: string,
  models: AddModelOptions<ClassicDataSourceType>[],
  limit: number,
  cursor: string | undefined,
  sdk: CogniteClient,
  assetMappingAndNode3dCache: AssetMappingAndNode3DCache
): Promise<SearchClassicCadAssetsResponse> {
  // Checking whether a model is of type CAD or PointCloud requires a separate query,
  // but the endpoints will simply return empty results for point clouds
  const cadModels = models.map((model) => ({ ...model, type: 'cad' as const }));

  const assetMappingList = await fetchAssetMappedNodesForRevisions(
    cadModels,
    assetMappingAndNode3dCache
  );

  const mapped3dAssetIds = new Set(
    assetMappingList.flatMap((mapping) =>
      mapping.assetMappings.map((assetMapping) => assetMapping.assetId)
    )
  );

  const fetchAssets = async (
    cursor: string | undefined,
    accumulatedAssets: Asset[],
    mappedSearchedAssetIds: Set<number>
  ): Promise<{ assets: Asset[]; nextCursor: string | undefined }> => {
    const searchedAssetsResponse = await getAssetsList(sdk, {
      query: searchQuery,
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

  const mappedSearchedAssetIds = new Set<number>();

  const { assets, nextCursor } = await fetchAssets(cursor, [], mappedSearchedAssetIds);

  return { data: assets, nextCursor };
}

async function fetchAssetMappedNodesForRevisions(
  cadModels: CadModelOptions[],
  assetMappingAndNode3dCache: AssetMappingAndNode3DCache
): Promise<ModelWithAssetMappings[]> {
  const fetchPromises = cadModels.map(async (model) => {
    const assetMappings = await assetMappingAndNode3dCache.getAssetMappingsForModel(
      model.modelId,
      model.revisionId
    );

    return { model, assetMappings };
  });

  return await Promise.all(fetchPromises);
}
