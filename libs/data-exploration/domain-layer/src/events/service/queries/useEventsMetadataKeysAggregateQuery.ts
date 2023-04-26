import { useQuery, UseQueryOptions } from 'react-query';

import { useSDK } from '@cognite/sdk-provider';
import {
  AdvancedFilter,
  EventsProperties,
  getEventsMetadataKeysAggregate,
  queryKeys,
} from '@data-exploration-lib/domain-layer';
import { EventsMetadataAggregateResponse } from '../types';

interface Props {
  query?: string;
  advancedFilter?: AdvancedFilter<EventsProperties>;
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
  options,
}: Props = {}) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.eventsMetadata(query, advancedFilter),
    () => {
      return getEventsMetadataKeysAggregate(sdk, {
        advancedFilter,
        aggregateFilter: query ? { prefix: { value: query } } : undefined,
      });
    },
    options
  );
};
