import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import {
  type AnnotationModelDataResult,
  type TypedReveal3DModel
} from '../../components/Reveal3DResources/types';
import { usePointCloudAnnotationCache } from '../../components/CacheProvider/CacheProvider';
import { useModelIdRevisionIdFromModelOptions } from '../useModelIdRevisionIdFromModelOptions';
import { queryKeys } from '../../utilities/queryKeys';

export const usePointCloudAnnotationMappingsForModels = (
  models: TypedReveal3DModel[]
): UseQueryResult<AnnotationModelDataResult[]> => {
  const pointCloudAnnotationCache = usePointCloudAnnotationCache();
  const classicAddModelOptions = useModelIdRevisionIdFromModelOptions(models);

  return useQuery({
    queryKey: [
      queryKeys.pointCloudAnnotationMappings(
        classicAddModelOptions.map((model) => `${model.modelId}/${model.revisionId}`).sort()
      )
    ],
    queryFn: async () => {
      return await Promise.all(
        classicAddModelOptions.map(async (model) => {
          const annotationModel = await pointCloudAnnotationCache.getPointCloudAnnotationsForModel(
            model.modelId,
            model.revisionId
          );
          return {
            model,
            annotationModel
          };
        })
      );
    },
    staleTime: Infinity,
    enabled: models.length > 0
  });
};
