/*!
 * Copyright 2024 Cognite AS
 */
import { useQuery } from '@tanstack/react-query';
import { useSDK } from '../components/RevealCanvas/SDKProvider';
import { queryKeys } from '../utilities/queryKeys';
import { type Datapoints } from '@cognite/sdk/';

export const useTimeseriesLatestDatapointQuery = (
  timeseriesIds: number[]
): Datapoints[] | undefined => {
  const sdk = useSDK();

  const timeseries = timeseriesIds.map((id) => {
    return { id };
  });
  const { data: timeseriesDatapoints } = useQuery(
    [queryKeys.timeseriesLatestDatapoint(), timeseriesIds],
    async () => {
      const results = await sdk.datapoints.retrieveLatest(timeseries);
      return results;
    }
  );

  return timeseriesDatapoints;
};
