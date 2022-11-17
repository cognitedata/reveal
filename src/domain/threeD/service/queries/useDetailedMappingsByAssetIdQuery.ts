import { CogniteError } from '@cognite/sdk/dist/src';
import { useSDK } from '@cognite/sdk-provider';
import { useQuery, useQueryClient, UseQueryOptions } from 'react-query';
import uniqWith from 'lodash/uniqWith';
import isEqual from 'lodash/isEqual';

import {
  DetailedMapping,
  fetchBasicMappingsByAssetIdQuery,
  fetchThreeDModelQuery,
  fetchThreeDRevisionQuery,
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
        uniqWith(basicMappings, isEqual).map(
          async ({ modelId, revisionId, ...otherProps }) => {
            const [model, revision] = await Promise.all([
              fetchThreeDModelQuery(sdk, queryClient, modelId),
              fetchThreeDRevisionQuery(sdk, queryClient, modelId, revisionId),
            ]);

            return {
              model,
              revision,
              revisionId,
              modelId,
              ...otherProps,
            };
          }
        )
      );
    },
    options
  );
};
