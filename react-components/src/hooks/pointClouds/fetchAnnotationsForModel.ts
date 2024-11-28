import { PointCloudAnnotationCache } from '../../components/CacheProvider/PointCloudAnnotationCache';
import { isDefined } from '../../utilities/isDefined';
import { PointCloudAnnotationMappedAssetData } from '../types';

export const fetchAnnotationsForModel = async (
  modelId: number | undefined,
  revisionId: number | undefined,
  assetIds: Array<string | number> | undefined,
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
    Array.from(annotationMapping.entries()).map(([annotationId, asset]) => ({
      annotationId,
      asset
    }))
  );

  return transformedAnnotationMappings;
};
