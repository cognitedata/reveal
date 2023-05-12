import { useState } from 'react';
import { Asset, CogniteEvent } from '@cognite/sdk';
import {
  SearchResultCountLabel,
  SearchResultToolbar,
} from '../../../containers/SearchResults';
import { EventTable } from '../../Events';

import {
  TableSortBy,
  useEventsAggregateCountQuery,
  useEventsSearchResultWithLabelsQuery,
} from '@data-exploration-lib/domain-layer';
import { AppliedFiltersTags } from '../../../components/AppliedFiltersTags/AppliedFiltersTags';
import {
  InternalEventsFilters,
  useGetSearchConfigFromLocalStorage,
} from '@data-exploration-lib/core';

export const EventSearchResults = ({
  query = '',
  filter = {},
  onClick,
  onDirectAssetClick,
  showCount = false,
  selectedRow,
  onFilterChange,
}: {
  query?: string;
  filter?: InternalEventsFilters;
  showCount?: boolean;
  onClick: (item: CogniteEvent) => void;
  onDirectAssetClick?: (directAsset: Asset, resourceId?: number) => void;
  selectedRow?: Record<string | number, boolean>;
  onFilterChange?: (newValue: Record<string, unknown>) => void;
}) => {
  const eventSearchConfig = useGetSearchConfigFromLocalStorage('event');

  const [sortBy, setSortBy] = useState<TableSortBy[]>([]);
  const { data, isLoading, hasNextPage, fetchNextPage, isPreviousData } =
    useEventsSearchResultWithLabelsQuery(
      {
        query,
        eventsFilters: filter,
        eventsSortBy: sortBy,
      },
      eventSearchConfig
    );
  const { data: countData } = useEventsAggregateCountQuery(
    {
      eventsFilters: filter,
      query,
    },
    eventSearchConfig
  );

  const loadedDataCount = data.length;
  const totalDataCount = countData?.count || 0;

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
      data={data}
      isDataLoading={isLoading}
      enableSorting
      sorting={sortBy}
      onSort={setSortBy}
      fetchMore={fetchNextPage}
      showLoadButton
      hasNextPage={!isPreviousData && hasNextPage}
      onRowClick={(event: CogniteEvent) => onClick(event)}
      onDirectAssetClick={onDirectAssetClick}
    />
  );
};
