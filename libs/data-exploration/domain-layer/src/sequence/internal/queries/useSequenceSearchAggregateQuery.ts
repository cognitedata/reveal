import { useMemo } from 'react';
import {
  InternalSequenceFilters,
  mapFiltersToSequenceAdvancedFilters,
  mapInternalFilterToSequenceFilter,
  useSequenceAggregateQuery,
} from '@data-exploration-lib/domain-layer';
import { UseQueryOptions } from 'react-query';

export const useSequenceSearchAggregateQuery = (
  {
    query,
    filter,
  }: {
    query?: string;
    filter: InternalSequenceFilters;
  },
  options?: UseQueryOptions
) => {
  const advancedFilter = useMemo(
    () => mapFiltersToSequenceAdvancedFilters(filter, query),
    [filter, query]
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
