import { CogniteError } from '@cognite/sdk/dist/src';
import { useSDK } from '@cognite/sdk-provider';
import { useQuery, useQueryClient, UseQueryOptions } from 'react-query';

import {
  DetailedMapping,
  fetchBasicMappingsByAssetIdQuery,
  fetchThreeDModelQuery,
} from 'domain/threeD';
import { queryKeys } from 'domain/queryKeys';

export const useDetailedMappingsByAssetIdQuery = (
  assetId: number,
  options?: UseQueryOptions<DetailedMapping[], CogniteError, DetailedMapping[]>
) => {
  const sdk = useSDK();
  const queryClient = useQueryClient();

  return useQuery<DetailedMapping[], CogniteError, DetailedMapping[]>(
    queryKeys.listDetailedAssetMappings(assetId),
    async () => {
      const basicMappings = await fetchBasicMappingsByAssetIdQuery(
        sdk,
        queryClient,
        assetId
      );

      return Promise.all(
        basicMappings.map(async ({ modelId, ...otherProps }) => {
          const model = await fetchThreeDModelQuery(sdk, queryClient, modelId);

          return {
            model,
            ...otherProps,
          };
        })
      );
    },
    options
  );
};
