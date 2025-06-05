import { AddModelOptions, ClassicDataSourceType } from '@cognite/reveal';
import { AssetMappingAndNode3DCache } from '../../components/CacheProvider/AssetMappingAndNode3DCache';
import { SearchClassicCadAssetsResponse } from './types';
import { fetchAllAssetsForCadModels } from './fetchAllAssetsForCadModels';
import { searchClassicCadAssetsWithNonEmptyQuery } from './searchClassicCadAssetsWithNonEmptyQuery';
import { CogniteClient } from '@cognite/sdk';

export function searchClassicAssetsForCadModels(
  searchQuery: string,
  models: AddModelOptions<ClassicDataSourceType>[],
  limit: number,
  cursor: string | undefined,
  sdk: CogniteClient,
  assetMappingAndNode3dCache: AssetMappingAndNode3DCache
): Promise<SearchClassicCadAssetsResponse> {
  if (searchQuery === '') {
    console.log('All assets!!');
    return fetchAllAssetsForCadModels(models, limit, cursor, sdk);
  }

  console.log('Assets with query: ', searchQuery);

  return searchClassicCadAssetsWithNonEmptyQuery(
    searchQuery,
    models,
    limit,
    cursor,
    sdk,
    assetMappingAndNode3dCache
  );
}
