import { CogniteEvent } from '@cognite/sdk';
import { TableSortBy } from '@data-exploration-lib/domain-layer';
import {
  DefaultPreviewFilter,
  PreviewFilterDropdown,
} from '@data-exploration/components';
import React, { useMemo, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { useEventsSearchResultQuery } from '@data-exploration-lib/domain-layer';
import {
  InternalCommonFilters,
  InternalEventsFilters,
  useGetSearchConfigFromLocalStorage,
} from '@data-exploration-lib/core';
import {
  MetadataFilter,
  SourceFilter,
  SubTypeFilter,
  TypeFilter,
} from '../../../Filters';
import { AppliedFiltersTags } from '../AppliedFiltersTags';
import { EventTable } from './EventTable';

interface Props {
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
      <SourceFilter.Event
        filter={filter}
        value={filter.sources}
        onChange={(newSources) =>
          onFilterChange({
            sources: newSources,
          })
        }
      />
      <TypeFilter.Event
        filter={filter}
        value={filter.type}
        onChange={(newFilters) => onFilterChange({ type: newFilters })}
      />

      <SubTypeFilter.Event
        filter={filter}
        value={filter.subtype}
        onChange={(newFilters) => onFilterChange({ subtype: newFilters })}
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
          <LinkedEventFilter
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
