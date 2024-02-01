/*!
 * Copyright 2024 Cognite AS
 */

import { type ReactElement, type ReactNode, createContext, useContext, useMemo } from 'react';
import { type PointCloudModelOptions } from '../Reveal3DResources/types';

import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { useSDK } from '../RevealContainer/SDKProvider';
import { useRevealKeepAlive } from '../RevealKeepAlive/RevealKeepAliveContext';
import { PointCloudAnnotationCache } from './PointCloudAnnotationCache';

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

export const usePointCloudAnnotationsForRevision = (
  model: PointCloudModelOptions[]
): UseQueryResult<number[]> => {
  const pointCloudAnnotationCache = usePointCloudAnnotationCache();

  return useQuery(
    [
      'reveal',
      'react-components',
      'models-pointcloud-annotations',
      ...model.map((model) => `${model.modelId}/${model.revisionId}`).sort()
    ],
    async () => {
      return model.map(
        async (model) =>
          await pointCloudAnnotationCache.getPointCloudAnnotationsForModel(
            model.modelId,
            model.revisionId
          )
      );
    },
    { staleTime: Infinity, enabled: model.length > 0 }
  );
};

export const useAnnotationsFromModel = (
  modelId: number | undefined,
  revisionId: number | undefined,
  annotationId: number | undefined
): UseQueryResult<number[]> => {
  const pointCloudAnnotationCache = usePointCloudAnnotationCache();

  return useQuery(
    [
      'reveal',
      'react-components',
      'annotation-pointcloud-for-model',
      `${modelId}/${revisionId}`,
      annotationId
    ],
    async () => {
      const validInputs =
        modelId !== undefined && revisionId !== undefined && annotationId !== undefined;

      if (!validInputs) {
        return [];
      }
      const matchedPointCloudAnnotation =
        pointCloudAnnotationCache.matchPointCloudAnnotationsForModel(
          modelId,
          revisionId,
          annotationId
        );
      return await matchedPointCloudAnnotation;
    },
    { staleTime: Infinity, enabled: annotationId !== undefined }
  );
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
