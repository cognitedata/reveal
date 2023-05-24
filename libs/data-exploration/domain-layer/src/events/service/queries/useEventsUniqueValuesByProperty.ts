import { useQuery } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

import {
  InternalEventsFilters,
  OldEventsFilters,
} from '@data-exploration-lib/core';
import { AdvancedFilter } from '../../../builders';
import { queryKeys } from '../../../queryKeys';
import { transformNewFilterToOldFilter } from '../../../transformers';
import { EventsProperties } from '../../internal';
import { getEventsUniqueValuesByProperty } from '../network';
import { EventProperty } from '../types';

interface Props {
  property: EventProperty;
  filter?: InternalEventsFilters | OldEventsFilters;
  advancedFilter?: AdvancedFilter<EventsProperties>;
  query?: string;
}

export const useEventsUniqueValuesByProperty = ({
  property,
  filter,
  advancedFilter,
  query,
}: Props) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.eventsUniqueValues(property, filter, advancedFilter, query),
    () => {
      return getEventsUniqueValuesByProperty(sdk, property, {
        filter: transformNewFilterToOldFilter(filter),
        advancedFilter,
        aggregateFilter: query ? { prefix: { value: query } } : undefined,
      });
    },
    {
      keepPreviousData: true,
    }
  );
};
