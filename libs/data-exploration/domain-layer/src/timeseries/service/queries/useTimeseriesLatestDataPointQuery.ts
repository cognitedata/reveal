import { UseQueryOptions, useQuery } from '@tanstack/react-query';

import { Datapoints, LatestDataBeforeRequest } from '@cognite/sdk/dist/src';
import { useSDK } from '@cognite/sdk-provider';

import { queryKeys } from '../../../queryKeys';
import { getTimeseriesLatestDatapoint } from '../network';

export const useTimeseriesLatestDataPointQuery = (
  items: LatestDataBeforeRequest[],
  options?: UseQueryOptions<Datapoints[]>
) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.timeseriesLatestDatapoints(items),
    async () => {
      return getTimeseriesLatestDatapoint(sdk, items);
    },
    { ...(options as any) }
  );
};
