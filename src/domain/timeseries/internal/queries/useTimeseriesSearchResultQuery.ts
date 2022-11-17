import { useMemo } from 'react';
import { DEFAULT_GLOBAL_TABLE_RESULT_LIMIT } from 'domain/constants';
import { TableSortBy } from 'components/Table';
import {
  InternalTimeseriesFilters,
  mapFiltersToTimeseriesAdvancedFilters,
  mapInternalFilterToTimeseriesFilter,
  mapTableSortByToTimeseriesSortFields,
  useTimeseriesListQuery,
  useTimeseriesSearchQueryMetadataKeysQuery,
} from 'domain/timeseries';

export const useTimeseriesSearchResultQuery = ({
  query,
  filter,
  sortBy,
}: {
  query?: string;
  filter: InternalTimeseriesFilters;
  sortBy?: TableSortBy[];
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

  const timeseriesSort = useMemo(
    () => mapTableSortByToTimeseriesSortFields(sortBy),
    [sortBy]
  );

  return useTimeseriesListQuery({
    advancedFilter,
    filter: timeseriesFilter,
    sort: timeseriesSort,
    limit: DEFAULT_GLOBAL_TABLE_RESULT_LIMIT,
  });
};
