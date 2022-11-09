import React, { useState } from 'react';
import { Sequence } from '@cognite/sdk';
import { SearchResultToolbar } from 'containers/SearchResults';
import { ResourceItem, convertResourceType } from 'types';
import { SequenceNewTable } from 'containers/Sequences';

import { RelatedResourceType } from 'hooks/RelatedResourcesHooks';
import { EnsureNonEmptyResource } from 'components';
import { useResourceResults } from '../SearchResultLoader';
import { Loader } from '@cognite/cogs.js';
import { ColumnToggleProps } from 'components/ReactTable';
import {
  InternalSequenceFilters,
  useSequenceSearchResultQuery,
} from 'domain/sequence';
import { AppliedFiltersTags } from 'components/AppliedFiltersTags/AppliedFiltersTags';
import { TableSortBy } from 'components/ReactTable/V2';

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
} & ColumnToggleProps<Sequence>) => {
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
    <EnsureNonEmptyResource api="sequence">
      <SequenceNewTable
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
        data={enableAdvancedFilters ? data : items}
        fetchMore={enableAdvancedFilters ? fetchNextPage : fetchMore}
        hasNextPage={enableAdvancedFilters ? hasNextPage : canFetchMore}
        tableSubHeaders={
          <AppliedFiltersTags filter={filter} onFilterChange={onFilterChange} />
        }
        onRowClick={sequence => onClick(sequence)}
        enableSorting
        onSort={props => {
          setSortBy(props);
        }}
        relatedResourceType={relatedResourceType}
        {...rest}
      />
    </EnsureNonEmptyResource>
  );
};
