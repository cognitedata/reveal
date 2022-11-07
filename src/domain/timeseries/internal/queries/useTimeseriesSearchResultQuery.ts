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
  timeseriesFilters,
  sortBy,
}: {
  query?: string;
  timeseriesFilters: InternalTimeseriesFilters;
  sortBy?: TableSortBy[];
}) => {
  const filter = useMemo(
    () => mapInternalFilterToTimeseriesFilter(timeseriesFilters),
    [timeseriesFilters]
  );

  const sort = useMemo(
    () => mapTableSortByToTimeseriesSortFields(sortBy),
    [sortBy]
  );

  return useTimeseriesListQuery({
    filter,
    sort,
    limit: DEFAULT_GLOBAL_TABLE_RESULT_LIMIT,
  });
};
