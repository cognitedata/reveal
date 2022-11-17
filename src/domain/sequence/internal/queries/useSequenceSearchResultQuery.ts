import { useMemo } from 'react';
import { DEFAULT_GLOBAL_TABLE_RESULT_LIMIT } from 'domain/constants';
import { TableSortBy } from 'components/Table';

import {
  InternalSequenceFilters,
  mapFiltersToSequenceAdvancedFilters,
  mapInternalFilterToSequenceFilter,
  mapTableSortByToSequenceSortFields,
  useSequenceListQuery,
  useSequenceSearchQueryMetadataKeysQuery,
} from 'domain/sequence';

export const useSequenceSearchResultQuery = ({
  query,
  filter,
  sortBy,
}: {
  query?: string;
  filter: InternalSequenceFilters;
  sortBy?: TableSortBy[];
}) => {
  const searchQueryMetadataKeys = useSequenceSearchQueryMetadataKeysQuery(
    query,
    filter
  );

  const advancedFilter = useMemo(
    () =>
      mapFiltersToSequenceAdvancedFilters(
        filter,
        searchQueryMetadataKeys,
        query
      ),
    [filter, searchQueryMetadataKeys, query]
  );

  const sequenceFilter = useMemo(
    () => mapInternalFilterToSequenceFilter(filter),
    [filter]
  );

  const sequenceSort = useMemo(
    () => mapTableSortByToSequenceSortFields(sortBy),
    [sortBy]
  );

  return useSequenceListQuery({
    advancedFilter,
    filter: sequenceFilter,
    sort: sequenceSort,
    limit: DEFAULT_GLOBAL_TABLE_RESULT_LIMIT,
  });
};
