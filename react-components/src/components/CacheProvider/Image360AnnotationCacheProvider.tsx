/*!
 * Copyright 2024 Cognite AS
 */

import { type ReactElement, type ReactNode, createContext, useContext, useMemo } from 'react';

import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { useRevealKeepAlive } from '../RevealKeepAlive/RevealKeepAliveContext';
import { Image360AnnotationCache } from './Image360AnnotationCache';
import { type Image360AnnotationAssetInfo, type Image360AnnotationModel } from './types';
import { useSDK } from '../RevealCanvas/SDKProvider';

export type Image360AnnotationDataResult = {
  siteId: string;
  annotationModel: Image360AnnotationModel[];
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

export const useImage360AnnotationMappingsForAssetIds = (
  assetIds: Array<string | number> | undefined,
  siteIds: string[] | undefined
): UseQueryResult<Image360AnnotationAssetInfo[]> => {
  const image360AnnotationCache = useImage360AnnotationCache();

  return useQuery({
    queryKey: [
      'reveal',
      'react-components',
      'image360-annotations-info',
      ...(assetIds?.map((assetId) => assetId.toString()).sort() ?? []),
      ...(siteIds?.map((siteId) => siteId).sort() ?? [])
    ],
    queryFn: async () => {
      if (
        assetIds === undefined ||
        assetIds.length === 0 ||
        siteIds === undefined ||
        siteIds.length === 0
      ) {
        return [];
      }
      const annotationAssetInfo = await image360AnnotationCache.getReveal360Annotations(siteIds);
      const filteredAnnotationAssetInfo = annotationAssetInfo.filter((annotationInfo) => {
        return assetIds.includes(annotationInfo.asset.id);
      });
      return filteredAnnotationAssetInfo;
    },
    staleTime: Infinity,
    enabled: assetIds !== undefined && siteIds !== undefined
  });
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
      new Image360AnnotationCache(cdfClient, revealKeepAliveData?.renderTargetRef.current?.viewer);

    const isRevealKeepAliveContextProvided = revealKeepAliveData !== undefined;
    if (isRevealKeepAliveContextProvided) {
      revealKeepAliveData.image360AnnotationCache.current = cache;
    }

    return cache;
  }, [cdfClient]);

  return (
    <Image360AnnotationCacheContext.Provider value={{ cache: image360AnnotationCache }}>
      {children}
    </Image360AnnotationCacheContext.Provider>
  );
}
