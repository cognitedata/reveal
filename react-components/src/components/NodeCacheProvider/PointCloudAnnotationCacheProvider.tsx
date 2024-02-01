/*!
 * Copyright 2024 Cognite AS
 */

import { type ReactElement, type ReactNode, createContext, useContext, useMemo } from 'react';

import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { useSDK } from '../RevealContainer/SDKProvider';
import { useRevealKeepAlive } from '../RevealKeepAlive/RevealKeepAliveContext';
import { PointCloudAnnotationCache } from './PointCloudAnnotationCache';
import { type TypedReveal3DModel } from '../Reveal3DResources/types';

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

export const usePointCloudAnnotationsForModels = (
  models: TypedReveal3DModel[]
): UseQueryResult<number[]> => {
  const pointCloudAnnotationCache = usePointCloudAnnotationCache();

  return useQuery(
    [
      'reveal',
      'react-components',
      'models-pointcloud-annotations',
      ...models.map((model) => `${model.modelId}/${model.revisionId}`).sort()
    ],
    async () => {
      return models.map(
        async (model) =>
          await pointCloudAnnotationCache.getPointCloudAnnotationsForModel(
            model.modelId,
            model.revisionId
          )
      );
    },
    { staleTime: Infinity, enabled: models.length > 0 }
  );
};

export const useAnnotationsFromModels = (
  models: TypedReveal3DModel[],
  annotationId: number | undefined
): UseQueryResult<number[]> => {
  const pointCloudAnnotationCache = usePointCloudAnnotationCache();

  return useQuery(
    [
      'reveal',
      'react-components',
      'annotation-pointcloud-for-models',
      ...models.map((model) => `${model.modelId}/${model.revisionId}`).sort(),
      annotationId
    ],
    async () => {
      if (annotationId === undefined) {
        return [];
      }
      return await Promise.all(
        models.map(
          async (model) =>
            await fetchAnnotationsForModel(
              model.modelId,
              model.revisionId,
              annotationId,
              pointCloudAnnotationCache
            )
        )
      );
    },
    { staleTime: Infinity, enabled: annotationId !== undefined }
  );
};

export const useAnnotationsFromModel = (
  modelId: number,
  revisionId: number,
  annotationId: number | undefined
): UseQueryResult<number[]> => {
  const pointCloudAnnotationCache = usePointCloudAnnotationCache();

  return useQuery(
    [
      'reveal',
      'react-components',
      'annotation-pointcloud-for-a-model',
      `${modelId}/${revisionId}`,
      annotationId
    ],
    async () =>
      await fetchAnnotationsForModel(modelId, revisionId, annotationId, pointCloudAnnotationCache),
    { staleTime: Infinity, enabled: annotationId !== undefined }
  );
};

const fetchAnnotationsForModel = async (
  modelId: number,
  revisionId: number,
  annotationId: number | undefined,
  pointCloudAnnotationCache: PointCloudAnnotationCache
): Promise<number[]> => {
  if (modelId === undefined || revisionId === undefined || annotationId === undefined) {
    return [];
  }

  const matchedPointCloudAnnotation = pointCloudAnnotationCache.matchPointCloudAnnotationsForModel(
    modelId,
    revisionId,
    annotationId
  );
  return await matchedPointCloudAnnotation;
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
  }, [cdfClient, revealKeepAliveData]);

  return (
    <PointCloudAnnotationCacheContext.Provider value={{ cache: pointCloudAnnotationCache }}>
      {children}
    </PointCloudAnnotationCacheContext.Provider>
  );
}
