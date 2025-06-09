import { type CogniteClient } from '@cognite/sdk';

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { type Image360AnnotationMappedAssetData } from '../hooks/types';
import { type Image360AnnotationFilterOptions } from '@cognite/reveal';
import { type DmsUniqueIdentifier } from '../data-providers';

import { matchAssetWithQuery } from '../utilities/instances/matchAssetWithQuery';
import { partition } from 'lodash';
import { getClassicAssetMapped360Annotations } from './network/getClassicAssetMapped360Annotations';

export const useAllAssetsMapped360Annotations = (
  sdk: CogniteClient,
  siteIds: Array<DmsUniqueIdentifier | string>,
  image360AnnotationFilterOptions: Image360AnnotationFilterOptions = { status: `approved` }
): UseQueryResult<Image360AnnotationMappedAssetData[]> => {
  return useQuery({
    queryKey: [
      'reveal',
      'react-components',
      'all-assets-mapped-360-annotations',
      siteIds,
      image360AnnotationFilterOptions.status
    ],
    queryFn: async () => {
      const assetMappings = await getAssetMapped360Annotations(
        sdk,
        siteIds,
        image360AnnotationFilterOptions
      );
      return assetMappings;
    },
    staleTime: Infinity
  });
};

export const useSearchAssetsMapped360Annotations = (
  siteIds: string[],
  sdk: CogniteClient,
  query: string,
  image360AnnotationFilterOptions?: Image360AnnotationFilterOptions
): UseQueryResult<Image360AnnotationMappedAssetData[]> => {
  const { data: assetAnnotationMappings, isFetched } = useAllAssetsMapped360Annotations(
    sdk,
    siteIds,
    image360AnnotationFilterOptions
  );

  return useQuery({
    queryKey: [
      'reveal',
      'react-components',
      'search-assets-mapped-360-annotations',
      query,
      siteIds,
      image360AnnotationFilterOptions?.status
    ],
    queryFn: async () => {
      if (query === '') {
        return assetAnnotationMappings;
      }

      const assetMappings = assetAnnotationMappings?.map((mapping) => mapping.asset) ?? [];

      const filteredSearchedAssets =
        assetMappings?.filter((asset) => matchAssetWithQuery(asset, query)) ?? [];

      const filteredAssetAnnotationMappings =
        assetAnnotationMappings?.filter((mapping) =>
          filteredSearchedAssets.includes(mapping.asset)
        ) ?? [];

      return filteredAssetAnnotationMappings;
    },
    staleTime: Infinity,
    enabled: isFetched && assetAnnotationMappings !== undefined
  });
};

async function getAssetMapped360Annotations(
  sdk: CogniteClient,
  siteIds: Array<string | DmsUniqueIdentifier>,
  image360AnnotationFilterOptions: Image360AnnotationFilterOptions
): Promise<Image360AnnotationMappedAssetData[]> {
  const [classicSiteIds, _dmCollectionIds] = partition(siteIds, (id) => typeof id === 'string');

  return await getClassicAssetMapped360Annotations(
    classicSiteIds,
    sdk,
    image360AnnotationFilterOptions
  );
}
