import React from 'react';
import { Sequence } from '@cognite/sdk';
import { SearchResultToolbar } from 'containers/SearchResults';
import { ResourceItem, convertResourceType } from 'types';
import { SequenceNewTable } from 'containers/Sequences';

import { RelatedResourceType } from 'hooks/RelatedResourcesHooks';
import { EnsureNonEmptyResource } from 'components';
import { useResourceResults } from '../SearchResultLoader';
import { Loader } from '@cognite/cogs.js';
import { ColumnToggleProps } from 'components/ReactTable';
import { InternalSequenceFilters } from 'domain/sequence';
import { AppliedFiltersTags } from 'components/AppliedFiltersTags/AppliedFiltersTags';

export const SequenceSearchResults = ({
  query = '',
  filter = {},
  relatedResourceType,
  onFilterChange,
  count,
  onClick,
  showCount = false,
  ...rest
}: {
  query?: string;
  filter?: InternalSequenceFilters;
  showRelatedResources?: boolean;
  relatedResourceType?: RelatedResourceType;
  parentResource?: ResourceItem;
  count?: number;
  showCount?: boolean;
  onClick: (item: Sequence) => void;
  onFilterChange?: (newValue: Record<string, unknown>) => void;
} & ColumnToggleProps<Sequence>) => {
  const api = convertResourceType('sequence');
  const { canFetchMore, fetchMore, isFetched, items } =
    useResourceResults<Sequence>(api, query, filter);

  if (!isFetched) {
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
        tableSubHeaders={
          <AppliedFiltersTags filter={filter} onFilterChange={onFilterChange} />
        }
        data={items}
        fetchMore={fetchMore}
        hasNextPage={canFetchMore}
        onRowClick={sequence => onClick(sequence)}
        relatedResourceType={relatedResourceType}
        {...rest}
      />
    </EnsureNonEmptyResource>
  );
};
