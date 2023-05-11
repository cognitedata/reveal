import React, { useState } from 'react';
import { Asset, Sequence } from '@cognite/sdk';
import {
  SearchResultCountLabel,
  SearchResultToolbar,
} from '@data-exploration-components/containers/SearchResults';
import { SequenceTable } from '@data-exploration-components/containers/Sequences';

import {
  TableSortBy,
  useSequenceSearchAggregateQuery,
  useSequenceSearchResultWithMatchingLabelsQuery,
} from '@data-exploration-lib/domain-layer';
import { AppliedFiltersTags } from '@data-exploration-components/components/AppliedFiltersTags/AppliedFiltersTags';
import {
  EMPTY_OBJECT,
  InternalSequenceFilters,
  useGetSearchConfigFromLocalStorage,
} from '@data-exploration-lib/core';

export const SequenceSearchResults = ({
  query = '',
  filter = EMPTY_OBJECT,
  onFilterChange,
  onClick,
  onRootAssetClick,
  showCount = false,
  selectedRow,
}: {
  query?: string;
  filter?: InternalSequenceFilters;
  showCount?: boolean;
  onClick: (item: Sequence) => void;
  onRootAssetClick?: (rootAsset: Asset, resourceId?: number) => void;
  onFilterChange?: (newValue: Record<string, unknown>) => void;
  selectedRow?: Record<string | number, boolean>;
}) => {
  const sequenceSearchConfig = useGetSearchConfigFromLocalStorage('sequence');

  const [sortBy, setSortBy] = useState<TableSortBy[]>([]);
  const { data, isLoading, isPreviousData, hasNextPage, fetchNextPage } =
    useSequenceSearchResultWithMatchingLabelsQuery(
      {
        query,
        filter,
        sortBy,
      },
      sequenceSearchConfig
    );

  const { data: aggregateData } = useSequenceSearchAggregateQuery(
    {
      query,
      filter,
    },
    sequenceSearchConfig
  );

  const loadedDataCount = data.length;
  const totalDataCount = aggregateData.count;

  return (
    <SequenceTable
      id="sequence-search-results"
      query={query}
      selectedRows={selectedRow}
      tableHeaders={
        <SearchResultToolbar
          type="sequence"
          showCount={showCount}
          resultCount={
            <SearchResultCountLabel
              loadedCount={loadedDataCount}
              totalCount={totalDataCount}
              resourceType="sequence"
            />
          }
        />
      }
      sorting={sortBy}
      data={data}
      isDataLoading={isLoading}
      fetchMore={fetchNextPage}
      hasNextPage={!isPreviousData && hasNextPage}
      tableSubHeaders={
        <AppliedFiltersTags
          filter={filter}
          onFilterChange={onFilterChange}
          icon="Sequences"
        />
      }
      showLoadButton
      onRowClick={(sequence) => onClick(sequence)}
      onRootAssetClick={onRootAssetClick}
      enableSorting
      onSort={setSortBy}
    />
  );
};
