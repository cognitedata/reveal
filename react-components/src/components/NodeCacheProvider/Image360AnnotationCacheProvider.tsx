/*!
 * Copyright 2024 Cognite AS
 */

import { type ReactElement, type ReactNode, createContext, useContext, useMemo } from 'react';

import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { useSDK } from '../RevealContainer/SDKProvider';
import { useRevealKeepAlive } from '../RevealKeepAlive/RevealKeepAliveContext';
import { Image360AnnotationCache } from './Image360AnnotationCache';
import { type AnnotationAssetMappingDataResult } from '../../hooks/types';
import { type RevealAnnotationModel } from './types';
import { type Asset } from '@cognite/sdk/dist/src';

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

export const useImage360AnnotationAssetsForSiteIds = (
  siteIds: string[]
): UseQueryResult<AnnotationAssetMappingDataResult[]> => {
  const image360AnnotationCache = useImage360AnnotationCache();

  return useQuery(
    [
      'reveal',
      'react-components',
      'siteIds-image360-annotations-assets',
      ...siteIds.map((siteId) => `${siteId}`)
    ],
    async () => {
      const annotationMappingAssets = await Promise.all(
        siteIds.map(async (siteId) => {
          const annotationAssets =
            await image360AnnotationCache.getImage360AnnotationAssetsForSiteId(siteId);
          return annotationAssets;
        })
      );
      const transformedAnnotationAssetMappings = annotationMappingAssets.flatMap(
        (annotationMapping) =>
          Array.from(annotationMapping.entries()).map(([annotationId, asset]) => ({
            annotationId,
            asset
          }))
      );

      return transformedAnnotationAssetMappings;
    },
    { staleTime: Infinity, enabled: siteIds.length > 0 }
  );
};

export const useSearchAssetsMapped360Annotations = (
  siteIds: string[],
  query: string
): UseQueryResult<Asset[]> => {
  const image360AnnotationCache = useImage360AnnotationCache();

  return useQuery(
    ['reveal', 'react-components', 'search-assets-mapped-360-annotations', query, siteIds],
    async () => {
      const annotationMappingAssets = await Promise.all(
        siteIds.map(async (siteId) => {
          const annotationAssets =
            await image360AnnotationCache.getImage360AnnotationAssetsForSiteId(siteId);
          return annotationAssets;
        })
      );
      const assets = annotationMappingAssets.flatMap((map: Map<number, Asset>) =>
        Array.from(map.values())
      );
      if (query === '') {
        return assets;
      }

      const filteredSearchedAssets =
        assets.filter((asset) => {
          const isInName = asset.name.toLowerCase().includes(query.toLowerCase());
          const isInDescription = asset.description?.toLowerCase().includes(query.toLowerCase());

          return isInName || isInDescription;
        }) ?? [];

      return filteredSearchedAssets;
    },
    {
      staleTime: Infinity
    }
  );
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
