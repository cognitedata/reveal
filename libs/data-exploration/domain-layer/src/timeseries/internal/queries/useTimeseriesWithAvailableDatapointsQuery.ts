import { TableSortBy } from '../../../types';
import { UseInfiniteQueryOptions } from 'react-query';
import { useTimeseriesSearchResultWithLabelsQuery } from './useTimeseriesSearchResultWithLabelsQuery';
import { useTimeseriesWithDatapointsQuery } from './useTimeseriesWithDatapointsQuery';
import {
  InternalTimeseriesFilters,
  isDateInDateRange,
  TimeseriesConfigType,
} from '@data-exploration-lib/core';

export const useTimeseriesWithAvailableDatapointsQuery = (
  {
    query,
    filter,
    sortBy,
    dateRange,
  }: {
    filter: InternalTimeseriesFilters;
    query?: string;
    sortBy?: TableSortBy[];
    dateRange?: [Date, Date];
  },
  searchConfig?: TimeseriesConfigType,
  options?: UseInfiniteQueryOptions
) => {
  const { data: timeseries, ...rest } =
    useTimeseriesSearchResultWithLabelsQuery(
      {
        query,
        filter,
        sortBy,
      },
      options,
      searchConfig
    );

  // We need end date from dateRange to see if the range has any datapoints.
  const { data: timeseriesWithDataPointMap } = useTimeseriesWithDatapointsQuery(
    timeseries.map((item) => item.id),
    dateRange ? dateRange[1] : undefined
  );

  // We do not care about the dateRange to show the date of latest datepoints since backend uses 'now' as default before date.
  const { data: timeseriesWithLatestDataPointMap } =
    useTimeseriesWithDatapointsQuery(timeseries.map((item) => item.id));

  const timeseriesHasDatapoints = timeseries.map((item) => ({
    ...item,
    hasDatapoints: isDateInDateRange(
      timeseriesWithDataPointMap[item.id],
      dateRange
    ),
    latestDatapointDate: timeseriesWithLatestDataPointMap[item.id],
  }));

  return {
    data: timeseriesHasDatapoints,
    ...rest,
  };
};
