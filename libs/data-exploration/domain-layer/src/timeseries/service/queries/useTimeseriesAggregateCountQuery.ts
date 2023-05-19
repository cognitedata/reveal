import { useSDK } from '@cognite/sdk-provider';
import {
  getTimeseriesAggregateCount,
  mapFiltersToTimeseriesAdvancedFilters,
  mapInternalFilterToTimeseriesFilter,
  queryKeys,
} from '@data-exploration-lib/domain-layer';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  InternalTimeseriesFilters,
  TimeseriesConfigType,
} from '@data-exploration-lib/core';

export const useTimeseriesAggregateCountQuery = (
  {
    query,
    timeseriesFilters,
  }: {
    query?: string;
    timeseriesFilters: InternalTimeseriesFilters;
  },
  searchConfig?: TimeseriesConfigType,
  options?: UseQueryOptions
) => {
  const sdk = useSDK();

  const advancedFilter = useMemo(
    () =>
      mapFiltersToTimeseriesAdvancedFilters(
        timeseriesFilters,
        query,
        searchConfig
      ),
    [timeseriesFilters, query, searchConfig]
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
