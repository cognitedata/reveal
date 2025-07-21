import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import {
  type Image360AnnotationAssetInfo,
  type Image360AnnotationModel
} from '../components/CacheProvider/types';
import { type InstanceReference } from '../utilities/instanceIds';
import { Image360AnnotationMappingsContext } from './useImage360AnnotationMappingsForInstanceReferences.context';
import { useContext } from 'react';

export type Image360AnnotationDataResult = {
  siteId: string;
  annotationModel: Image360AnnotationModel[];
};

export const useImage360AnnotationMappingsForInstanceReferences = (
  assetIds: InstanceReference[] | undefined,
  siteIds: string[] | undefined
): UseQueryResult<Image360AnnotationAssetInfo[]> => {
  const { useImage360AnnotationCache } = useContext(Image360AnnotationMappingsContext);
  const image360AnnotationCache = useImage360AnnotationCache();

  return useQuery({
    queryKey: [
      'reveal',
      'react-components',
      'image360-annotations-info',
      ...(assetIds?.sort() ?? []),
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

      const annotationAssetInfo = await image360AnnotationCache.getReveal360AnnotationsForAssets(
        siteIds,
        assetIds
      );

      return annotationAssetInfo;
    },
    staleTime: Infinity
  });
};
