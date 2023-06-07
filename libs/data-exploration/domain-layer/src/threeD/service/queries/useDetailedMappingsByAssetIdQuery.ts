import { useEffect } from 'react';

import {
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import uniqWith from 'lodash/uniqWith';

import { CogniteError } from '@cognite/sdk/dist/src';
import { useSDK } from '@cognite/sdk-provider';

import { queryKeys } from '../../../queryKeys';
import { fetchThreeDModelQuery, fetchThreeDRevisionQuery } from '../network';
import { DetailedMapping } from '../types';

import { useBasicMappingsByAssetIdQuery } from './useBasicMappingsByAssetIdQuery';

export const useDetailedMappingsByAssetIdQuery = (
  assetId: number,
  limit?: number | undefined,
  options?: UseQueryOptions<DetailedMapping[], CogniteError, DetailedMapping[]>
) => {
  const sdk = useSDK();
  const queryClient = useQueryClient();

  const {
    data,
    fetchNextPage: fetchMore,
    hasNextPage: canFetchMore,
    isFetchingNextPage: isFetchingMore,
  } = useBasicMappingsByAssetIdQuery({
    assetId: assetId,
    limit: limit,
  });

  useEffect(() => {
    if (canFetchMore && !isFetchingMore) {
      fetchMore();
    }
  }, [canFetchMore, fetchMore, isFetchingMore]);

  return useQuery<DetailedMapping[], CogniteError, DetailedMapping[]>(
    queryKeys.listDetailedAssetMappings(assetId),
    async () => {
      return Promise.all(
        uniqWith(
          data,
          (
            { modelId: mId1, revisionId: rId1 },
            { modelId: mId2, revisionId: rId2 }
          ) => mId1 === mId2 && rId1 === rId2
        ).map(async ({ modelId, revisionId, ...otherProps }) => {
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
        })
      );
    },
    {
      ...options,
      enabled: data.length > 0 && !canFetchMore,
    }
  );
};
