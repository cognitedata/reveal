/*!
 * Copyright 2024 Cognite AS
 */

import { type ReactElement, type ReactNode, createContext, useContext, useMemo } from 'react';
import { type PointCloudModelOptions } from '../Reveal3DResources/types';

import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { useSDK } from '../RevealContainer/SDKProvider';
import { useRevealKeepAlive } from '../RevealKeepAlive/RevealKeepAliveContext';
import { PointCloudObjectCollectionCache } from './PointCloudObjectCollectionCache';

export type PointCloudObjectCollectionCacheContent = {
  cache: PointCloudObjectCollectionCache;
};

const PointCloudObjectCollectionCacheContext = createContext<
  PointCloudObjectCollectionCacheContent | undefined
>(undefined);

const usePointCloudObjectCollectionCache = (): PointCloudObjectCollectionCache => {
  const content = useContext(PointCloudObjectCollectionCacheContext);

  if (content === undefined) {
    throw Error(
      'Must use usePointCloudObjectCollectionCache inside a PointCloudObjectCollectionCacheContext'
    );
  }

  return content.cache;
};

export const usePointCloudObjectCollectionForRevisions = (
  model: PointCloudModelOptions[]
): UseQueryResult<number[]> => {
  const pointCloudObjectCollectionCache = usePointCloudObjectCollectionCache();

  return useQuery(
    [
      'reveal',
      'react-components',
      'models-pointcloud-object-collections',
      ...model.map((model) => `${model.modelId}/${model.revisionId}`).sort()
    ],
    async () => {
      const fetchData = model.map(
        async (model) =>
          await pointCloudObjectCollectionCache.getPointCloudAnnotationsForModel(
            model.modelId,
            model.revisionId
          )
      );
      return { model, pointCloudObjectCollectionData: fetchData };
    },
    { staleTime: Infinity, enabled: model.length > 0 }
  );
};

export const useObjectCollectionForAssets = (
  modelId: number | undefined,
  revisionId: number | undefined,
  annotationId: number | undefined
): UseQueryResult<number[]> => {
  const pointCloudObjectCollectionCache = usePointCloudObjectCollectionCache();

  return useQuery(
    [
      'reveal',
      'react-components',
      'asset-pointcloud-object-collections',
      `${modelId}/${revisionId}`,
      annotationId
    ],
    async () => {
      const validInputs =
        modelId !== undefined && revisionId !== undefined && annotationId !== undefined;

      if (!validInputs) {
        return [];
      }
      const pointCloudAnnotationData =
        pointCloudObjectCollectionCache.getPointCloudAnnotationsForAssets(
          modelId,
          revisionId,
          annotationId
        );
      return await pointCloudAnnotationData;
    },
    { staleTime: Infinity, enabled: annotationId !== undefined }
  );
};

export function PointCloudObjectCollectionCacheProvider({
  children
}: {
  children?: ReactNode;
}): ReactElement {
  const cdfClient = useSDK();
  const revealKeepAliveData = useRevealKeepAlive();

  const pointCloudObjectCollectionCache = useMemo(() => {
    const cache =
      revealKeepAliveData?.pointCloudObjectCollectionCache.current ??
      new PointCloudObjectCollectionCache(cdfClient);

    const isRevealKeepAliveContextProvided = revealKeepAliveData !== undefined;
    if (isRevealKeepAliveContextProvided) {
      revealKeepAliveData.pointCloudObjectCollectionCache.current = cache;
    }

    return cache;
  }, [cdfClient, revealKeepAliveData]);

  return (
    <PointCloudObjectCollectionCacheContext.Provider
      value={{ cache: pointCloudObjectCollectionCache }}>
      {children}
    </PointCloudObjectCollectionCacheContext.Provider>
  );
}
