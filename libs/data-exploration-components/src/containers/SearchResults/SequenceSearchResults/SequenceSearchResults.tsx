import React, { useState } from 'react';
import { Asset, Sequence } from '@cognite/sdk';
import {
  SearchResultCountLabel,
  SearchResultToolbar,
} from '@data-exploration-components/containers/SearchResults';
import {
  ResourceItem,
  convertResourceType,
} from '@data-exploration-components/types';
import { SequenceTable } from '@data-exploration-components/containers/Sequences';

import { RelatedResourceType } from '@data-exploration-components/hooks/RelatedResourcesHooks';
import { useResourceResults } from '../SearchResultLoader';
import {
  useSequenceSearchAggregateQuery,
  useSequenceSearchResultWithMatchingLabelsQuery,
} from '@data-exploration-lib/domain-layer';
import { AppliedFiltersTags } from '@data-exploration-components/components/AppliedFiltersTags/AppliedFiltersTags';
import { TableSortBy } from '@data-exploration-components/components/Table';
import { useResultCount } from '@data-exploration-components/components';
import {
  InternalSequenceFilters,
  useGetSearchConfigFromLocalStorage,
} from '@data-exploration-lib/core';

export const SequenceSearchResults = ({
  query = '',
  filter = {},
  relatedResourceType,
  onFilterChange,
  onClick,
  onRootAssetClick,
  showCount = false,
  enableAdvancedFilters,
  selectedRow,
  ...rest
}: {
  query?: string;
  filter?: InternalSequenceFilters;
  showRelatedResources?: boolean;
  relatedResourceType?: RelatedResourceType;
  parentResource?: ResourceItem;
  showCount?: boolean;
  enableAdvancedFilters?: boolean;
  onClick: (item: Sequence) => void;
  onRootAssetClick?: (rootAsset: Asset, resourceId?: number) => void;
  onFilterChange?: (newValue: Record<string, unknown>) => void;
  selectedRow?: Record<string | number, boolean>;
}) => {
  const api = convertResourceType('sequence');
  const { canFetchMore, fetchMore, isFetched, items } =
    useResourceResults<Sequence>(api, query, filter);
  const { count: itemCount } = useResultCount({
    type: 'sequence',
    filter,
    query,
    api: query && query.length > 0 ? 'search' : 'list',
  });
  const sequenceSearchConfig = useGetSearchConfigFromLocalStorage('sequence');

  const [sortBy, setSortBy] = useState<TableSortBy[]>([]);
  const { data, isLoading, isPreviousData, hasNextPage, fetchNextPage } =
    useSequenceSearchResultWithMatchingLabelsQuery(
      {
        query,
        filter,
        sortBy,
      },
      { enabled: enableAdvancedFilters },
      sequenceSearchConfig
    );

  const { data: aggregateData } = useSequenceSearchAggregateQuery(
    {
      query,
      filter,
    },
    { enabled: enableAdvancedFilters },
    sequenceSearchConfig
  );

  const loadedDataCount = enableAdvancedFilters ? data.length : items.length;
  const totalDataCount = enableAdvancedFilters
    ? aggregateData.count
    : itemCount;
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
      data={enableAdvancedFilters ? data : items}
      isDataLoading={enableAdvancedFilters ? isLoading : !isFetched}
      fetchMore={enableAdvancedFilters ? fetchNextPage : fetchMore}
      hasNextPage={
        enableAdvancedFilters ? !isPreviousData && hasNextPage : canFetchMore
      }
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
      enableSorting={enableAdvancedFilters}
      onSort={setSortBy}
      relatedResourceType={relatedResourceType}
      {...rest}
    />
  );
};
