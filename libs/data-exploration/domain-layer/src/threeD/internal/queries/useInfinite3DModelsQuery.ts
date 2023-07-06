import { useCallback } from 'react';

import {
  InfiniteData,
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
  >,
  query?: string
) => {
  const sdk = useSDK();

  return useInfiniteQuery(
    queryKeys.listThreeDModels(limit, query),
    async ({ pageParam }) => {
      return sdk.models3D.list({ limit, cursor: pageParam });
    },
    {
      getNextPageParam: (r) => r.nextCursor,
      keepPreviousData: true,
      select: useCallback(
        (data: InfiniteData<ThreeDModelsResponse>) => {
          return {
            ...data,
            pages: data.pages.map((modelArr) => {
              return {
                ...modelArr,
                items: modelArr.items
                  .map((model) => ({ ...model, name: model.name.trim() }))
                  .filter((model) =>
                    !!query
                      ? model.name.toLowerCase().includes(query.toLowerCase())
                      : model
                  ),
              };
            }),
          };
        },
        [query]
      ),
      ...config,
    }
  );
};
