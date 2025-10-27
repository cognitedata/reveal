import { type AddModelOptions } from '@cognite/reveal';
import { type CogniteClient } from '@cognite/sdk';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useFdmSdk } from '../components/RevealCanvas/SDKProvider';
import { getAssetsMappedPointCloudAnnotations } from './network/getAssetMappedPointCloudAnnotations';
import { type AssetInstance, isClassicAsset } from '../utilities/instances';

export const useAllAssetsMappedPointCloudAnnotations = (
  sdk: CogniteClient,
  models: AddModelOptions[]
): UseQueryResult<AssetInstance[]> => {
  const fdmSDK = useFdmSdk();
  return useQuery({
    queryKey: ['reveal', 'react-components', 'all-assets-mapped-point-cloud-annotations', models],
    queryFn: async () => await getAssetsMappedPointCloudAnnotations(models, undefined, sdk, fdmSDK),
    staleTime: Infinity
  });
};

export const useSearchAssetsMappedPointCloudAnnotations = (
  models: AddModelOptions[],
  sdk: CogniteClient,
  query: string
): UseQueryResult<AssetInstance[] | null> => {
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
        return assetMappings ?? null;
      }

      const filteredSearchedAssets =
        assetMappings?.filter((asset) => {
          if (isClassicAsset(asset)) {
            const isInName = asset.name.toLowerCase().includes(query.toLowerCase());
            const isInDescription = asset.description?.toLowerCase().includes(query.toLowerCase());

            return isInName || isInDescription;
          }
          return false;
        }) ?? [];

      return filteredSearchedAssets;
    },
    staleTime: Infinity,
    enabled: isFetched && assetMappings !== undefined
  });
};
