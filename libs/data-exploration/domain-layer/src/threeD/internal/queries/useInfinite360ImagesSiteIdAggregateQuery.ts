import { useCallback } from 'react';

import { InfiniteData, UseInfiniteQueryResult } from '@tanstack/react-query';

import { InternalThreeDFilters } from '@data-exploration-lib/core';
import {
  EventsAggregateFilters,
  EventsMetadataAggregateResponse,
  EventsMetadataAggregateResponseItems,
  useEventsAdvancedMetadataValuesAggregateQuery,
} from '@data-exploration-lib/domain-layer';

export const useInfinite360ImagesSiteIdAggregateQuery = (
  query?: string,
  filter?: InternalThreeDFilters,
  options?: any
) => {
  return useEventsAdvancedMetadataValuesAggregateQuery(
    'site_id',
    '', // will not provide query since aggregateFilter doesn't support leaf filters more than the prefix
    filter as Pick<EventsAggregateFilters, 'filter' | 'advancedFilter'>,
    {
      select: useCallback(
        (data: InfiniteData<EventsMetadataAggregateResponse[]>) => {
          return {
            ...data,
            pages: data.pages.map((page: EventsMetadataAggregateResponse[]) => {
              return {
                ...page,
                items: page.filter((eventAggregate) =>
                  !!query
                    ? eventAggregate.value
                        .toLowerCase()
                        .includes(query.toLowerCase())
                    : eventAggregate
                ),
              };
            }),
          };
        },
        [query]
      ),
      ...options,
    }
  ) as UseInfiniteQueryResult<EventsMetadataAggregateResponseItems, unknown>;
};
