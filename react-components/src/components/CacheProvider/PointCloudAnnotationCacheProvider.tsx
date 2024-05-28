/*!
 * Copyright 2024 Cognite AS
 */

import { type ReactElement, type ReactNode, createContext, useContext, useMemo } from 'react';

import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { useSDK } from '../RevealCanvas/SDKProvider';
import { useRevealKeepAlive } from '../RevealKeepAlive/RevealKeepAliveContext';
import { PointCloudAnnotationCache } from './PointCloudAnnotationCache';
import { type PointCloudModelOptions, type TypedReveal3DModel } from '../Reveal3DResources/types';
import { type AnnotationModelDataResult } from '../../hooks/useCalculatePointCloudModelsStyling';
import { type PointCloudAnnotationMappedAssetData } from '../../hooks/types';
import { EMPTY_ARRAY } from '../../utilities/constants';
import { isDefined } from '../../utilities/isDefined';
import { type AnnotationId } from './types';
import { type AnyIntersection } from '@cognite/reveal';

export type PointCloudAnnotationCacheContextContent = {
  cache: PointCloudAnnotationCache;
};

const PointCloudAnnotationCacheContext = createContext<
  PointCloudAnnotationCacheContextContent | undefined
>(undefined);

const usePointCloudAnnotationCache = (): PointCloudAnnotationCache => {
  const content = useContext(PointCloudAnnotationCacheContext);

  if (content === undefined) {
    throw Error('Must use usePointCloudAnnotationCache inside a PointCloudAnnotationCacheContext');
  }

  return content.cache;
};

export const usePointCloudAnnotationIdsForModels = (
  models: TypedReveal3DModel[]
): UseQueryResult<
  Array<{
    model: PointCloudModelOptions;
    annotationIds: AnnotationId[];
  }>
> => {
  const pointCloudAnnotationCache = usePointCloudAnnotationCache();

  return useQuery({
    queryKey: [
      'reveal',
      'react-components',
      'models-pointcloud-annotationmodels',
      ...models.map((model) => `${model.modelId}/${model.revisionId}`).sort()
    ],
    queryFn: async () => {
      return await Promise.all(
        models.map(async (model) => {
          const annotationModel = await pointCloudAnnotationCache.getPointCloudAnnotationsForModel(
            model.modelId,
            model.revisionId
          );
          const annotationIds = annotationModel.map((annotation) => {
            return annotation.id;
          });
          return { model, annotationIds };
        })
      );
    },
    staleTime: Infinity,
    enabled: models.length > 0
  });
};

export const usePointCloudAnnotationMappingsForModels = (
  models: TypedReveal3DModel[]
): UseQueryResult<AnnotationModelDataResult[]> => {
  const pointCloudAnnotationCache = usePointCloudAnnotationCache();

  return useQuery({
    queryKey: [
      'reveal',
      'react-components',
      'models-pointcloud-annotations-mappings',
      ...models.map((model) => `${model.modelId}/${model.revisionId}`).sort()
    ],
    queryFn: async () => {
      return await Promise.all(
        models.map(async (model) => {
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

export const usePointCloudAnnotationMappingsForAssetIds = (
  models: TypedReveal3DModel[],
  assetIds: Array<string | number> | undefined
): UseQueryResult<PointCloudAnnotationMappedAssetData[]> => {
  const pointCloudAnnotationCache = usePointCloudAnnotationCache();

  return useQuery({
    queryKey: [
      'reveal',
      'react-components',
      'all-annotation-mappings',
      ...models.map((model) => `${model.modelId}/${model.revisionId}`).sort(),
      ...(assetIds?.map((assetId) => assetId.toString()).sort() ?? [])
    ],
    queryFn: async () => {
      const allAnnotationMappingsPromisesResult = await Promise.all(
        models.map(async (model) => {
          const result = await fetchAnnotationsForModel(
            model.modelId,
            model.revisionId,
            assetIds,
            pointCloudAnnotationCache
          );
          return result ?? EMPTY_ARRAY;
        })
      );
      return allAnnotationMappingsPromisesResult.flat();
    },
    staleTime: Infinity,
    enabled: assetIds !== undefined && assetIds.length > 0
  });
};

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
      'reveal',
      'react-components',
      'asset-annotation-mapping-for-a-model',
      `${modelId}/${revisionId}`,
      assetId
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

const fetchAnnotationsForModel = async (
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

export function PointCloudAnnotationCacheProvider({
  children
}: {
  children?: ReactNode;
}): ReactElement {
  const cdfClient = useSDK();
  const revealKeepAliveData = useRevealKeepAlive();

  const pointCloudAnnotationCache = useMemo(() => {
    const cache =
      revealKeepAliveData?.pointCloudAnnotationCache.current ??
      new PointCloudAnnotationCache(cdfClient);

    const isRevealKeepAliveContextProvided = revealKeepAliveData !== undefined;
    if (isRevealKeepAliveContextProvided) {
      revealKeepAliveData.pointCloudAnnotationCache.current = cache;
    }

    return cache;
  }, [cdfClient]);

  return (
    <PointCloudAnnotationCacheContext.Provider value={{ cache: pointCloudAnnotationCache }}>
      {children}
    </PointCloudAnnotationCacheContext.Provider>
  );
}
