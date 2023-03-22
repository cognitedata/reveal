import { useMemo } from 'react';
import {
  mapFiltersToTimeseriesAdvancedFilters,
  mapInternalFilterToTimeseriesFilter,
  useTimeseriesAggregateQuery,
} from '@data-exploration-lib/domain-layer';
import { UseQueryOptions } from 'react-query';
import { InternalTimeseriesFilters } from '@data-exploration-lib/core';

export const useTimeseriesSearchAggregateQuery = (
  {
    query,
    filter,
  }: {
    query?: string;
    filter: InternalTimeseriesFilters;
  },
  options?: UseQueryOptions
) => {
  const advancedFilter = useMemo(
    () => mapFiltersToTimeseriesAdvancedFilters(filter, query),
    [filter, query]
  );

  const timeseriesFilter = useMemo(
    () => mapInternalFilterToTimeseriesFilter(filter),
    [filter]
  );

  return useTimeseriesAggregateQuery(
    {
      filter: timeseriesFilter,
      advancedFilter,
    },
    {
      ...options,
      keepPreviousData: true,
    }
  );
};
