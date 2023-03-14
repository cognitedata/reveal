import { TableSortBy } from '../../../types';
import { UseInfiniteQueryOptions } from 'react-query';
import { InternalTimeseriesFilters } from '../types';
import { useTimeseriesSearchResultWithLabelsQuery } from './useTimeseriesSearchResultWithLabelsQuery';
import { useTimeseriesWithDatapointsMap } from './useTimeseriesDatapointsMap';

export const useTimeseriesWithDatapointsAvailabliity = (
  {
    query,
    filter,
    sortBy,
    dateRange,
  }: {
    query?: string;
    filter: InternalTimeseriesFilters;
    sortBy?: TableSortBy[];
    dateRange?: [Date, Date];
  },
  options?: UseInfiniteQueryOptions
) => {
  const { data: timeseries, ...rest } =
    useTimeseriesSearchResultWithLabelsQuery(
      {
        query,
        filter,
        sortBy,
      },
      options
    );

  const timeseriesWithDataPointMap = useTimeseriesWithDatapointsMap(
    timeseries.map((item) => item.id),
    dateRange
  );
  const timeseriesHasDatapoints = timeseries.map((item) => ({
    ...item,
    hasDatapoints: !!timeseriesWithDataPointMap[item.id],
  }));

  return {
    data: timeseriesHasDatapoints,
    ...rest,
  };
};
