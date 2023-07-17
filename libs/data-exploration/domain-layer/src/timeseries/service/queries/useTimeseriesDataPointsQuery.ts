import { UseQueryOptions, useQuery } from '@tanstack/react-query';

import {
  Datapoints,
  DatapointsMultiQuery,
  IdEither,
} from '@cognite/sdk/dist/src';
import { useSDK } from '@cognite/sdk-provider';

import { EMPTY_OBJECT } from '@data-exploration-lib/core';

import { queryKeys } from '../../../queryKeys';
import { getTimeseriesDatapoints } from '../network';

export const useTimeseriesDataPointsQuery = (
  items: IdEither[],
  filter: Omit<DatapointsMultiQuery, 'items'> = EMPTY_OBJECT,
  options?: UseQueryOptions<Datapoints[]>,
  limit?: number
) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.timeseriesDatapoints(items, filter, limit),
    async () => {
      return getTimeseriesDatapoints(sdk, { items, ...filter }, limit);
    },
    { ...(options as any) }
  );
};
