import { useMemo } from 'react';

import { useQuery, UseQueryOptions } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

import {
  EventConfigType,
  InternalEventsFilters,
} from '@data-exploration-lib/core';

import { queryKeys } from '../../../queryKeys';
import {
  mapFiltersToEventsAdvancedFilters,
  mapInternalFilterToEventsFilter,
} from '../../internal';
import { getEventsAggregateCount } from '../network';

export const useEventsAggregateCountQuery = (
  {
    query,
    eventsFilters,
  }: {
    query?: string;
    eventsFilters: InternalEventsFilters;
  },
  searchConfig?: EventConfigType,
  options?: UseQueryOptions
) => {
  const sdk = useSDK();

  const advancedFilter = useMemo(
    () => mapFiltersToEventsAdvancedFilters(eventsFilters, query, searchConfig),
    [eventsFilters, query, searchConfig]
  );

  const filter = useMemo(
    () => mapInternalFilterToEventsFilter(eventsFilters),
    [eventsFilters]
  );

  return useQuery(
    queryKeys.aggregateEvents([advancedFilter, filter, 'count']),
    () => {
      return getEventsAggregateCount(sdk, {
        filter,
        advancedFilter,
      });
    },
    {
      ...(options as any),
    }
  );
};
