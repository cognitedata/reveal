import { InternalEventsFilters } from '@data-exploration-lib/core';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

import { AdvancedFilter } from '../../../builders';
import { queryKeys } from '../../../queryKeys';
import { transformNewFilterToOldFilter } from '../../../transformers';
import { EventsProperties } from '../../internal';
import { getEventsMetadataKeysAggregate } from '../network';
import { EventsMetadataAggregateResponse } from '../types';

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
