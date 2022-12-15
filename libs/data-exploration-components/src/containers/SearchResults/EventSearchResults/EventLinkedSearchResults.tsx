import { CogniteEvent } from '@cognite/sdk';
import { useList } from '@cognite/sdk-react-query-hooks';
import { AggregatedEventFilterV2, MetadataFilterV2 } from 'components';
import { AppliedFiltersTags } from 'components/AppliedFiltersTags/AppliedFiltersTags';
import { TableSortBy } from 'components/Table';
import { transformNewFilterToOldFilter } from 'domain/transformers';
import React, { useMemo, useState } from 'react';
import { PreviewFilterDropdown } from 'components/PreviewFilter/PreviewFilterDropdown';
import { DefaultPreviewFilter } from 'components/PreviewFilter/PreviewFilter';
import { InternalCommonFilters } from 'domain/types';
import { useDebounce } from 'use-debounce';
import {
  InternalEventsFilters,
  useEventsSearchResultQuery,
} from 'domain/events';
import { EventTable, useResourceResults } from 'containers';
import { convertResourceType } from 'types';

interface Props {
  enableAdvancedFilter?: boolean;
  defaultFilter: InternalCommonFilters;
  onClick: (item: CogniteEvent) => void;
}

const LinkedEventFilter = ({
  filter,
  onFilterChange,
}: {
  filter: InternalEventsFilters;
  onFilterChange: (newValue: InternalEventsFilters) => void;
}) => {
  const { data: items = [] } = useList('events', {
    filter: transformNewFilterToOldFilter(filter),
    limit: 1000,
  });

  return (
    <PreviewFilterDropdown>
      <AggregatedEventFilterV2
        field="type"
        filter={filter}
        setValue={newValue => {
          onFilterChange({ type: newValue });
        }}
        title="Type"
        value={filter.type}
      />
      <AggregatedEventFilterV2
        field="subtype"
        filter={filter}
        setValue={newValue => {
          onFilterChange({ subtype: newValue });
        }}
        title="Sub-type"
        value={filter.subtype}
      />
      <MetadataFilterV2
        items={items}
        value={filter.metadata}
        setValue={newValue => onFilterChange({ metadata: newValue })}
      />
    </PreviewFilterDropdown>
  );
};

export const EventLinkedSearchResults: React.FC<Props> = ({
  enableAdvancedFilter,
  defaultFilter,
  onClick,
}) => {
  const [query, setQuery] = useState<string | undefined>();
  const [debouncedQuery] = useDebounce(query, 300);
  const [filter, setFilter] = useState<InternalEventsFilters>({});
  const [sortBy, setSortBy] = useState<TableSortBy[]>([]);

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
    { enabled: enableAdvancedFilter }
  );
  const api = convertResourceType('event');
  const { canFetchMore, fetchMore, items } = useResourceResults<CogniteEvent>(
    api,
    debouncedQuery,
    eventsFilters
  );

  const appliedFilters = { ...filter, assetSubtreeIds: undefined };

  const handleFilterChange = (newValue: InternalEventsFilters) => {
    setFilter(prevState => ({ ...prevState, ...newValue }));
  };

  return (
    <EventTable
      id="event-linked-search-results"
      query={debouncedQuery}
      onRowClick={event => onClick(event)}
      data={enableAdvancedFilter ? data : items}
      sorting={sortBy}
      enableSorting={enableAdvancedFilter}
      onSort={props => setSortBy(props)}
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
