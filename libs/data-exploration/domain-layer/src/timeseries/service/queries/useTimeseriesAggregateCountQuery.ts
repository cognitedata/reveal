import { useSDK } from '@cognite/sdk-provider';
import {
  getTimeseriesAggregateCount,
  mapFiltersToTimeseriesAdvancedFilters,
  mapInternalFilterToTimeseriesFilter,
  queryKeys,
} from '@data-exploration-lib/domain-layer';
import { useQuery, UseQueryOptions } from 'react-query';
import { useMemo } from 'react';
import { InternalTimeseriesFilters } from '@data-exploration-lib/core';

export const useTimeseriesAggregateCountQuery = (
  {
    query,
    timeseriesFilters,
  }: {
    query?: string;
    timeseriesFilters: InternalTimeseriesFilters;
  },

  options?: UseQueryOptions
) => {
  const sdk = useSDK();

  const advancedFilter = useMemo(
    () => mapFiltersToTimeseriesAdvancedFilters(timeseriesFilters, query),
    [timeseriesFilters, query]
  );

  const filter = useMemo(
    () => mapInternalFilterToTimeseriesFilter(timeseriesFilters),
    [timeseriesFilters]
  );

  return useQuery(
    queryKeys.aggregateTimeseries([advancedFilter, filter, 'count']),
    () => {
      return getTimeseriesAggregateCount(sdk, {
        filter,
        advancedFilter,
      });
    },
    {
      ...(options as any),
    }
  );
};
