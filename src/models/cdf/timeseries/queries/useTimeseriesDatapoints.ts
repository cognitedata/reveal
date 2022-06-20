import { Aggregate, CogniteInternalId } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import { useQueries } from 'react-query';

export default function useTimeseriesDatapoints(
  timeseriesIds: CogniteInternalId[],
  startDate: Date,
  endDate: Date,
  aggregates: Aggregate[]
) {
  const sdk = useSDK();
  const aggregatesQuery = aggregates.length > 0 ? { aggregates } : {};
  return useQueries(
    timeseriesIds.map((id) => ({
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
        datapoints: await sdk.datapoints.retrieve({
          items: [{ id }],
          ...aggregatesQuery,
        }),
      }),
      staleTime: Infinity,
      cacheTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
    }))
  );
}
