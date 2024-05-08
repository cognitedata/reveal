/*!
 * Copyright 2024 Cognite AS
 */
import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { type Timeseries, type IdEither } from '@cognite/sdk';

import { getTimeseriesByIds } from '../hooks/network/getTimeseriesByIds';
import { queryKeys } from '../utilities/queryKeys';
import { useSDK } from '../components/RevealCanvas/SDKProvider';

export function useTimeseriesByIdsQuery(ids: IdEither[]): UseQueryResult<Timeseries[]> {
  const sdk = useSDK();
  return useQuery({
    queryKey: queryKeys.timeseriesById(ids),
    queryFn: async () => await getTimeseriesByIds(sdk, ids),
    enabled: ids.length > 0
  });
}
