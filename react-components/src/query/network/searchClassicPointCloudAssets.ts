import { type Asset, type CogniteClient } from '@cognite/sdk';
import { type ClassicDataSourceType } from '@cognite/reveal';
import { getAssetsMappedPointCloudAnnotations } from './getAssetMappedPointCloudAnnotations';
import { type AddPointCloudResourceOptions } from '../../components';

export async function searchClassicPointCloudAssets(
  searchQuery: string,
  models: Array<AddPointCloudResourceOptions<ClassicDataSourceType>>,
  sdk: CogniteClient
): Promise<Asset[]> {
  const allAssetMappings = await getAssetsMappedPointCloudAnnotations(sdk, models);

  if (searchQuery === '') {
    return allAssetMappings;
  }
  const lowerCaseSearchQuery = searchQuery.toLowerCase();

  return allAssetMappings.filter((asset) => {
    const isInName = asset.name.toLowerCase().includes(lowerCaseSearchQuery);
    const isInDescription = asset.description?.toLowerCase().includes(lowerCaseSearchQuery);

    return isInName || isInDescription;
  });
}
