import { useCallback } from 'react';

import { InfiniteData, UseInfiniteQueryResult } from '@tanstack/react-query';

import { InternalThreeDFilters } from '@data-exploration-lib/core';

import {
  EventsAggregateFilters,
  EventsMetadataAggregateResponse,
  EventsMetadataAggregateResponseItems,
  useEventsAdvancedMetadataValuesAggregateQuery,
} from '../../../events';

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
                items: page
                  .map((eventAggregate) => {
                    const value = eventAggregate.values[0].trim();
                    return {
                      type: 'img360',
                      siteId: value,
                      name: value,
                    };
                  })
                  .filter((image360) =>
                    !!query
                      ? image360.name
                          .toLowerCase()
                          .includes(query.toLowerCase())
                      : image360
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
