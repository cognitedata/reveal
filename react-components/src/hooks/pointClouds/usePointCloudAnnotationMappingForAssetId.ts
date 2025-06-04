import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { type PointCloudAnnotationMappedAssetData } from '../types';
import { EMPTY_ARRAY } from '../../utilities/constants';
import { type AnyIntersection } from '@cognite/reveal';
import { queryKeys } from '../../utilities/queryKeys';
import { usePointCloudAnnotationCache } from '../../components/CacheProvider/CacheProvider';
import { fetchAnnotationsForModel } from './fetchAnnotationsForModel';

export const usePointCloudAnnotationMappingForAssetId = (
  intersection: AnyIntersection | undefined
): UseQueryResult<PointCloudAnnotationMappedAssetData[]> => {
  const pointCloudAnnotationCache = usePointCloudAnnotationCache();

  const isPointCloudIntersection = intersection?.type === 'pointcloud';
  const [modelId, revisionId, assetId] = isPointCloudIntersection
    ? [
        intersection.model.modelId,
        intersection.model.revisionId,
        intersection.assetRef?.externalId ?? intersection.assetRef?.id
      ]
    : [undefined, undefined, undefined];

  return useQuery({
    queryKey: [
      queryKeys.pointCloudAnnotationForAssetId(
        `${modelId}/${revisionId}`,
        assetId?.toString() ?? ''
      )
    ],
    queryFn: async () => {
      if (modelId === undefined || revisionId === undefined || assetId === undefined) {
        return EMPTY_ARRAY;
      }
      const result = await fetchAnnotationsForModel(
        modelId,
        revisionId,
        [assetId],
        pointCloudAnnotationCache
      );
      return result ?? EMPTY_ARRAY;
    },
    staleTime: Infinity,
    enabled: isPointCloudIntersection && assetId !== undefined
  });
};
