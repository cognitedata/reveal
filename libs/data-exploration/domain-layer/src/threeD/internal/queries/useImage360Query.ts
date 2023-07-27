import {
  UseInfiniteQueryResult,
  useQueries,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

import { InternalThreeDFilters } from '@data-exploration-lib/core';
import {
  fetchImage360BySiteId,
  queryKeys,
  useInfinite360ImagesSiteIdAggregateQuery,
} from '@data-exploration-lib/domain-layer';

export const useImage360Query = (
  query?: string,
  filter?: InternalThreeDFilters,
  options?: UseQueryOptions
) => {
  const sdk = useSDK();
  const queryClient = useQueryClient();
  const aggregateQuery = useInfinite360ImagesSiteIdAggregateQuery(
    query,
    filter,
    {
      ...options,
    }
  );

  const result = useQueries({
    queries:
      aggregateQuery.data?.pages.flatMap((itemsRes) => {
        return itemsRes.items.map((res) => ({
          queryKey: queryKeys.image360DataBySiteId(res.siteId),
          queryFn: () =>
            fetchImage360BySiteId(sdk, queryClient, res.siteId, {}, {}),
          options: {
            enabled: aggregateQuery.data && options?.enabled,
          },
        }));
      }) || [],
  });

  const isFetched =
    aggregateQuery.isFetched && result.every((item) => item.isFetched);

  return {
    ...aggregateQuery,
    isLoading:
      aggregateQuery.isLoading && result.some((item) => item.isLoading),
    isFetching:
      aggregateQuery.isFetching || result.some((item) => item.isFetching),
    data: isFetched
      ? {
          ...aggregateQuery.data,
          pages: (aggregateQuery?.data || { pages: [] }).pages.map((page) => {
            return {
              ...page,
              items: page.items.map((item) => {
                return {
                  ...item,
                  ...result.find(
                    (resultItem) =>
                      !!resultItem?.data?.siteId &&
                      resultItem?.data?.siteId === item.siteId
                  )?.data,
                };
              }),
            };
          }),
        }
      : undefined,
  } as UseInfiniteQueryResult;
};
