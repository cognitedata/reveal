import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
} from '@tanstack/react-query';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';

import { useSDK } from '@cognite/sdk-provider';

import {
  getEventsMetadataValuesAggregate,
  EventsMetadataAggregateResponse,
  queryKeys,
  EventsAggregateFilters,
} from '@data-exploration-lib/domain-layer';

export const useEventsAdvancedMetadataValuesAggregateQuery = (
  metadataKey?: string | null,
  query?: string,
  filter?: Pick<EventsAggregateFilters, 'filter' | 'advancedFilter'>,
  options?: UseInfiniteQueryOptions<
    EventsMetadataAggregateResponse[],
    unknown,
    EventsMetadataAggregateResponse[],
    EventsMetadataAggregateResponse[],
    any
  >
) => {
  const sdk = useSDK();

  return useInfiniteQuery(
    queryKeys.eventsMetadataValues(String(metadataKey), query, filter),
    () => {
      return getEventsMetadataValuesAggregate(sdk, String(metadataKey), {
        ...filter,
        aggregateFilter: query ? { prefix: { value: query } } : undefined,
      });
    },
    {
      enabled:
        !isEmpty(metadataKey) &&
        (isUndefined(options?.enabled) ? true : options?.enabled),
      ...options,
      keepPreviousData: true,
    }
  );
};
