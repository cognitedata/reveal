/*!
 * Copyright 2024 Cognite AS
 */
import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { useSDK } from '../components/RevealCanvas/SDKProvider';
import { queryKeys } from '../utilities/queryKeys';
import { type Datapoints } from '@cognite/sdk/';

export const useTimeseriesLatestDatapointQuery = (
  timeseriesId: number
): UseQueryResult<Datapoints, unknown> => {
  const sdk = useSDK();

  return useQuery([queryKeys.timeseriesLatestDatapoint(), timeseriesId], async () => {
    const results = await sdk.datapoints.retrieveLatest([{ id: timeseriesId }]);
    return results[0];
  });
};
