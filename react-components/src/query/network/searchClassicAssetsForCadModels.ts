import { type AddModelOptions, type ClassicDataSourceType } from '@cognite/reveal';
import { type AssetMappingAndNode3DCache } from '../../components/CacheProvider/AssetMappingAndNode3DCache';
import { type AllAssetFilterProps, hasFilters, type SearchClassicCadAssetsResponse } from './types';
import { type CursorForModel, fetchAllAssetsForCadModels } from './fetchAllAssetsForCadModels';
import { searchClassicCadAssetsWithFilters } from './searchClassicCadAssetsWithFilters';
import { type CogniteClient } from '@cognite/sdk';

export async function searchClassicAssetsForCadModels(
  models: Array<AddModelOptions<ClassicDataSourceType>>,
  limit: number,
  cursor: string | undefined,
  filters: AllAssetFilterProps | undefined,
  sdk: CogniteClient,
  assetMappingAndNode3dCache: AssetMappingAndNode3DCache
): Promise<SearchClassicCadAssetsResponse> {
  if (!hasFilters(filters)) {
    const cursorsForModels =
      cursor === undefined ? undefined : (JSON.parse(cursor) as CursorForModel[]);

    return await fetchAllAssetsForCadModels(models, limit, cursorsForModels, sdk);
  }

  return await searchClassicCadAssetsWithFilters(
    models,
    limit,
    cursor,
    filters,
    sdk,
    assetMappingAndNode3dCache
  );
}
