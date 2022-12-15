import React, { useState } from 'react';
import { Sequence } from '@cognite/sdk';
import {
  SearchResultCountLabel,
  SearchResultToolbar,
} from 'containers/SearchResults';
import { ResourceItem, convertResourceType } from 'types';
import { SequenceTable } from 'containers/Sequences';

import { RelatedResourceType } from 'hooks/RelatedResourcesHooks';
import { useResourceResults } from '../SearchResultLoader';
import {
  InternalSequenceFilters,
  useSequenceSearchAggregateQuery,
  useSequenceSearchResultQuery,
} from 'domain/sequence';
import { AppliedFiltersTags } from 'components/AppliedFiltersTags/AppliedFiltersTags';
import { TableSortBy } from 'components/Table';
import { useResultCount } from 'components';

export const SequenceSearchResults = ({
  query = '',
  filter = {},
  relatedResourceType,
  onFilterChange,
  onClick,
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

  const [sortBy, setSortBy] = useState<TableSortBy[]>([]);
  const { data, isLoading, isPreviousData, hasNextPage, fetchNextPage } =
    useSequenceSearchResultQuery(
      {
        query,
        filter,
        sortBy,
      },
      { enabled: enableAdvancedFilters }
    );

  const { data: aggregateData } = useSequenceSearchAggregateQuery(
    {
      query,
      filter,
    },
    { enabled: enableAdvancedFilters }
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
      onRowClick={sequence => onClick(sequence)}
      enableSorting={enableAdvancedFilters}
      onSort={setSortBy}
      relatedResourceType={relatedResourceType}
      {...rest}
    />
  );
};
