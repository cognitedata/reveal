import { CogniteEvent } from '@cognite/sdk';
import { AggregatedEventFilterV2 } from '@data-exploration-components/components';
import { AppliedFiltersTags } from '@data-exploration-components/components/AppliedFiltersTags/AppliedFiltersTags';
import { TableSortBy } from '@data-exploration-lib/domain-layer';
import React, { useMemo, useState } from 'react';
import { PreviewFilterDropdown } from '@data-exploration-components/components/PreviewFilter/PreviewFilterDropdown';
import { DefaultPreviewFilter } from '@data-exploration-components/components/PreviewFilter/PreviewFilter';
import { useDebounce } from 'use-debounce';
import { useEventsSearchResultQuery } from '@data-exploration-lib/domain-layer';
import {
  EventTable,
  useResourceResults,
} from '@data-exploration-components/containers';
import { convertResourceType } from '@data-exploration-components/types';
import {
  InternalCommonFilters,
  InternalEventsFilters,
  useGetSearchConfigFromLocalStorage,
} from '@data-exploration-lib/core';
import { MetadataFilter } from '@data-exploration/containers';

interface Props {
  enableAdvancedFilter?: boolean;
  defaultFilter: InternalCommonFilters;
  onClick: (item: CogniteEvent) => void;
  onParentAssetClick: (assetId: number) => void;
}

const LinkedEventFilter = ({
  filter,
  onFilterChange,
}: {
  filter: InternalEventsFilters;
  onFilterChange: (newValue: InternalEventsFilters) => void;
}) => {
  return (
    <PreviewFilterDropdown>
      <AggregatedEventFilterV2
        field="type"
        filter={filter}
        setValue={(newValue) => {
          onFilterChange({ type: newValue });
        }}
        title="Type"
        value={filter.type}
      />
      <AggregatedEventFilterV2
        field="subtype"
        filter={filter}
        setValue={(newValue) => {
          onFilterChange({ subtype: newValue });
        }}
        title="Sub-type"
        value={filter.subtype}
      />
      <MetadataFilter.Events
        filter={filter}
        values={filter.metadata}
        onChange={(newMetadata) => {
          onFilterChange({ metadata: newMetadata });
        }}
      />
    </PreviewFilterDropdown>
  );
};

export const EventLinkedSearchResults: React.FC<Props> = ({
  enableAdvancedFilter,
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

  const { data, hasNextPage, fetchNextPage } = useEventsSearchResultQuery(
    {
      query: debouncedQuery,
      eventsFilters,
      eventsSortBy: sortBy,
    },
    { enabled: enableAdvancedFilter },
    eventSearchConfig
  );
  const api = convertResourceType('event');
  const { canFetchMore, fetchMore, items } = useResourceResults<CogniteEvent>(
    api,
    debouncedQuery,
    eventsFilters
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
      data={enableAdvancedFilter ? data : items}
      sorting={sortBy}
      enableSorting={enableAdvancedFilter}
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
          <LinkedEventFilter
            filter={eventsFilters}
            onFilterChange={handleFilterChange}
          />
        </DefaultPreviewFilter>
      }
      hasNextPage={enableAdvancedFilter ? hasNextPage : canFetchMore}
      fetchMore={enableAdvancedFilter ? fetchNextPage : fetchMore}
    />
  );
};
