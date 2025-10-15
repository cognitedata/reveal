import { type CogniteClient, type FilterDefinition } from '@cognite/sdk';
import { type NodeItem } from '../../../data-providers';
import {
  isClassicIdentifier,
  type TaggedAddResourceOptions
} from '../../../components/Reveal3DResources';
import { type PointCloudAnnotationCache } from '../../../components/CacheProvider/PointCloudAnnotationCache';
import { searchHybridDmPointCloudAssetMappingsWithFilters } from './searchHybridDmPointCloudAssetMappingsWithFilters';
import { type DMSView } from '../types';

type SearchHybridDmAssetsForPointModelDependency = {
  searchHybridDmPointCloudAssetMappingsWithFilters: typeof searchHybridDmPointCloudAssetMappingsWithFilters;
};

const defaultDependencies: SearchHybridDmAssetsForPointModelDependency = {
  searchHybridDmPointCloudAssetMappingsWithFilters
};

export async function searchHybridPointCloudDmAssetsForModels(
  resources: TaggedAddResourceOptions[],
  view: DMSView,
  options: {
    query?: string;
    filter?: FilterDefinition;
    limit?: number;
  },
  sdk: CogniteClient,
  pointCloudAnnotationCache: PointCloudAnnotationCache,
  dependencies: SearchHybridDmAssetsForPointModelDependency = defaultDependencies
): Promise<NodeItem[]> {
  const rawView = view.rawView;

  const pointCloudResources = resources
    .filter((resource) => resource.type === 'pointcloud')
    .map((resource) => resource.addOptions)
    .filter(isClassicIdentifier);

  return await dependencies.searchHybridDmPointCloudAssetMappingsWithFilters(
    pointCloudResources,
    rawView,
    options,
    sdk,
    pointCloudAnnotationCache
  );
}
