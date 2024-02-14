/*!
 * Copyright 2024 Cognite AS
 */

import { type ReactElement, type ReactNode, createContext, useContext, useMemo } from 'react';

import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { useSDK } from '../RevealContainer/SDKProvider';
import { useRevealKeepAlive } from '../RevealKeepAlive/RevealKeepAliveContext';
import { Image360AnnotationCache } from './Image360AnnotationCache';
import { type AnnotationAssetMappingDataResult } from '../../hooks/types';
import { EMPTY_ARRAY } from '../../utilities/constants';
import { filterUndefined } from '../../utilities/filterUndefined';
import { type RevealAnnotationModel } from './types';

export type Image360AnnotationDataResult = {
  siteId: string;
  annotationModel: RevealAnnotationModel[];
};

export type Image360AnnotationCacheContextContent = {
  cache: Image360AnnotationCache;
};

const Image360AnnotationCacheContext = createContext<
  Image360AnnotationCacheContextContent | undefined
>(undefined);

const useImage360AnnotationCache = (): Image360AnnotationCache => {
  const content = useContext(Image360AnnotationCacheContext);

  if (content === undefined) {
    throw Error('Must use useImage360AnnotationCache inside a Image360AnnotationCacheContext');
  }

  return content.cache;
};

export const useImage360AnnotationMappingsForSiteIds = (
  siteIds: string[]
): UseQueryResult<Image360AnnotationDataResult[]> => {
  const image360AnnotationCache = useImage360AnnotationCache();

  return useQuery(
    [
      'reveal',
      'react-components',
      'siteIds-image360-annotations-mappings',
      ...siteIds.map((siteId) => `${siteId}`)
    ],
    async () => {
      return await Promise.all(
        siteIds.map(async (siteId) => {
          const annotationModel =
            await image360AnnotationCache.getImage360AnnotationsForSiteId(siteId);
          return {
            siteId,
            annotationModel
          };
        })
      );
    },
    { staleTime: Infinity, enabled: siteIds.length > 0 }
  );
};

export const useImage360AnnotationMappingsForAssetIds = (
  siteIds: string[],
  assetIds: Array<string | number> | undefined
): UseQueryResult<AnnotationAssetMappingDataResult[]> => {
  const image360AnnotationCache = useImage360AnnotationCache();

  return useQuery(
    [
      'reveal',
      'react-components',
      'all-annotation-mappings-siteIds',
      ...siteIds.map((siteId) => `${siteId}`),
      ...(assetIds?.map((assetId) => assetId.toString()).sort() ?? [])
    ],
    async () => {
      const allAnnotationMappingsPromisesResult = await Promise.all(
        siteIds.map(async (siteId) => {
          const result = await fetchAnnotationsForModel(siteId, assetIds, image360AnnotationCache);
          return result ?? EMPTY_ARRAY;
        })
      );
      return allAnnotationMappingsPromisesResult.flat();
    },
    { staleTime: Infinity, enabled: assetIds !== undefined && assetIds.length > 0 }
  );
};

const fetchAnnotationsForModel = async (
  siteId: string | undefined,
  assetIds: Array<string | number> | undefined,
  image360AnnotationCache: Image360AnnotationCache
): Promise<AnnotationAssetMappingDataResult[] | undefined> => {
  if (siteId === undefined || assetIds === undefined) {
    return undefined;
  }

  const annotationMappings = await Promise.all(
    assetIds.map(
      async (assetId) =>
        await image360AnnotationCache.matchImage360AnnotationsForSiteId(siteId, assetId)
    )
  );

  const filteredAnnotationMappings = filterUndefined(annotationMappings);
  const transformedAnnotationMappings = filteredAnnotationMappings.flatMap((annotationMapping) =>
    Array.from(annotationMapping.entries()).map(([annotationId, asset]) => ({
      annotationId,
      asset
    }))
  );

  return transformedAnnotationMappings;
};

export function Image360AnnotationCacheProvider({
  children
}: {
  children?: ReactNode;
}): ReactElement {
  const cdfClient = useSDK();
  const revealKeepAliveData = useRevealKeepAlive();

  const image360AnnotationCache = useMemo(() => {
    const cache =
      revealKeepAliveData?.image360AnnotationCache.current ??
      new Image360AnnotationCache(cdfClient);

    const isRevealKeepAliveContextProvided = revealKeepAliveData !== undefined;
    if (isRevealKeepAliveContextProvided) {
      revealKeepAliveData.image360AnnotationCache.current = cache;
    }

    return cache;
  }, [cdfClient, revealKeepAliveData]);

  return (
    <Image360AnnotationCacheContext.Provider value={{ cache: image360AnnotationCache }}>
      {children}
    </Image360AnnotationCacheContext.Provider>
  );
}
