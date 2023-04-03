import { useQuery, UseQueryOptions } from 'react-query';
import { useSDK } from '@cognite/sdk-provider';
import {
  getEventsMetadataValuesAggregate,
  EventsMetadataAggregateResponse,
  queryKeys,
  transformNewFilterToOldFilter,
} from '@data-exploration-lib/domain-layer';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import {
  InternalEventsFilters,
  OldEventsFilters,
} from '@data-exploration-lib/core';

export const useEventsMetadataValuesAggregateQuery = (
  metadataKey?: string | null,
  query?: string,
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
    queryKeys.eventsMetadataValues(String(metadataKey), query, filter),
    () => {
      return getEventsMetadataValuesAggregate(sdk, String(metadataKey), {
        filter: transformNewFilterToOldFilter(filter),
        aggregateFilter: query ? { prefix: { value: query } } : undefined,
      });
    },
    {
      enabled:
        !isEmpty(metadataKey) &&
        (isUndefined(options?.enabled) ? true : options?.enabled),
      ...options,
    }
  );
};
