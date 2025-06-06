/*!
 * Copyright 2024 Cognite AS
 */

import { type AddModelOptions } from '@cognite/reveal';
import { type Asset, type CogniteClient } from '@cognite/sdk';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getAssetsMappedPointCloudAnnotations } from './network/getAssetMappedPointCloudAnnotations';

export const useAllAssetsMappedPointCloudAnnotations = (
  sdk: CogniteClient,
  models: AddModelOptions[]
): UseQueryResult<Asset[]> => {
  return useQuery({
    queryKey: ['reveal', 'react-components', 'all-assets-mapped-point-cloud-annotations', models],
    queryFn: async () => await getAssetsMappedPointCloudAnnotations(sdk, models),
    staleTime: Infinity
  });
};

export const useSearchAssetsMappedPointCloudAnnotations = (
  models: AddModelOptions[],
  sdk: CogniteClient,
  query: string
): UseQueryResult<Asset[]> => {
  const { data: assetMappings, isFetched } = useAllAssetsMappedPointCloudAnnotations(sdk, models);

  return useQuery({
    queryKey: [
      'reveal',
      'react-components',
      'search-assets-mapped-point-cloud-annotations',
      query,
      models
    ],
    queryFn: async () => {
      if (query === '') {
        return assetMappings;
      }

      const filteredSearchedAssets =
        assetMappings?.filter((asset) => {
          const isInName = asset.name.toLowerCase().includes(query.toLowerCase());
          const isInDescription = asset.description?.toLowerCase().includes(query.toLowerCase());

          return isInName || isInDescription;
        }) ?? [];

      return filteredSearchedAssets;
    },
    staleTime: Infinity,
    enabled: isFetched && assetMappings !== undefined
  });
};
