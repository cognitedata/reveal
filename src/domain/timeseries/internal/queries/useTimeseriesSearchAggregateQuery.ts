import { useMemo } from 'react';
import {
  InternalTimeseriesFilters,
  mapFiltersToTimeseriesAdvancedFilters,
  mapInternalFilterToTimeseriesFilter,
  useTimeseriesSearchQueryMetadataKeysQuery,
  useTimeseriesAggregateQuery,
} from 'domain/timeseries';

export const useTimeseriesSearchAggregateQuery = ({
  query,
  filter,
}: {
  query?: string;
  filter: InternalTimeseriesFilters;
}) => {
  const searchQueryMetadataKeys = useTimeseriesSearchQueryMetadataKeysQuery(
    query,
    filter
  );

  const advancedFilter = useMemo(
    () =>
      mapFiltersToTimeseriesAdvancedFilters(
        filter,
        searchQueryMetadataKeys,
        query
      ),
    [filter, searchQueryMetadataKeys, query]
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
      keepPreviousData: true,
    }
  );
};
