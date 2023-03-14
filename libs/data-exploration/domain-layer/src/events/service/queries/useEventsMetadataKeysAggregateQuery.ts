import { useQuery, UseQueryOptions } from 'react-query';

import { useSDK } from '@cognite/sdk-provider';
import { InternalEventsFilters, OldEventsFilters } from '../../internal';
import {
  getEventsMetadataKeysAggregate,
  queryKeys,
  transformNewFilterToOldFilter,
} from '@data-exploration-lib/domain-layer';
import { EventsMetadataAggregateResponse } from '../types';

export const useEventsMetadataKeysAggregateQuery = (
  filter?: InternalEventsFilters | OldEventsFilters,
  options?: UseQueryOptions<
    EventsMetadataAggregateResponse[],
    unknown,
    EventsMetadataAggregateResponse[],
    any
  >
) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.eventsMetadata(filter),
    () => {
      return getEventsMetadataKeysAggregate(sdk, {
        filter: transformNewFilterToOldFilter(filter),
      });
    },
    options
  );
};
