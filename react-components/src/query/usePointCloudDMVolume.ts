/*!
 * Copyright 2024 Cognite AS
 */

import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import {
  type CadPointCloudModelWithModelIdRevisionId,
  type PointCloudModelOptions
} from '../components/Reveal3DResources/types';
import { type DMInstanceRef } from '@cognite/reveal';
import { usePointCloudDMAnnotation } from '../components/CacheProvider/PointCloudDMAnnotation';
import { queryKeys } from '../utilities/queryKeys';

export const usePointCloudDMVolume = (
  modelsData: CadPointCloudModelWithModelIdRevisionId[]
): UseQueryResult<
  Array<{
    model: PointCloudModelOptions;
    instanceRefs: DMInstanceRef[];
  }>
> => {
  const { data: pointCloudMappedDMData } = usePointCloudDMAnnotation(modelsData);

  return useQuery({
    queryKey: [queryKeys.pointCloudDMVolume(), modelsData],
    queryFn: async () => {
      if (pointCloudMappedDMData === undefined) {
        return [];
      }
      const result = pointCloudMappedDMData.map(({ model, pointCloudDMVolumeWithAsset }) => {
        return {
          model,
          instanceRefs: pointCloudDMVolumeWithAsset.map((volume) => {
            return { externalId: volume.externalId, space: volume.space };
          })
        };
      });
      return result;
    },
    staleTime: Infinity,
    enabled: modelsData.length > 0 && pointCloudMappedDMData !== undefined
  });
};
