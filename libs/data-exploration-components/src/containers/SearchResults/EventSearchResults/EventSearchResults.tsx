import { useState } from 'react';
import { Asset, CogniteEvent } from '@cognite/sdk';
import {
  SearchResultCountLabel,
  SearchResultToolbar,
  useResourceResults,
} from '../../../containers/SearchResults';
import { convertResourceType } from '../../../types';
import { EventTable } from '../../../containers/Events';

import {
  useEventsAggregateCountQuery,
  useEventsSearchResultWithLabelsQuery,
} from '@data-exploration-lib/domain-layer';
import { TableSortBy } from '../../../components/Table';
import { AppliedFiltersTags } from '../../../components/AppliedFiltersTags/AppliedFiltersTags';
import { useResultCount } from '../../../components';
import { InternalEventsFilters } from '@data-exploration-lib/core';

export const EventSearchResults = ({
  query = '',
  filter = {},
  onClick,
  onDirectAssetClick,
  showCount = false,
  selectedRow,
  enableAdvancedFilters,
  onFilterChange,
}: {
  query?: string;
  filter?: InternalEventsFilters;
  showCount?: boolean;
  enableAdvancedFilters?: boolean;
  onClick: (item: CogniteEvent) => void;
  onDirectAssetClick?: (directAsset: Asset, resourceId?: number) => void;
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
    useEventsSearchResultWithLabelsQuery(
      {
        query,
        eventsFilters: filter,
        eventsSortBy: sortBy,
      },
      { enabled: enableAdvancedFilters }
    );
  const { data: countData } = useEventsAggregateCountQuery(
    {
      eventsFilters: filter,
      query,
    },
    { enabled: enableAdvancedFilters }
  );

  const loadedDataCount = enableAdvancedFilters ? data.length : items.length;
  const totalDataCount = enableAdvancedFilters
    ? countData?.count || 0
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
      onDirectAssetClick={onDirectAssetClick}
    />
  );
};
