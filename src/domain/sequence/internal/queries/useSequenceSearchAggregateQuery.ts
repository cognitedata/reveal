import { useMemo } from 'react';
import {
  InternalSequenceFilters,
  mapFiltersToSequenceAdvancedFilters,
  mapInternalFilterToSequenceFilter,
  // useSequenceSearchQueryMetadataKeysQuery,
  useSequenceAggregateQuery,
} from 'domain/sequence';
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
  // const searchQueryMetadataKeys = useSequenceSearchQueryMetadataKeysQuery(
  //   query,
  //   filter
  // );

  const advancedFilter = useMemo(
    () =>
      mapFiltersToSequenceAdvancedFilters(
        filter,
        // searchQueryMetadataKeys,
        query
      ),
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
      keepPreviousData: true,
    }
  );
};
