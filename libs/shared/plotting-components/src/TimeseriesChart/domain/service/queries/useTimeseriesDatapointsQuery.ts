import { useQuery } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

import { queryKeys } from '../../queryKeys';
import { getTimeseriesDatapointsSafe } from '../network';
import { TimeseriesDatapointsQuery } from '../types';

interface Props {
  query: TimeseriesDatapointsQuery;
  enabled?: boolean;
}

export const useTimeseriesDatapointsQuery = ({ query, enabled }: Props) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.datapoints(query),
    async () => {
      return getTimeseriesDatapointsSafe(sdk, query);
    },
    {
      keepPreviousData: true,
      enabled,
    }
  );
};
