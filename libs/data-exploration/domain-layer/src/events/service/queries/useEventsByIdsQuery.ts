import { UseQueryOptions, useQuery } from '@tanstack/react-query';

import { IdEither } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import { queryKeys } from '../../../queryKeys';
import { InternalEventsData } from '../../internal';
import { getEventsByIds } from '../network';

export const useEventsByIdsQuery = <T = InternalEventsData>(
  ids: IdEither[],
  options?: Omit<UseQueryOptions<InternalEventsData[], any, T[]>, 'queryKey'>
) => {
  const sdk = useSDK();
  return useQuery(
    queryKeys.eventsByIds(ids),
    () => getEventsByIds(sdk, ids || []),
    options
  );
};
