import { useMemo } from 'react';

import { UseQueryOptions } from '@tanstack/react-query';

import {
  InternalSequenceFilters,
  SequenceConfigType,
} from '@data-exploration-lib/core';

import { useSequenceAggregateQuery } from '../../service';
import {
  mapFiltersToSequenceAdvancedFilters,
  mapInternalFilterToSequenceFilter,
} from '../transformers';

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
