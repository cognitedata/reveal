import { type IdEither } from '@cognite/sdk';
import { type PointCloudAnnotationCache } from '../../components/CacheProvider/PointCloudAnnotationCache';
import { isDefined } from '../../utilities/isDefined';
import { type PointCloudAnnotationMappedAssetData } from '../types';
import { type DmsUniqueIdentifier } from '../../data-providers';

export const fetchAnnotationsForModel = async (
  modelId: number | undefined,
  revisionId: number | undefined,
  assetIds: Array<IdEither | DmsUniqueIdentifier> | undefined,
  pointCloudAnnotationCache: PointCloudAnnotationCache
): Promise<PointCloudAnnotationMappedAssetData[] | undefined> => {
  if (modelId === undefined || revisionId === undefined || assetIds === undefined) {
    return undefined;
  }

  const annotationMappings = await Promise.all(
    assetIds.map(
      async (assetId) =>
        await pointCloudAnnotationCache.matchPointCloudAnnotationsForModel(
          modelId,
          revisionId,
          assetId
        )
    )
  );

  const filteredAnnotationMappings = annotationMappings.filter(isDefined);
  const transformedAnnotationMappings = filteredAnnotationMappings.flatMap((annotationMapping) =>
    Array.from(annotationMapping.entries()).flatMap(([annotationId, assets]) =>
      assets.map((asset) => ({
        annotationId,
        asset
      }))
    )
  );

  return transformedAnnotationMappings;
};
