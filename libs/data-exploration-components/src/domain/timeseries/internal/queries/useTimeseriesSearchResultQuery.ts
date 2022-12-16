import { useMemo } from 'react';
import { DEFAULT_GLOBAL_TABLE_RESULT_LIMIT } from '@data-exploration-components/domain/constants';
import { TableSortBy } from '@data-exploration-components/components/Table';
import {
  InternalTimeseriesFilters,
  mapFiltersToTimeseriesAdvancedFilters,
  mapInternalFilterToTimeseriesFilter,
  mapTableSortByToTimeseriesSortFields,
  useTimeseriesListQuery,
  // useTimeseriesSearchQueryMetadataKeysQuery,
} from '@data-exploration-components/domain/timeseries';
import { UseInfiniteQueryOptions } from 'react-query';

export const useTimeseriesSearchResultQuery = (
  {
    query,
    filter,
    sortBy,
  }: {
    query?: string;
    filter: InternalTimeseriesFilters;
    sortBy?: TableSortBy[];
  },
  options?: UseInfiniteQueryOptions
) => {
  // const searchQueryMetadataKeys = useTimeseriesSearchQueryMetadataKeysQuery(
  //   query,
  //   filter
  // );

  const advancedFilter = useMemo(
    () =>
      mapFiltersToTimeseriesAdvancedFilters(
        filter,
        // searchQueryMetadataKeys,
        query
      ),
    [filter, query]
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
      limit: DEFAULT_GLOBAL_TABLE_RESULT_LIMIT,
    },
    {
      ...options,
      keepPreviousData: true,
    }
  );
};
