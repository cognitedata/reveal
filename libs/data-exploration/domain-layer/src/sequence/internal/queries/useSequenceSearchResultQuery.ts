import { useMemo } from 'react';

import { UseInfiniteQueryOptions } from '@tanstack/react-query';

import {
  InternalSequenceFilters,
  SequenceConfigType,
} from '@data-exploration-lib/core';

import { DEFAULT_GLOBAL_TABLE_RESULT_LIMIT } from '../../../constants';
import { TableSortBy } from '../../../types';
import { useSequenceListQuery } from '../../service';
import {
  mapFiltersToSequenceAdvancedFilters,
  mapInternalFilterToSequenceFilter,
  mapTableSortByToSequenceSortFields,
} from '../transformers';

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
  searchConfig?: SequenceConfigType,
  options?: UseInfiniteQueryOptions
) => {
  const advancedFilter = useMemo(
    () => mapFiltersToSequenceAdvancedFilters(filter, query, searchConfig),
    [filter, query, searchConfig]
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
