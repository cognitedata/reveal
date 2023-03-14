import { useQuery, UseQueryOptions } from 'react-query';
import { useSDK } from '@cognite/sdk-provider';
import { InternalEventsFilters, OldEventsFilters } from '../../internal';
import {
  getEventsMetadataValuesAggregate,
  EventsMetadataAggregateResponse,
  queryKeys,
  transformNewFilterToOldFilter,
} from '@data-exploration-lib/domain-layer';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';

export const useEventsMetadataValuesAggregateQuery = (
  metadataKey?: string | null,
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
    queryKeys.eventsMetadataValues(String(metadataKey), filter),
    () => {
      return getEventsMetadataValuesAggregate(sdk, String(metadataKey), {
        filter: transformNewFilterToOldFilter(filter),
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
