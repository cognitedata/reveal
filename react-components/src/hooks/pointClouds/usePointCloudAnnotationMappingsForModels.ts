import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import {
  type AnnotationModelDataResult,
  type TypedReveal3DModel
} from '../../components/Reveal3DResources/types';
import { usePointCloudAnnotationCache } from '../../components/CacheProvider/CacheProvider';
import { useModelIdRevisionIdFromModelOptions } from '../useModelIdRevisionIdFromModelOptions';
import { isDefined } from '../../utilities/isDefined';
import { queryKeys } from '../../utilities/queryKeys';
import { useMemo } from 'react';

export const usePointCloudAnnotationMappingsForModels = (
  models: TypedReveal3DModel[]
): UseQueryResult<AnnotationModelDataResult[]> => {
  const pointCloudAnnotationCache = usePointCloudAnnotationCache();
  const addClassicModelOptionsResults = useModelIdRevisionIdFromModelOptions(models);

  const classicModelOptions = useMemo(
    () => addClassicModelOptionsResults.map((result) => result.data).filter(isDefined),
    [addClassicModelOptionsResults]
  );

  return useQuery({
    queryKey: [
      queryKeys.pointCloudAnnotationMappings(
        classicModelOptions.map((model) => `${model.modelId}/${model.revisionId}`).sort()
      )
    ],
    queryFn: async () => {
      return await Promise.all(
        classicModelOptions.map(async (model) => {
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
