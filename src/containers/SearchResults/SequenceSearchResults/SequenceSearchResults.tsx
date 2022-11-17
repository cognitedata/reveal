import React, { useState } from 'react';
import { Sequence } from '@cognite/sdk';
import { SearchResultToolbar } from 'containers/SearchResults';
import { ResourceItem, convertResourceType } from 'types';
import { SequenceTable } from 'containers/Sequences';

import { RelatedResourceType } from 'hooks/RelatedResourcesHooks';
import { useResourceResults } from '../SearchResultLoader';
import { Loader } from '@cognite/cogs.js';
import {
  InternalSequenceFilters,
  useSequenceSearchResultQuery,
} from 'domain/sequence';
import { AppliedFiltersTags } from 'components/AppliedFiltersTags/AppliedFiltersTags';
import { TableSortBy } from 'components/Table';

export const SequenceSearchResults = ({
  query = '',
  filter = {},
  relatedResourceType,
  onFilterChange,
  count,
  onClick,
  showCount = false,
  enableAdvancedFilters,
  ...rest
}: {
  query?: string;
  filter?: InternalSequenceFilters;
  showRelatedResources?: boolean;
  relatedResourceType?: RelatedResourceType;
  parentResource?: ResourceItem;
  count?: number;
  showCount?: boolean;
  enableAdvancedFilters?: boolean;
  onClick: (item: Sequence) => void;
  onFilterChange?: (newValue: Record<string, unknown>) => void;
}) => {
  const api = convertResourceType('sequence');
  const { canFetchMore, fetchMore, isFetched, items } =
    useResourceResults<Sequence>(api, query, filter);

  const [sortBy, setSortBy] = useState<TableSortBy[]>([]);
  const { data, isLoading, hasNextPage, fetchNextPage } =
    useSequenceSearchResultQuery({
      query,
      filter,
      sortBy,
    });

  const loading = enableAdvancedFilters ? isLoading : !isFetched;

  if (loading) {
    return <Loader />;
  }
  return (
    <SequenceTable
      id="sequence-search-results"
      tableHeaders={
        <SearchResultToolbar
          api={query.length > 0 ? 'search' : 'list'}
          type="sequence"
          filter={filter}
          showCount={showCount}
          query={query}
          count={count}
        />
      }
      sorting={sortBy}
      data={enableAdvancedFilters ? data : items}
      fetchMore={enableAdvancedFilters ? fetchNextPage : fetchMore}
      hasNextPage={enableAdvancedFilters ? hasNextPage : canFetchMore}
      tableSubHeaders={
        <AppliedFiltersTags
          filter={filter}
          onFilterChange={onFilterChange}
          icon="Sequences"
        />
      }
      showLoadButton
      onRowClick={sequence => onClick(sequence)}
      enableSorting
      onSort={setSortBy}
      relatedResourceType={relatedResourceType}
      {...rest}
    />
  );
};
