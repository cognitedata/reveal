import { useQuery } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

import { queryKeys } from '../../queryKeys';
import { getTimeseriesDatapointsMulti } from '../network';
import { TimeseriesDatapointsQuery } from '../types';

interface Props {
  queries: TimeseriesDatapointsQuery[];
  enabled?: boolean;
}

export const useTimeseriesDatapointsQuery = ({ queries, enabled }: Props) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.datapoints(queries),
    async () => {
      return getTimeseriesDatapointsMulti(sdk, queries);
    },
    {
      keepPreviousData: true,
      enabled,
    }
  );
};
