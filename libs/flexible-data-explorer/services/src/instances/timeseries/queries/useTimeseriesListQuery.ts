import { useMemo } from 'react';

import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
} from '@tanstack/react-query';

import { Timeseries, TimeseriesFilter } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import { ACDMAdvancedFilter } from '../../../builders';
import { queryKeys } from '../../../queryKeys';
import { getTimeseriesList } from '../network';

export const useTimeseriesListQuery = (
  {
    advancedFilter,
    filter,
    limit,
  }: {
    advancedFilter?: ACDMAdvancedFilter<Timeseries>;
    filter?: TimeseriesFilter;
    limit?: number;
  } = {},
  options?: UseInfiniteQueryOptions
) => {
  const sdk = useSDK();

  const { data, ...rest } = useInfiniteQuery(
    queryKeys.timeseriesList({ filter, advancedFilter }),
    ({ pageParam }) => {
      return getTimeseriesList(sdk, {
        cursor: pageParam,
        filter,
        advancedFilter,
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
