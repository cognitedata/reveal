import { type CogniteClient, type FilterDefinition, type ViewDefinition } from '@cognite/sdk';
import { type NodeItem } from '../../../data-providers';
import {
  isClassicIdentifier,
  type TaggedAddResourceOptions
} from '../../../components/Reveal3DResources';
import { type PointCloudAnnotationCache } from '../../../components/CacheProvider/PointCloudAnnotationCache';
import { searchHybridDmPointCloudAssetMappingsWithFilters } from './searchHybridDmPointCloudAssetMappingsWithFilters';

export type SearchSort = {
  property: string[];
  direction: 'ascending' | 'descending';
};

export type DMSView = {
  rawView: ViewDefinition;
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
  pointCloudAnnotationCache: PointCloudAnnotationCache
): Promise<NodeItem[]> {
  const rawView = view.rawView;

  const pointCloudResources = resources
    .filter((resource) => resource.type === 'pointcloud')
    .map((resource) => resource.addOptions)
    .filter(isClassicIdentifier);

  return await searchHybridDmPointCloudAssetMappingsWithFilters(
    pointCloudResources,
    rawView,
    options,
    sdk,
    pointCloudAnnotationCache
  );
}
