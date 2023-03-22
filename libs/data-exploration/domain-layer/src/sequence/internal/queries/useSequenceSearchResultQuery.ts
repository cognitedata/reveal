import { useMemo } from 'react';
import { DEFAULT_GLOBAL_TABLE_RESULT_LIMIT } from '@data-exploration-lib/domain-layer';
import { TableSortBy } from '@data-exploration-lib/domain-layer';

import {
  mapFiltersToSequenceAdvancedFilters,
  mapInternalFilterToSequenceFilter,
  mapTableSortByToSequenceSortFields,
  useSequenceListQuery,
} from '@data-exploration-lib/domain-layer';
import { UseInfiniteQueryOptions } from 'react-query';
import { InternalSequenceFilters } from '@data-exploration-lib/core';

export const useSequenceSearchResultQuery = (
  {
    query,
    filter,
    sortBy,
  }: {
    query?: string;
    filter: InternalSequenceFilters;
    sortBy?: TableSortBy[];
  },
  options?: UseInfiniteQueryOptions
) => {
  const advancedFilter = useMemo(
    () => mapFiltersToSequenceAdvancedFilters(filter, query),
    [filter, query]
  );

  const sequenceFilter = useMemo(
    () => mapInternalFilterToSequenceFilter(filter),
    [filter]
  );

  const sequenceSort = useMemo(
    () => mapTableSortByToSequenceSortFields(sortBy),
    [sortBy]
  );

  return useSequenceListQuery(
    {
      advancedFilter,
      filter: sequenceFilter,
      sort: sequenceSort,
      limit: DEFAULT_GLOBAL_TABLE_RESULT_LIMIT,
    },
    {
      ...options,
      keepPreviousData: true,
    }
  );
};
