import { EMPTY_OBJECT } from '@data-exploration-lib/core';
import { useMemo } from 'react';
import { useTimeseriesDataPointsQuery } from '../../service';

const NUMBER_OF_POINTS = 1;
export const useTimeseriesWithDatapointsMap = (
  timeseries: number[],
  dateRange?: [Date, Date]
) => {
  const { data: timeseriesDataPoints = [] } = useTimeseriesDataPointsQuery(
    timeseries.map((id) => ({ id })),
    {
      ...(dateRange
        ? {
            start: dateRange[0],
            end: dateRange[1],

            limit: NUMBER_OF_POINTS,
          }
        : EMPTY_OBJECT),
    },
    {
      enabled: timeseries.length > 0,
    }
  );

  const timeseriesWithDatapointsCount = useMemo(
    () =>
      timeseriesDataPoints.reduce(
        (acc, item) => ({
          ...acc,
          [item.id]: item.datapoints.length > 0,
        }),
        {} as Record<number, boolean>
      ),
    [timeseriesDataPoints]
  );
  return timeseriesWithDatapointsCount;
};
