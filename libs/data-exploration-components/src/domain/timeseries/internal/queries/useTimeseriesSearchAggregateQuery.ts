import { useMemo } from 'react';
import {
  InternalTimeseriesFilters,
  mapFiltersToTimeseriesAdvancedFilters,
  mapInternalFilterToTimeseriesFilter,
  // useTimeseriesSearchQueryMetadataKeysQuery,
  useTimeseriesAggregateQuery,
} from 'domain/timeseries';
import { UseQueryOptions } from 'react-query';

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
