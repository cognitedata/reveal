import { useState } from 'react';

import { TableProps } from '@data-exploration/components';
import {
  InternalEventsFilters,
  useGetSearchConfigFromLocalStorage,
} from '@data-exploration-lib/core';
import {
  TableSortBy,
  useEventsAggregateCountQuery,
  useEventsSearchResultWithLabelsQuery,
} from '@data-exploration-lib/domain-layer';

import { Asset, CogniteEvent } from '@cognite/sdk';

import { AppliedFiltersTags } from '../AppliedFiltersTags';
import { SearchResultCountLabel } from '../SearchResultCountLabel';
import { SearchResultToolbar } from '../SearchResultToolbar';

import { EventTable } from './EventTable';

export const EventSearchResults = ({
  query = '',
  filter = {},
  onClick,
  id,
  onDirectAssetClick,
  showCount = false,
  selectedRow,
  onFilterChange,
  ...rest
}: {
  query?: string;
  id?: string;
  filter?: InternalEventsFilters;
  showCount?: boolean;
  onClick: (item: CogniteEvent) => void;
  onDirectAssetClick?: (directAsset: Asset, resourceId?: number) => void;
  selectedRow?: Record<string | number, boolean>;
  onFilterChange?: (newValue: Record<string, unknown>) => void;
} & Omit<TableProps<CogniteEvent>, 'data' | 'columns' | 'id'>) => {
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
      id={id || 'event-search-results'}
      query={query}
      selectedRows={selectedRow}
      tableHeaders={
        <SearchResultToolbar
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
      {...rest}
    />
  );
};
