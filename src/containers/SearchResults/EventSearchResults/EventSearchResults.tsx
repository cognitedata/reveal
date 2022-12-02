import React, { useState } from 'react';
import { CogniteEvent } from '@cognite/sdk';
import {
  SearchResultCountLabel,
  SearchResultToolbar,
  useResourceResults,
} from 'containers/SearchResults';
import { convertResourceType, ResourceItem } from 'types';
import { EventTable } from 'containers/Events';

import { RelatedResourceType } from 'hooks/RelatedResourcesHooks';

import {
  InternalEventsFilters,
  useEventsSearchResultQuery,
  useEventsSearchAggregateQuery,
} from 'domain/events';
import { TableSortBy } from 'components/Table';
import { AppliedFiltersTags } from 'components/AppliedFiltersTags/AppliedFiltersTags';
import { useResultCount } from 'components';

export const EventSearchResults = ({
  query = '',
  filter = {},
  onClick,
  showCount = false,
  selectedRow,
  enableAdvancedFilters,
  onFilterChange,
}: {
  query?: string;
  filter?: InternalEventsFilters;
  showCount?: boolean;
  showRelatedResources?: boolean;
  relatedResourceType?: RelatedResourceType;
  parentResource?: ResourceItem;
  enableAdvancedFilters?: boolean;
  onClick: (item: CogniteEvent) => void;
  selectedRow?: Record<string | number, boolean>;
  onFilterChange?: (newValue: Record<string, unknown>) => void;
}) => {
  const api = convertResourceType('event');
  const { canFetchMore, fetchMore, isFetched, items } =
    useResourceResults<CogniteEvent>(api, query, filter);
  const { count: itemCount } = useResultCount({
    type: 'event',
    filter,
    query,
    api: query && query.length > 0 ? 'search' : 'list',
  });

  const [sortBy, setSortBy] = useState<TableSortBy[]>([]);
  const { data, isLoading, hasNextPage, fetchNextPage, isPreviousData } =
    useEventsSearchResultQuery(
      {
        query,
        eventsFilters: filter,
        eventsSortBy: sortBy,
      },
      { enabled: enableAdvancedFilters }
    );
  const { data: aggregateData } = useEventsSearchAggregateQuery(
    {
      eventsFilters: filter,
      query,
    },
    { enabled: enableAdvancedFilters }
  );

  const loadedDataCount = enableAdvancedFilters ? data.length : items.length;
  const totalDataCount = enableAdvancedFilters
    ? aggregateData.count
    : itemCount;

  return (
    <EventTable
      id="event-search-results"
      query={query}
      selectedRows={selectedRow}
      tableHeaders={
        <SearchResultToolbar
          type="event"
          showCount={showCount}
          resultCount={
            <SearchResultCountLabel
              loadedCount={loadedDataCount}
              totalCount={totalDataCount}
              resourceType="event"
            />
          }
        />
      }
      tableSubHeaders={
        <AppliedFiltersTags
          filter={filter}
          onFilterChange={onFilterChange}
          icon="Events"
        />
      }
      data={enableAdvancedFilters ? data : items}
      isDataLoading={enableAdvancedFilters ? isLoading : !isFetched}
      enableSorting={enableAdvancedFilters}
      sorting={sortBy}
      onSort={setSortBy}
      fetchMore={enableAdvancedFilters ? fetchNextPage : fetchMore}
      showLoadButton
      hasNextPage={
        enableAdvancedFilters ? !isPreviousData && hasNextPage : canFetchMore
      }
      onRowClick={(event: CogniteEvent) => onClick(event)}
    />
  );
};
