import { useMemo } from 'react';
import {
  mapFiltersToSequenceAdvancedFilters,
  mapInternalFilterToSequenceFilter,
  useSequenceAggregateQuery,
} from '@data-exploration-lib/domain-layer';
import { UseQueryOptions } from '@tanstack/react-query';
import {
  InternalSequenceFilters,
  SequenceConfigType,
} from '@data-exploration-lib/core';

export const useSequenceSearchAggregateQuery = (
  {
    query,
    filter,
  }: {
    query?: string;
    filter: InternalSequenceFilters;
  },
  searchConfig?: SequenceConfigType,
  options?: UseQueryOptions
) => {
  const advancedFilter = useMemo(
    () => mapFiltersToSequenceAdvancedFilters(filter, query, searchConfig),
    [filter, query, searchConfig]
  );

  const sequenceFilter = useMemo(
    () => mapInternalFilterToSequenceFilter(filter),
    [filter]
  );

  return useSequenceAggregateQuery(
    {
      filter: sequenceFilter,
      advancedFilter,
    },
    {
      ...options,
    }
  );
};
