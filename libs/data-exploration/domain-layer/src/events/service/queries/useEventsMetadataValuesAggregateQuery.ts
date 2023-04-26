import { useQuery, UseQueryOptions } from 'react-query';
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

interface Props {
  metadataKey?: string | null;
  query?: string;
  advancedFilter?: AdvancedFilter<EventsProperties>;
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
  options,
}: Props) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.eventsMetadataValues(String(metadataKey), query, advancedFilter),
    () => {
      return getEventsMetadataValuesAggregate(sdk, String(metadataKey), {
        advancedFilter,
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
