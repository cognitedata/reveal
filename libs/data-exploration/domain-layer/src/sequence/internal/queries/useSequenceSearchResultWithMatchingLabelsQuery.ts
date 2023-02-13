import { EMPTY_OBJECT, useDeepMemo } from '@data-exploration-lib/core';
import { UseInfiniteQueryOptions } from 'react-query';
import { TableSortBy } from '../../../types';
import { extractMatchingLabels } from '../../../utils/extractMatchingLabels';
import { InternalSequenceFilters } from '../types';
import { useSequenceSearchResultQuery } from './useSequenceSearchResultQuery';

export const useSequenceSearchResultWithMatchingLabelsQuery = (
  {
    query,
    filter = EMPTY_OBJECT,
    sortBy,
  }: {
    query?: string;
    filter: InternalSequenceFilters;
    sortBy?: TableSortBy[];
  },
  options?: UseInfiniteQueryOptions
) => {
  const { data, ...rest } = useSequenceSearchResultQuery(
    { query, filter, sortBy },
    options
  );

  const mappedData = useDeepMemo(() => {
    if (data && query) {
      return data.map((sequence) => {
        return {
          ...sequence,
          matchingLabels: extractMatchingLabels(sequence, query, [
            {
              key: 'id',
              label: 'ID',
            },
            'name',
            'description',
            'metadata',
            {
              key: 'externalId',
              label: 'External ID',
            },
          ]),
        };
      });
    }

    return data;
  }, [data, query]);

  return { data: mappedData, ...rest };
};
