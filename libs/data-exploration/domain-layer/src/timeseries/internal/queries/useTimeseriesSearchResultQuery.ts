import { useMemo } from 'react';

import {
  InternalTimeseriesFilters,
  TimeseriesConfigType,
} from '@data-exploration-lib/core';
import { UseInfiniteQueryOptions } from '@tanstack/react-query';

import { DEFAULT_GLOBAL_TABLE_RESULT_LIMIT } from '../../../constants';
import { TableSortBy } from '../../../types';
import { useTimeseriesListQuery } from '../../service';
import {
  mapFiltersToTimeseriesAdvancedFilters,
  mapInternalFilterToTimeseriesFilter,
  mapTableSortByToTimeseriesSortFields,
} from '../transformers';

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
