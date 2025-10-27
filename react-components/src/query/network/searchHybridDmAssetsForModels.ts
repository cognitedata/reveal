import { type CogniteClient, type FilterDefinition } from '@cognite/sdk';
import { type NodeItem } from '../../data-providers';
import {
  isClassicIdentifier,
  type TaggedAddResourceOptions
} from '../../components/Reveal3DResources';
import { searchHybridDmAssetsForCadModels } from './cad/searchHybridDmAssetsForCadModels';
import { type ClassicCadAssetMappingCache } from '../../components/CacheProvider/cad/ClassicCadAssetMappingCache';
import { type PointCloudAnnotationCache } from '../../components/CacheProvider/PointCloudAnnotationCache';
import { searchHybridPointCloudDmAssetsForModels } from './pointcloud/searchHybridPointCloudDmAssetsForModels';
import { type DMSView } from './types';
import { uniqBy } from 'lodash-es';
import { createFdmKey } from '../../components/CacheProvider/idAndKeyTranslation';

export async function searchHybridDmAssetsForModels(
  resources: TaggedAddResourceOptions[],
  view: DMSView,
  options: {
    query?: string;
    filter?: FilterDefinition;
    limit?: number;
  },
  sdk: CogniteClient,
  classicCadCache: ClassicCadAssetMappingCache,
  pointCloudAnnotationCache: PointCloudAnnotationCache
): Promise<NodeItem[]> {
  const rawView = view.rawView;

  const cadResources = resources
    .filter((resource) => resource.type === 'cad')
    .map((resource) => resource.addOptions)
    .filter(isClassicIdentifier);

  const pointCloudSearchedAssets = await searchHybridPointCloudDmAssetsForModels(
    resources,
    view,
    options,
    sdk,
    pointCloudAnnotationCache
  );

  const cadSearchedAssets = await searchHybridDmAssetsForCadModels(
    cadResources,
    rawView,
    options,
    sdk,
    classicCadCache
  );
  return uniqBy<NodeItem>([...cadSearchedAssets, ...pointCloudSearchedAssets], createFdmKey);
}
