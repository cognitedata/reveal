import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import {
  type Image360AnnotationAssetInfo,
  type Image360AnnotationModel
} from '../components/CacheProvider/types';
import { useImage360AnnotationCache } from '../components/CacheProvider/CacheProvider';
import { getAssetIdKeyForImage360Annotation } from '../components/CacheProvider/utils';
import { type InstanceReference } from '../utilities/instanceIds';
import { createInstanceReferenceKey } from '../utilities/instanceIds/toKey';

export type Image360AnnotationDataResult = {
  siteId: string;
  annotationModel: Image360AnnotationModel[];
};

export const useImage360AnnotationMappingsForInstanceReferences = (
  assetIds: InstanceReference[] | undefined,
  siteIds: string[] | undefined
): UseQueryResult<Image360AnnotationAssetInfo[]> => {
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
      const assetIdSet = new Set(assetIds.map(createInstanceReferenceKey));

      const annotationAssetInfo = await image360AnnotationCache.getReveal360AnnotationsForAssets(
        siteIds,
        assetIds
      );

      const filteredAnnotationAssetInfo = annotationAssetInfo.filter((annotationInfo) => {
        const annotationAssetKey = getAssetIdKeyForImage360Annotation(
          annotationInfo.assetAnnotationImage360Info.annotation.annotation
        );

        return annotationAssetKey !== undefined && assetIdSet.has(annotationAssetKey);
      });
      return filteredAnnotationAssetInfo;
    },
    staleTime: Infinity,
    enabled: assetIds !== undefined && siteIds !== undefined
  });
};
