import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
} from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

import { queryKeys } from '../../../queryKeys';
import { ThreeDModelsResponse } from '../types';

export const useInfinite3DModelsQuery = (
  limit = 1000,
  config?: UseInfiniteQueryOptions<
    ThreeDModelsResponse,
    unknown,
    ThreeDModelsResponse,
    ThreeDModelsResponse,
    string[]
  >
) => {
  const sdk = useSDK();

  return useInfiniteQuery(
    queryKeys.listThreeDModels(limit),
    async ({ pageParam }) => {
      return sdk.models3D.list({ limit, cursor: pageParam });
    },
    {
      getNextPageParam: (r) => r.nextCursor,
      ...config,
      keepPreviousData: true,
    }
  );
};
