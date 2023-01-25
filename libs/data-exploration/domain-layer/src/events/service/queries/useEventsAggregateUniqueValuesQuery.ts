import { useSDK } from '@cognite/sdk-provider';
import { EventsProperties } from '@data-exploration-lib/domain-layer';
import { queryKeys } from '@data-exploration-lib/domain-layer';
import { useQuery, UseQueryOptions } from 'react-query';

import {
  AdvancedFilter,
  getEventsAggregateUniqueValues,
  EventAggreateOptions,
  InternalEventsFilters,
} from '@data-exploration-lib/domain-layer';

export const useEventsAggregateUniqueValuesQuery = (
  {
    filter,
    advancedFilter,
    aggregateOptions,
  }: {
    filter?: InternalEventsFilters;
    advancedFilter?: AdvancedFilter<EventsProperties>;
    aggregateOptions: EventAggreateOptions;
  },
  options?: UseQueryOptions
) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.aggregateEvents([
      advancedFilter,
      filter,
      'uniqueValues',
      aggregateOptions,
    ]),
    () => {
      return getEventsAggregateUniqueValues(sdk, {
        filter,
        advancedFilter,
        aggregateOptions,
      });
    },
    {
      ...(options as any),
    }
  );
};
