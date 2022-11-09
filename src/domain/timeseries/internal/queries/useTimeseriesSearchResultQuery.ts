import { useMemo } from 'react';
import { DEFAULT_GLOBAL_TABLE_RESULT_LIMIT } from 'domain/constants';
import { TableSortBy } from 'components/ReactTable/V2';
import {
  InternalTimeseriesFilters,
  mapInternalFilterToTimeseriesFilter,
  mapTableSortByToTimeseriesSortFields,
  useTimeseriesListQuery,
} from 'domain/timeseries';

export const useTimeseriesSearchResultQuery = ({
  filter,
  sortBy,
}: {
  query?: string;
  filter: InternalTimeseriesFilters;
  sortBy?: TableSortBy[];
}) => {
  const timeseriesFilter = useMemo(
    () => mapInternalFilterToTimeseriesFilter(filter),
    [filter]
  );

  const timeseriesSort = useMemo(
    () => mapTableSortByToTimeseriesSortFields(sortBy),
    [sortBy]
  );

  return useTimeseriesListQuery({
    filter: timeseriesFilter,
    sort: timeseriesSort,
    limit: DEFAULT_GLOBAL_TABLE_RESULT_LIMIT,
  });
};
