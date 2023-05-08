import { Sequence } from '@cognite/sdk';
import { AppliedFiltersTags } from '@data-exploration-components/components/AppliedFiltersTags/AppliedFiltersTags';
import { TableSortBy } from '@data-exploration-lib/domain-layer';

import React, { useMemo, useState } from 'react';
import { PreviewFilterDropdown } from '@data-exploration-components/components/PreviewFilter/PreviewFilterDropdown';
import { DefaultPreviewFilter } from '@data-exploration-components/components/PreviewFilter/PreviewFilter';
import { useSequenceSearchResultQuery } from '@data-exploration-lib/domain-layer';
import {
  SequenceTable,
  useResourceResults,
} from '@data-exploration-components/containers';
import { convertResourceType } from '@data-exploration-components/types';
import { useDebounce } from 'use-debounce';
import {
  InternalCommonFilters,
  InternalSequenceFilters,
  SequenceWithRelationshipLabels,
  useGetSearchConfigFromLocalStorage,
} from '@data-exploration-lib/core';
import { MetadataFilter } from '@data-exploration/containers';

interface Props {
  enableAdvancedFilter?: boolean;
  defaultFilter: InternalCommonFilters;
  onClick: (item: Sequence | SequenceWithRelationshipLabels) => void;
  onParentAssetClick: (assetId: number) => void;
}

const LinkedSequenceFilter = ({
  filter,
  onFilterChange,
}: {
  filter: InternalSequenceFilters;
  onFilterChange: (newValue: InternalSequenceFilters) => void;
}) => {
  return (
    <PreviewFilterDropdown>
      <MetadataFilter.Sequences
        filter={filter}
        values={filter.metadata}
        onChange={(newMetadata) => {
          onFilterChange({ metadata: newMetadata });
        }}
      />
    </PreviewFilterDropdown>
  );
};

export const SequenceLinkedSearchResults: React.FC<Props> = ({
  enableAdvancedFilter,
  defaultFilter,
  onClick,
  onParentAssetClick,
}) => {
  const [query, setQuery] = useState<string | undefined>();
  const [debouncedQuery] = useDebounce(query, 300);
  const [filter, setFilter] = useState<InternalSequenceFilters>({});
  const [sortBy, setSortBy] = useState<TableSortBy[]>([]);
  const sequenceSearchConfig = useGetSearchConfigFromLocalStorage('sequence');

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
    { enabled: enableAdvancedFilter },
    sequenceSearchConfig
  );

  const appliedFilters = { ...filter, assetSubtreeIds: undefined };

  const handleFilterChange = (newValue: InternalSequenceFilters) => {
    setFilter((prevState) => ({ ...prevState, ...newValue }));
  };

  return (
    <SequenceTable
      id="sequence-linked-search-results"
      query={debouncedQuery}
      onRowClick={(sequence) => onClick(sequence)}
      onRootAssetClick={(directAsset) => {
        onParentAssetClick(directAsset.id);
      }}
      data={enableAdvancedFilter ? data : items}
      sorting={sortBy}
      enableSorting={enableAdvancedFilter}
      onSort={(props) => setSortBy(props)}
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
