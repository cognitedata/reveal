import { useQuery, UseQueryOptions } from 'react-query';

import { useSDK } from '@cognite/sdk-provider';
import {
  AdvancedFilter,
  EventsProperties,
  getEventsMetadataKeysAggregate,
  queryKeys,
  transformNewFilterToOldFilter,
} from '@data-exploration-lib/domain-layer';
import { EventsMetadataAggregateResponse } from '../types';
import { InternalEventsFilters } from '@data-exploration-lib/core';

interface Props {
  query?: string;
  advancedFilter?: AdvancedFilter<EventsProperties>;
  filter?: InternalEventsFilters;
  options?: UseQueryOptions<
    EventsMetadataAggregateResponse[],
    unknown,
    EventsMetadataAggregateResponse[],
    any
  >;
}

export const useEventsMetadataKeysAggregateQuery = ({
  query,
  advancedFilter,
  filter,
  options,
}: Props = {}) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.eventsMetadata(query, advancedFilter, filter),
    () => {
      return getEventsMetadataKeysAggregate(sdk, {
        advancedFilter,
        filter: transformNewFilterToOldFilter(filter),
        aggregateFilter: query ? { prefix: { value: query } } : undefined,
      });
    },
    options
  );
};
