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

export const EventSearchResults = ({
  query = '',
  filter = {},
  onClick,
  showCount = false,
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
  onFilterChange?: (newValue: Record<string, unknown>) => void;
}) => {
  const api = convertResourceType('event');
  const { canFetchMore, fetchMore, isFetched, items } =
    useResourceResults<CogniteEvent>(api, query, filter);

  const [sortBy, setSortBy] = useState<TableSortBy[]>([]);
  const { data, isLoading, hasNextPage, fetchNextPage, isPreviousData } =
    useEventsSearchResultQuery({
      query,
      eventsFilters: filter,
      eventsSortBy: sortBy,
    });
  const { data: aggregateData } = useEventsSearchAggregateQuery({
    eventsFilters: filter,
    query,
  });
  const loadedDataCount = enableAdvancedFilters ? data.length : items.length;

  return (
    <EventTable
      id="event-search-results"
      query={query}
      tableHeaders={
        <SearchResultToolbar
          type="event"
          showCount={showCount}
          resultCount={
            <SearchResultCountLabel
              loadedCount={loadedDataCount}
              totalCount={aggregateData.count}
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
      enableSorting
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
