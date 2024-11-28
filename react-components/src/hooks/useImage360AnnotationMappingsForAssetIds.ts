/*!
 * Copyright 2024 Cognite AS
 */

import { type ReactElement, type ReactNode, createContext, useContext, useMemo } from 'react';

import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { useRevealKeepAlive } from '../components/RevealKeepAlive/RevealKeepAliveContext';
import { Image360AnnotationCache } from '../components/CacheProvider/Image360AnnotationCache';
import {
  type Image360AnnotationAssetInfo,
  type Image360AnnotationModel
} from '../components/CacheProvider/types';
import { useSDK } from '../components/RevealCanvas/SDKProvider';
import { useImage360AnnotationCache } from '../components/CacheProvider/CacheProvider';

export type Image360AnnotationDataResult = {
  siteId: string;
  annotationModel: Image360AnnotationModel[];
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
