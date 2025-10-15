import { type TypedReveal3DModel } from '../../components/Reveal3DResources/types';
import { type PointCloudAnnotationMappedAssetData } from '../types';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { queryKeys } from '../../utilities/queryKeys';
import { EMPTY_ARRAY } from '../../utilities/constants';
import { createInstanceReferenceKey, type InstanceReference } from '../../utilities/instanceIds';
import { useContext } from 'react';
import { UsePointCloudAnnotationMappingsForAssetInstancesContext } from './usePointCloudAnnotationMappingsForAssetInstances.context';
import { fetchAnnotationsForModel } from './fetchAnnotationsForModel';

export const usePointCloudAnnotationMappingsForAssetInstances = (
  models: TypedReveal3DModel[],
  assetInstances: InstanceReference[] | undefined
): UseQueryResult<PointCloudAnnotationMappedAssetData[]> => {
  const { usePointCloudAnnotationCache, useModelIdRevisionIdFromModelOptions } = useContext(
    UsePointCloudAnnotationMappingsForAssetInstancesContext
  );

  const pointCloudAnnotationCache = usePointCloudAnnotationCache();
  const classicAddModelOptions = useModelIdRevisionIdFromModelOptions(models);

  return useQuery({
    queryKey: [
      queryKeys.pointCloudAnnotationForAssetIds(
        classicAddModelOptions.map((model) => `${model.modelId}/${model.revisionId}`).sort(),
        assetInstances?.map((assetInstance) => createInstanceReferenceKey(assetInstance)).sort() ??
          []
      )
    ],
    queryFn: async () => {
      const allAnnotationMappingsPromisesResult = await Promise.all(
        classicAddModelOptions.map(async (model) => {
          const result = await fetchAnnotationsForModel(
            model.modelId,
            model.revisionId,
            assetInstances,
            pointCloudAnnotationCache
          );
          return result ?? EMPTY_ARRAY;
        })
      );
      return allAnnotationMappingsPromisesResult.flat();
    },
    staleTime: Infinity,
    enabled: assetInstances !== undefined && assetInstances.length > 0
  });
};
