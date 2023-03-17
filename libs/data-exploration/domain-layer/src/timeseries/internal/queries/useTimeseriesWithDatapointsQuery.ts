import { useMemo } from 'react';
import { useTimeseriesLatestDataPointQuery } from '../../service';

export const useTimeseriesWithDatapointsQuery = (
  timeseries: number[],
  beforeDate?: Date,
  isEnabled = true
) => {
  const { data: timeseriesDataPoints = [], ...rest } =
    useTimeseriesLatestDataPointQuery(
      timeseries.map((id) => ({
        id,
        before: beforeDate,
      })),
      {
        enabled: isEnabled && timeseries.length > 0,
        keepPreviousData: true,
      }
    );

  const timeseriesWithDatapointsMap = useMemo(
    () =>
      timeseriesDataPoints.reduce(
        (acc, item) => ({
          ...acc,
          [item.id]: item.datapoints[0]?.timestamp,
        }),
        {} as Record<number, Date | undefined>
      ),
    [timeseriesDataPoints]
  );

  return { data: timeseriesWithDatapointsMap, ...rest };
};
