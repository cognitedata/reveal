import { useQuery } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';
import { baseCacheKey } from '@cognite/sdk-react-query-hooks';

export const useTimeseriesLatestDatapointQuery = (timeseriesId: number) => {
  const sdk = useSDK();

  return useQuery(
    [...baseCacheKey('timeseries'), 'latest-datapoints', timeseriesId],
    async () => {
      const results = await sdk.datapoints.retrieveLatest([
        { id: timeseriesId },
      ]);
      return results[0];
    }
  );
};
