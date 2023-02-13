import { TableSortBy } from '../../../types';
import { InternalEventsFilters } from '../types';
import { useEventsSearchResultQuery } from './useEventsSearchResultQuery';
import { UseInfiniteQueryOptions } from 'react-query';
import { useDeepMemo } from '@data-exploration-lib/core';
import { extractMatchingLabels } from '../../../utils/extractMatchingLabels';

export const useEventsSearchResultWithLabelsQuery = (
  {
    query,
    eventsFilters = {},
    eventsSortBy,
  }: {
    query?: string;
    eventsFilters: InternalEventsFilters;
    eventsSortBy?: TableSortBy[];
  },
  options?: UseInfiniteQueryOptions
) => {
  const { data, ...rest } = useEventsSearchResultQuery(
    { query, eventsFilters, eventsSortBy },
    options
  );

  const mappedData = useDeepMemo(() => {
    if (data && query) {
      return data.map((event) => {
        return {
          ...event,
          matchingLabels: extractMatchingLabels(event, query, [
            {
              key: 'id',
              label: 'ID',
            },
            {
              key: 'externalId',
              label: 'External ID',
            },
            {
              key: 'description',
              useSubstringMatch: true,
            },
            'metadata',
            'source',
            'type',
            'subtype',
          ]),
        };
      });
    }

    return data;
  }, [data, query]);

  return { data: mappedData, ...rest };
};
