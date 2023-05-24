import { useSDK } from '@cognite/sdk-provider';
import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
} from '@tanstack/react-query';
import { ThreeDModelsResponse } from '../types';
import { list3DModelQuery } from '../../service';
import { queryKeys } from '../../../queryKeys';

export const useInfinite3DModelsQuery = (
  limit = 1000,
  config?: UseInfiniteQueryOptions<
    ThreeDModelsResponse,
    unknown,
    ThreeDModelsResponse,
    ThreeDModelsResponse,
    string[]
  >,
  filter = {}
) => {
  const sdk = useSDK();

  return useInfiniteQuery(
    queryKeys.listThreeDModels(limit),
    async ({ pageParam }) => {
      return list3DModelQuery(sdk, filter, limit, pageParam);
    },
    {
      getNextPageParam: (r) => r.nextCursor,
      ...config,
      keepPreviousData: true,
    }
  );
};
