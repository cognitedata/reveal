import { useSDK } from '@cognite/sdk-provider';
import { Datapoints, LatestDataBeforeRequest } from '@cognite/sdk/dist/src';

import { UseQueryOptions, useQuery } from 'react-query';
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
