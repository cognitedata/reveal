import { Aggregate, DatapointAggregate, Timeseries } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import { useQueries } from 'react-query';

export default function useTimeseriesAggregatedDatapoints(
  timeseries: Timeseries['id'][],
  startDate: Date,
  endDate: Date,
  aggregates: Aggregate[] = ['min', 'max', 'average'],
  granularity: string = '7d'
) {
  const sdk = useSDK();
  const aggregatesQuery = aggregates.length > 0 ? { aggregates } : {};
  return useQueries(
    timeseries.map((id) => ({
      queryKey: [
        'cdf',
        'timeseries',
        id,
        'datapoints',
        startDate.toISOString(),
        endDate.toISOString(),
      ],
      queryFn: async () => ({
        id,
        startDate,
        endDate,
        datapoints: (
          await sdk.datapoints.retrieve({
            items: [{ id }],
            start: startDate.getTime(),
            end: endDate.getTime(),
            granularity,
            ...aggregatesQuery,
          })
        )[0].datapoints as DatapointAggregate[],
      }),
      enabled: !!id,
      staleTime: Infinity,
      cacheTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
    }))
  );
}
