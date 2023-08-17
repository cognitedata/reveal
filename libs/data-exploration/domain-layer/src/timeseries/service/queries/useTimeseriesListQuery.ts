import { useMemo } from 'react';

import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
} from '@tanstack/react-query';

import { TimeseriesFilter } from '@cognite/sdk/dist/src';
import { useSDK } from '@cognite/sdk-provider';

import { AdvancedFilter } from '../../../builders';
import { queryKeys } from '../../../queryKeys';
import { InternalSortBy } from '../../../types';
import { TimeseriesProperties } from '../../internal';
import { getTimeseriesList } from '../network';

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
    queryKeys.listTimeseries([advancedFilter, filter, limit, sort, options]),
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
