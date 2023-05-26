import { InternalEventsFilters } from '@data-exploration-lib/core';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';

import { useSDK } from '@cognite/sdk-provider';

import { AdvancedFilter } from '../../../builders';
import { queryKeys } from '../../../queryKeys';
import { transformNewFilterToOldFilter } from '../../../transformers';
import { EventsProperties } from '../../internal';
import { getEventsMetadataValuesAggregate } from '../network';
import { EventsMetadataAggregateResponse } from '../types';

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
