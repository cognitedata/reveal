import { useMemo } from 'react';
import { DEFAULT_GLOBAL_TABLE_RESULT_LIMIT } from 'domain/constants';
import { TableSortBy } from 'components/ReactTable/V2';

import {
  InternalSequenceFilters,
  mapInternalFilterToSequenceFilter,
  mapTableSortByToSequenceSortFields,
  useSequenceListQuery,
} from 'domain/sequence';

export const useSequenceSearchResultQuery = ({
  filter,
  sortBy,
}: {
  query?: string;
  filter: InternalSequenceFilters;
  sortBy?: TableSortBy[];
}) => {
  const sequenceFilter = useMemo(
    () => mapInternalFilterToSequenceFilter(filter),
    [filter]
  );

  const sequenceSort = useMemo(
    () => mapTableSortByToSequenceSortFields(sortBy),
    [sortBy]
  );

  return useSequenceListQuery({
    filter: sequenceFilter,
    sort: sequenceSort,
    limit: DEFAULT_GLOBAL_TABLE_RESULT_LIMIT,
  });
};
