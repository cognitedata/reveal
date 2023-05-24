import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useSDK } from '@cognite/sdk-provider';
import {
  getEventsMetadataValuesAggregate,
  EventsMetadataAggregateResponse,
  queryKeys,
  transformNewFilterToOldFilter,
  AdvancedFilter,
  EventsProperties,
} from '@data-exploration-lib/domain-layer';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import { InternalEventsFilters } from '@data-exploration-lib/core';

interface Props {
  metadataKey?: string | null;
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

export const useEventsMetadataValuesAggregateQuery = ({
  metadataKey,
  query,
  advancedFilter,
  filter,
  options,
}: Props) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.eventsMetadataValues(
      String(metadataKey),
      query,
      advancedFilter,
      filter
    ),
    () => {
      return getEventsMetadataValuesAggregate(sdk, String(metadataKey), {
        advancedFilter,
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
