import { useSDK } from '@cognite/sdk-provider';
import { TimeseriesFilter } from '@cognite/sdk/dist/src';
import { AdvancedFilter } from '@data-exploration-components/domain/builders';
import { queryKeys } from '@data-exploration-components/domain/queryKeys';
import {
  getTimeseriesList,
  TimeseriesProperties,
} from '@data-exploration-components/domain/timeseries';
import { InternalSortBy } from '@data-exploration-components/domain/types';
import { useMemo } from 'react';
import { useInfiniteQuery, UseInfiniteQueryOptions } from 'react-query';

export const useTimeseriesListQuery = (
  {
    advancedFilter,
    filter,
    limit,
    sort,
  }: {
    advancedFilter?: AdvancedFilter<TimeseriesProperties>;
    filter?: TimeseriesFilter;
    limit?: number;
    sort?: InternalSortBy[];
  } = {},
  options?: UseInfiniteQueryOptions
) => {
  const sdk = useSDK();
  const { data, ...rest } = useInfiniteQuery(
    queryKeys.listTimeseries([advancedFilter, filter, limit, sort]),
    ({ pageParam }) => {
      return getTimeseriesList(sdk, {
        cursor: pageParam,
        filter,
        advancedFilter,
        sort,
        limit,
      });
    },
    {
      getNextPageParam: (param) => param.nextCursor,
      ...(options as any),
    }
  );

  const flattenData = useMemo(
    () => (data?.pages || []).flatMap(({ items }) => items),
    [data?.pages]
  );

  return { data: flattenData, ...rest };
};
