import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { type PointCloudAnnotationMappedAssetData } from '../types';
import { EMPTY_ARRAY } from '../../utilities/constants';
import { type AnyIntersection } from '@cognite/reveal';
import { queryKeys } from '../../utilities/queryKeys';
import { useContext } from 'react';
import { UsePointCloudAnnotationMappingForIntersectionContext } from './usePointCloudAnnotationMappingForIntersection.context';
import { getPointCloudInstanceFromIntersection } from './getPointCloudInstanceFromIntersection';
import {
  type InstanceReference,
  isDmsInstance,
  isExternalId,
  isInternalId
} from '../../utilities/instanceIds';

export const usePointCloudAnnotationMappingForIntersection = (
  intersection: AnyIntersection | undefined
): UseQueryResult<PointCloudAnnotationMappedAssetData[]> => {
  const { usePointCloudAnnotationCache, fetchAnnotationsForModel } = useContext(
    UsePointCloudAnnotationMappingForIntersectionContext
  );

  const pointCloudAnnotationCache = usePointCloudAnnotationCache();

  const isPointCloudIntersection = intersection?.type === 'pointcloud';
  const instanceData = getPointCloudInstanceFromIntersection(intersection);
  const classicModelIdentifier = instanceData?.classicModelIdentifier;
  const instanceReference = instanceData?.instanceReference;

  const queryKeyString =
    classicModelIdentifier !== undefined
      ? `${classicModelIdentifier.modelId}/${classicModelIdentifier.revisionId}`
      : '';

  const instanceQueryString = createInstanceQueryString(instanceReference);
  return useQuery({
    queryKey: [queryKeys.pointCloudAnnotationForAssetId(queryKeyString, instanceQueryString)],
    queryFn: async () => {
      if (classicModelIdentifier === undefined || instanceReference === undefined) {
        return EMPTY_ARRAY;
      }
      const result = await fetchAnnotationsForModel(
        classicModelIdentifier.modelId,
        classicModelIdentifier.revisionId,
        [instanceReference],
        pointCloudAnnotationCache
      );
      return result ?? EMPTY_ARRAY;
    },
    staleTime: Infinity,
    enabled: isPointCloudIntersection && instanceReference !== undefined
  });
};

function createInstanceQueryString(instanceReference: InstanceReference | undefined): string {
  if (isInternalId(instanceReference)) {
    return `${instanceReference.id}`;
  }
  if (isExternalId(instanceReference) && !isDmsInstance(instanceReference)) {
    return `${instanceReference.externalId}`;
  }
  if (isDmsInstance(instanceReference)) {
    return `${instanceReference.externalId}/${instanceReference.space}`;
  }
  return '';
}
