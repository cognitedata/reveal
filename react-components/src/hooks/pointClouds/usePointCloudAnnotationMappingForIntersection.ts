import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { type PointCloudAnnotationMappedAssetData } from '../types';
import { EMPTY_ARRAY } from '../../utilities/constants';
import { type AnyIntersection } from '@cognite/reveal';
import { queryKeys } from '../../utilities/queryKeys';
import { usePointCloudAnnotationCache } from '../../components/CacheProvider/CacheProvider';
import { fetchAnnotationsForModel } from './fetchAnnotationsForModel';
import { getInstanceDataFromIntersection } from './getInstanceDataFromIntersection';
import { isIdEither } from '../../utilities/instanceIds';

export const usePointCloudAnnotationMappingForIntersection = (
  intersection: AnyIntersection | undefined
): UseQueryResult<PointCloudAnnotationMappedAssetData[]> => {
  const pointCloudAnnotationCache = usePointCloudAnnotationCache();

  const isPointCloudIntersection = intersection?.type === 'pointcloud';
  const instanceData = getInstanceDataFromIntersection(intersection);
  const classicModelIdentifier = instanceData?.classicModelIdentifier;
  const dmsModelUniqueIdentifier = instanceData?.dmsModelUniqueIdentifier;
  const reference = instanceData?.reference;

  const queryKeyString = classicModelIdentifier
    ? `${classicModelIdentifier.modelId}/${classicModelIdentifier.revisionId}`
    : `${dmsModelUniqueIdentifier?.revisionExternalId}/${dmsModelUniqueIdentifier?.revisionSpace}`;

  return useQuery({
    queryKey: [
      queryKeys.pointCloudAnnotationForAssetId(queryKeyString, JSON.stringify(reference) ?? '')
    ],
    queryFn: async () => {
      if (classicModelIdentifier === undefined || reference === undefined) {
        return EMPTY_ARRAY;
      }
      const result = await fetchAnnotationsForModel(
        classicModelIdentifier.modelId,
        classicModelIdentifier.revisionId,
        [reference],
        pointCloudAnnotationCache
      );
      return result ?? EMPTY_ARRAY;
    },
    staleTime: Infinity,
    enabled: isPointCloudIntersection && reference !== undefined
  });
};
