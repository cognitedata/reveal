import { type AddModelOptions, type ClassicDataSourceType } from '@cognite/reveal';
import { type AssetMappingAndNode3DCache } from '../../components/CacheProvider/AssetMappingAndNode3DCache';
import { type SearchClassicCadAssetsResponse } from './types';
import { type CursorForModel, fetchAllAssetsForCadModels } from './fetchAllAssetsForCadModels';
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
    const cursorsForModels =
      cursor === undefined ? undefined : (JSON.parse(cursor) as CursorForModel[]);

    return await fetchAllAssetsForCadModels(models, limit, cursorsForModels, sdk);
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
