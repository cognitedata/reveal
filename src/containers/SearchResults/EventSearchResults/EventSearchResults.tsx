import React, { useState } from 'react';
import { CogniteEvent } from '@cognite/sdk';
import {
  SearchResultToolbar,
  useResourceResults,
} from 'containers/SearchResults';
import { convertResourceType, ResourceItem } from 'types';
import { EventNewTable } from 'containers/Events';

import { RelatedResourceType } from 'hooks/RelatedResourcesHooks';
import { EnsureNonEmptyResource } from 'components';
import { Loader } from '@cognite/cogs.js';
import { ColumnToggleProps } from 'components/ReactTable';
import { useEventsSearchResultQuery } from 'domain/events/internal/queries/useEventsSearchResultQuery';
import { InternalEventsFilters } from 'domain/events';
import { TableSortBy } from 'components/ReactTable/V2';

export const EventSearchResults = ({
  query = '',
  filter = {},
  onClick,
  count,
  showCount = false,
  enableAdvancedFilters,
}: {
  query?: string;
  filter?: InternalEventsFilters;
  showCount?: boolean;
  showRelatedResources?: boolean;
  relatedResourceType?: RelatedResourceType;
  parentResource?: ResourceItem;
  count?: number;
  enableAdvancedFilters?: boolean;
  onClick: (item: CogniteEvent) => void;
} & ColumnToggleProps<CogniteEvent>) => {
  const api = convertResourceType('event');
  const { canFetchMore, fetchMore, isFetched, items } =
    useResourceResults<CogniteEvent>(api, query, filter);

  const [sortBy, setSortBy] = useState<TableSortBy[]>([]);
  const { data, isLoading, hasNextPage, fetchNextPage } =
    useEventsSearchResultQuery({
      query,
      eventsFilters: filter,
      eventsSortBy: sortBy,
    });

  const loading = enableAdvancedFilters ? isLoading : !isFetched;
  if (loading) {
    return <Loader />;
  }

  return (
    <EnsureNonEmptyResource api="event">
      <EventNewTable
        id="event-search-results"
        tableHeaders={
          <SearchResultToolbar
            api={query.length > 0 ? 'search' : 'list'}
            type="event"
            filter={filter}
            showCount={showCount}
            query={query}
            count={count}
          />
        }
        data={enableAdvancedFilters ? data : items}
        enableSorting
        onSort={props => {
          setSortBy(props);
        }}
        fetchMore={enableAdvancedFilters ? fetchNextPage : fetchMore}
        showLoadButton
        hasNextPage={enableAdvancedFilters ? hasNextPage : canFetchMore}
        onRowClick={(event: CogniteEvent) => onClick(event)}
      />
    </EnsureNonEmptyResource>
  );
};
