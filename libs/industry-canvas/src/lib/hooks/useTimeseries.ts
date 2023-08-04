import { useQuery } from '@tanstack/react-query';

import { Timeseries } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

export const useTimeseries = (timeseriesId?: number) => {
  const sdk = useSDK();

  return useQuery<Timeseries | undefined>(
    ['timeseries', timeseriesId],
    async () => {
      if (timeseriesId === undefined) {
        return undefined;
      }

      const timeseries = await sdk.timeseries.retrieve([{ id: timeseriesId }]);
      if (timeseries.length !== 1) {
        throw new Error(
          'Expected exactly one timeseries, got ' + timeseries.length
        );
      }

      return timeseries[0];
    },
    { enabled: !!timeseriesId }
  );
};
