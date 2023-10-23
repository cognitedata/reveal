import React, { useMemo, useState } from 'react';

import { DefaultPreviewFilter } from '@data-exploration/components';
import { useDebounce } from 'use-debounce';

import { CogniteEvent } from '@cognite/sdk';

import {
  InternalCommonFilters,
  InternalEventsFilters,
  useGetSearchConfigFromLocalStorage,
} from '@data-exploration-lib/core';
import {
  TableSortBy,
  useEventsSearchResultQuery,
} from '@data-exploration-lib/domain-layer';

import { AppliedFiltersTags } from '../AppliedFiltersTags';

import { EventTable } from './EventTable';
import { EventTableFilters } from './EventTableFilters';

interface Props {
  defaultFilter: InternalCommonFilters;
  onClick: (item: CogniteEvent) => void;
  onParentAssetClick: (assetId: number) => void;
}

export const EventLinkedSearchResults: React.FC<Props> = ({
  defaultFilter,
  onClick,
  onParentAssetClick,
}) => {
  const [query, setQuery] = useState<string | undefined>();
  const [debouncedQuery] = useDebounce(query, 300);
  const [filter, setFilter] = useState<InternalEventsFilters>({});
  const [sortBy, setSortBy] = useState<TableSortBy[]>([]);
  const eventSearchConfig = useGetSearchConfigFromLocalStorage('event');
  const eventsFilters = useMemo(() => {
    return {
      ...filter,
      ...defaultFilter,
    };
  }, [filter, defaultFilter]);

  const { data, isLoading, hasNextPage, fetchNextPage } =
    useEventsSearchResultQuery(
      {
        query: debouncedQuery,
        eventsFilters,
        eventsSortBy: sortBy,
      },
      eventSearchConfig
    );

  const appliedFilters = { ...filter, assetSubtreeIds: undefined };

  const handleFilterChange = (newValue: InternalEventsFilters) => {
    setFilter((prevState) => ({ ...prevState, ...newValue }));
  };

  return (
    <EventTable
      id="event-linked-search-results"
      query={debouncedQuery}
      onRowClick={(event) => onClick(event)}
      onDirectAssetClick={(directAsset) => {
        onParentAssetClick(directAsset.id);
      }}
      data={data}
      isDataLoading={isLoading}
      sorting={sortBy}
      enableSorting
      onSort={(props) => setSortBy(props)}
      showLoadButton
      tableSubHeaders={
        <AppliedFiltersTags
          filter={appliedFilters}
          onFilterChange={handleFilterChange}
        />
      }
      tableHeaders={
        <DefaultPreviewFilter query={query} onQueryChange={setQuery}>
          <EventTableFilters
            filter={eventsFilters}
            onFilterChange={handleFilterChange}
          />
        </DefaultPreviewFilter>
      }
      hasNextPage={hasNextPage}
      fetchMore={fetchNextPage}
    />
  );
};
