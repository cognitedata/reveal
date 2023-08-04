import { useQuery } from '@tanstack/react-query';
import { mapValues, keyBy } from 'lodash';

import { Datapoints } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

const REFETCH_INTERVAL_MS = 30000;

const useTimeseriesLatestValues = (timeseriesIds: number[]) => {
  const sdk = useSDK();

  return useQuery(
    ['timeseries', timeseriesIds],
    async () => {
      const response = await sdk.datapoints.retrieveLatest(
        timeseriesIds.map((id) => ({ id }))
      );

      const latestValueByTimeseriesId: Record<number, number | string> =
        mapValues(
          keyBy(response, (ts: Datapoints) => ts.id),
          (ts: Datapoints) => ts.datapoints[0].value
        );

      return latestValueByTimeseriesId;
    },
    {
      refetchInterval: REFETCH_INTERVAL_MS,
      enabled: timeseriesIds.length > 0,
    }
  );
};

export default useTimeseriesLatestValues;
