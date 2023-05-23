import { useMemo } from 'react';
import { DEFAULT_GLOBAL_TABLE_RESULT_LIMIT } from '@data-exploration-lib/domain-layer';
import { TableSortBy } from '@data-exploration-lib/domain-layer';
import {
  mapFiltersToTimeseriesAdvancedFilters,
  mapInternalFilterToTimeseriesFilter,
  mapTableSortByToTimeseriesSortFields,
  useTimeseriesListQuery,
} from '@data-exploration-lib/domain-layer';
import { UseInfiniteQueryOptions } from 'react-query';
import {
  InternalTimeseriesFilters,
  TimeseriesConfigType,
} from '@data-exploration-lib/core';

export const useTimeseriesSearchResultQuery = (
  {
    query,
    filter,
    sortBy,
    limit,
  }: {
    query?: string;
    filter: InternalTimeseriesFilters;
    sortBy?: TableSortBy[];
    limit?: number;
  },
  searchConfig?: TimeseriesConfigType,
  options?: UseInfiniteQueryOptions
) => {
  const advancedFilter = useMemo(
    () => mapFiltersToTimeseriesAdvancedFilters(filter, query, searchConfig),
    [filter, query, searchConfig]
  );

  const timeseriesFilter = useMemo(
    () => mapInternalFilterToTimeseriesFilter(filter),
    [filter]
  );

  const timeseriesSort = useMemo(
    () => mapTableSortByToTimeseriesSortFields(sortBy),
    [sortBy]
  );

  return useTimeseriesListQuery(
    {
      advancedFilter,
      filter: timeseriesFilter,
      sort: timeseriesSort,
      limit: limit || DEFAULT_GLOBAL_TABLE_RESULT_LIMIT,
    },
    {
      ...options,
      keepPreviousData: true,
    }
  );
};
