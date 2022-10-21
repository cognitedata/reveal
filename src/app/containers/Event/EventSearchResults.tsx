import React from 'react';
import { EventFilter, CogniteEvent } from '@cognite/sdk';
import {
  SelectableItemsProps,
  TableStateProps,
  DateRangeProps,
  ResourceItem,
  EventNewTable,
  RelatedResourceType,
  EnsureNonEmptyResource,
  SearchResultToolbar,
} from '@cognite/data-exploration';

import { Loader } from '@cognite/cogs.js';
import { useEventsFilteredListQuery } from 'app/domain/events/internal/queries/useEventsFilteredListQuery';

export const EventSearchResults = ({
  query = '',
  filter = {},
  onClick,
  relatedResourceType,
  count,
  showCount = false,
}: {
  query?: string;
  filter?: EventFilter;
  showCount?: boolean;
  showRelatedResources?: boolean;
  relatedResourceType?: RelatedResourceType;
  parentResource?: ResourceItem;
  count?: number;
  onClick: (item: CogniteEvent) => void;
} & SelectableItemsProps &
  TableStateProps &
  DateRangeProps) => {
  const { data, isLoading, hasNextPage, fetchNextPage } =
    useEventsFilteredListQuery();

  if (isLoading) {
    return <Loader />;
  }

  return (
    <EnsureNonEmptyResource api="event">
      <EventNewTable
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
        data={data}
        fetchMore={fetchNextPage}
        showLoadButton
        hasNextPage={hasNextPage}
        onRowClick={(event: any) => onClick(event)}
        relatedResourceType={relatedResourceType}
      />
    </EnsureNonEmptyResource>
  );
};
