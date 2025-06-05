import { type AddModelOptions, type ClassicDataSourceType } from '@cognite/reveal';
import { type AssetMappingAndNode3DCache } from '../../components/CacheProvider/AssetMappingAndNode3DCache';
import { type SearchClassicCadAssetsResponse } from './types';
import { fetchAllAssetsForCadModels } from './fetchAllAssetsForCadModels';
import { searchClassicCadAssetsWithNonEmptyQuery } from './searchClassicCadAssetsWithNonEmptyQuery';
import { type CogniteClient } from '@cognite/sdk';

export async function searchClassicAssetsForCadModels(
  searchQuery: string,
  models: Array<AddModelOptions<ClassicDataSourceType>>,
  limit: number,
  cursor: string | undefined,
  sdk: CogniteClient,
  assetMappingAndNode3dCache: AssetMappingAndNode3DCache
): Promise<SearchClassicCadAssetsResponse> {
  if (searchQuery === '') {
    return await fetchAllAssetsForCadModels(models, limit, cursor, sdk);
  }

  return await searchClassicCadAssetsWithNonEmptyQuery(
    searchQuery,
    models,
    limit,
    cursor,
    sdk,
    assetMappingAndNode3dCache
  );
}
