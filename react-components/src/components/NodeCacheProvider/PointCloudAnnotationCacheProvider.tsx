/*!
 * Copyright 2024 Cognite AS
 */

import { type ReactElement, type ReactNode, createContext, useContext, useMemo } from 'react';

import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { useSDK } from '../RevealContainer/SDKProvider';
import { useRevealKeepAlive } from '../RevealKeepAlive/RevealKeepAliveContext';
import { PointCloudAnnotationCache } from './PointCloudAnnotationCache';
import { type TypedReveal3DModel } from '../Reveal3DResources/types';
import { type AnnotationAssetMappingDataResult } from '../../hooks/useClickedNode';
import { type AnnotationModelDataResult } from '../../hooks/useCalculatePointCloudModelsStyling';

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

export const usePointCloudAnnotationMappingsForModels = (
  models: TypedReveal3DModel[]
): UseQueryResult<AnnotationModelDataResult[]> => {
  const pointCloudAnnotationCache = usePointCloudAnnotationCache();

  return useQuery(
    [
      'reveal',
      'react-components',
      'models-pointcloud-annotations-mappings',
      ...models.map((model) => `${model.modelId}/${model.revisionId}`).sort()
    ],
    async () => {
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
    { staleTime: Infinity, enabled: models.length > 0 }
  );
};

export const usePointCloudAnnotationAssetForAssetId = (
  models: TypedReveal3DModel[],
  assetId: string | number | undefined
): UseQueryResult<AnnotationAssetMappingDataResult[]> => {
  const pointCloudAnnotationCache = usePointCloudAnnotationCache();

  return useQuery(
    [
      'reveal',
      'react-components',
      'annotation-pointcloud-for-a-model',
      ...models.map((model) => `${model.modelId}/${model.revisionId}`).sort(),
      assetId
    ],
    async () => {
      return await Promise.all(
        models.map(async (model) => {
          const result = await fetchAnnotationsForAssetId(
            model.modelId,
            model.revisionId,
            assetId,
            pointCloudAnnotationCache
          );
          return result ?? [];
        })
      );
    },
    { staleTime: Infinity, enabled: assetId !== undefined }
  );
};

const fetchAnnotationsForAssetId = async (
  modelId: number | undefined,
  revisionId: number | undefined,
  assetId: string | number | undefined,
  pointCloudAnnotationCache: PointCloudAnnotationCache
): Promise<AnnotationAssetMappingDataResult[] | undefined> => {
  if (modelId === undefined || revisionId === undefined || assetId === undefined) {
    return undefined;
  }

  const annotationMapping = await pointCloudAnnotationCache.matchPointCloudAnnotationsForModel(
    modelId,
    revisionId,
    assetId
  );

  const transformedAnnotationMapping = Array.from(annotationMapping.entries()).flatMap(
    ([, mappings]) =>
      Array.from(mappings.entries()).map(([annotationId, asset]) => ({
        annotationId,
        asset
      }))
  );

  return transformedAnnotationMapping;
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
