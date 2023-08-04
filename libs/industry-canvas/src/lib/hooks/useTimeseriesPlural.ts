import { useQuery } from '@tanstack/react-query';
import { keyBy } from 'lodash';

import { Timeseries } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

export const useTimeseriesPlural = (timeseriesIds: number[]) => {
  const sdk = useSDK();

  return useQuery<Record<string, Timeseries>>(
    ['timeseries', 'byId', timeseriesIds],
    async (): Promise<Record<string, Timeseries>> => {
      if (timeseriesIds.length === 0) {
        return {};
      }

      const timeseries = await sdk.timeseries.retrieve(
        timeseriesIds.map((tsId) => ({ id: tsId }))
      );

      return keyBy(timeseries, (ts: Timeseries) => ts.id);
    },
    { enabled: timeseriesIds.length !== 0 }
  );
};
