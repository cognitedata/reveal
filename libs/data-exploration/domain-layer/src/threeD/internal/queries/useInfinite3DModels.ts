import { useSDK } from '@cognite/sdk-provider';
import { useInfiniteQuery, UseInfiniteQueryOptions } from 'react-query';
import { ThreeDModelsResponse } from '../types';

export const useInfinite3DModels = (
  limit?: number,
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
    ['cdf', 'infinite', '3d', 'models', 'list'],
    async ({ pageParam }) => {
      const models = await sdk.get<ThreeDModelsResponse>(
        `/api/v1/projects/${sdk.project}/3d/models`,
        { params: { limit: limit || 1000, cursor: pageParam } }
      );
      return models.data;
    },
    {
      getNextPageParam: (r) => r.nextCursor,
      ...config,
    }
  );
};
