import { Sequence } from '@cognite/sdk';
import {
  TableSortBy,
  useSequenceSearchResultQuery,
} from '@data-exploration-lib/domain-layer';
import {
  DefaultPreviewFilter,
  PreviewFilterDropdown,
} from '@data-exploration/components';

import React, { useMemo, useState } from 'react';
import { useDebounce } from 'use-debounce';
import {
  InternalCommonFilters,
  InternalSequenceFilters,
  SequenceWithRelationshipLabels,
  useGetSearchConfigFromLocalStorage,
} from '@data-exploration-lib/core';
import { MetadataFilter } from '../../../Filters';
import { AppliedFiltersTags } from '../AppliedFiltersTags';
import { SequenceTable } from './SequenceTable';

interface Props {
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

  const { data, hasNextPage, fetchNextPage } = useSequenceSearchResultQuery(
    {
      query: debouncedQuery,
      filter: sequenceFilter,
      sortBy,
    },
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
      data={data}
      sorting={sortBy}
      enableSorting
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
      hasNextPage={hasNextPage}
      fetchMore={fetchNextPage}
    />
  );
};
