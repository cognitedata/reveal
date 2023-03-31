import { useQuery, UseQueryOptions } from 'react-query';

import { useSDK } from '@cognite/sdk-provider';
import {
  getEventsMetadataKeysAggregate,
  queryKeys,
  transformNewFilterToOldFilter,
} from '@data-exploration-lib/domain-layer';
import { EventsMetadataAggregateResponse } from '../types';
import {
  InternalEventsFilters,
  OldEventsFilters,
} from '@data-exploration-lib/core';

export const useEventsMetadataKeysAggregateQuery = (
  filter?: InternalEventsFilters | OldEventsFilters,
  query?: string,
  options?: UseQueryOptions<
    EventsMetadataAggregateResponse[],
    unknown,
    EventsMetadataAggregateResponse[],
    any
  >
) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.eventsMetadata(filter, query),
    () => {
      return getEventsMetadataKeysAggregate(sdk, {
        filter: transformNewFilterToOldFilter(filter),
        aggregateFilter: query ? { prefix: { value: query } } : undefined,
      });
    },
    options
  );
};
