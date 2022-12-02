import { Sequence } from '@cognite/sdk';
import { useList } from '@cognite/sdk-react-query-hooks';
import { MetadataFilterV2, TableSortBy } from 'components';
import { AppliedFiltersTags } from 'components/AppliedFiltersTags/AppliedFiltersTags';
import { transformNewFilterToOldFilter } from 'domain/transformers';

import React, { useMemo, useState } from 'react';
import { PreviewFilterDropdown } from 'components/PreviewFilter/PreviewFilterDropdown';
import { DefaultPreviewFilter } from 'components/PreviewFilter/PreviewFilter';
import { InternalCommonFilters } from 'domain/types';
import {
  InternalSequenceFilters,
  useSequenceSearchResultQuery,
} from 'domain/sequence';
import {
  SequenceTable,
  SequenceWithRelationshipLabels,
  useResourceResults,
} from 'containers';
import { convertResourceType } from 'types';
import { useDebounce } from 'use-debounce';

interface Props {
  enableAdvancedFilter?: boolean;
  defaultFilter: InternalCommonFilters;
  onClick: (item: Sequence | SequenceWithRelationshipLabels) => void;
}

const LinkedSequenceFilter = ({
  filter,
  onFilterChange,
}: {
  filter: InternalSequenceFilters;
  onFilterChange: (newValue: InternalSequenceFilters) => void;
}) => {
  const { data: items = [] } = useList('sequences', {
    filter: transformNewFilterToOldFilter(filter),
    limit: 1000,
  });

  return (
    <PreviewFilterDropdown>
      <MetadataFilterV2
        items={items}
        value={filter.metadata}
        setValue={newValue => onFilterChange({ metadata: newValue })}
      />
    </PreviewFilterDropdown>
  );
};

export const SequenceLinkedSearchResults: React.FC<Props> = ({
  enableAdvancedFilter,
  defaultFilter,
  onClick,
}) => {
  const [query, setQuery] = useState<string | undefined>();
  const [debouncedQuery] = useDebounce(query, 300);
  const [filter, setFilter] = useState<InternalSequenceFilters>({});
  const [sortBy, setSortBy] = useState<TableSortBy[]>([]);

  const sequenceFilter = useMemo(() => {
    return {
      ...filter,
      ...defaultFilter,
    };
  }, [filter, defaultFilter]);

  const api = convertResourceType('sequence');
  const { canFetchMore, fetchMore, items } = useResourceResults<Sequence>(
    api,
    debouncedQuery,
    sequenceFilter
  );

  const { data, hasNextPage, fetchNextPage } = useSequenceSearchResultQuery(
    {
      query: debouncedQuery,
      filter: sequenceFilter,
      sortBy,
    },
    { enabled: enableAdvancedFilter }
  );

  const appliedFilters = { ...filter, assetSubtreeIds: undefined };

  const handleFilterChange = (newValue: InternalSequenceFilters) => {
    setFilter(prevState => ({ ...prevState, ...newValue }));
  };

  return (
    <SequenceTable
      id="sequence-linked-search-results"
      query={debouncedQuery}
      onRowClick={sequence => onClick(sequence)}
      data={enableAdvancedFilter ? data : items}
      sorting={sortBy}
      enableSorting={enableAdvancedFilter}
      onSort={props => setSortBy(props)}
      showLoadButton
      tableSubHeaders={
        <AppliedFiltersTags
          filter={appliedFilters}
          onFilterChange={handleFilterChange}
        />
      }
      tableHeaders={
        <DefaultPreviewFilter query={query} onQueryChange={setQuery}>
          <LinkedSequenceFilter
            filter={sequenceFilter}
            onFilterChange={handleFilterChange}
          />
        </DefaultPreviewFilter>
      }
      hasNextPage={enableAdvancedFilter ? hasNextPage : canFetchMore}
      fetchMore={enableAdvancedFilter ? fetchNextPage : fetchMore}
    />
  );
};
