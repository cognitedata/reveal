import { UseQueryOptions, useQuery } from '@tanstack/react-query';

import { IdEither } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import { queryKeys } from '../../../queryKeys';
import { getTimeseriesByIds } from '../../service';
import { InternalTimeseriesData } from '../types';

export const useTimeseriesByIdsQuery = <T = InternalTimeseriesData>(
  ids: IdEither[],
  options?: Omit<
    UseQueryOptions<InternalTimeseriesData[], any, T[]>,
    'queryKey'
  >
) => {
  const sdk = useSDK();
  return useQuery(
    queryKeys.timeseriesById(ids),
    () => getTimeseriesByIds(sdk, ids || []),
    options
  );
};
