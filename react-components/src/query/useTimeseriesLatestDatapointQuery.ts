/*!
 * Copyright 2024 Cognite AS
 */
import { useQuery } from '@tanstack/react-query';
import { useSDK } from '../components/RevealCanvas/SDKProvider';
import { queryKeys } from '../utilities/queryKeys';
import { type Datapoints } from '@cognite/sdk/';
import { getTimeseriesLatestDatapoints } from '../hooks/network/getTimeseriesLatestDatapoints';

export const useTimeseriesLatestDatapointQuery = (
  timeseriesIds: number[],
  isLoadingAssetIdsAndTimeseries: boolean
): Datapoints[] | undefined => {
  const sdk = useSDK();

  const timeseries = timeseriesIds.map((id) => {
    return { id };
  });
  const { data: timeseriesDatapoints } = useQuery(
    [queryKeys.timeseriesLatestDatapoint(), timeseriesIds],
    async () => await getTimeseriesLatestDatapoints(sdk, timeseries),
    {
      enabled: !isLoadingAssetIdsAndTimeseries && timeseries.length > 0
    }
  );

  return timeseriesDatapoints;
};
