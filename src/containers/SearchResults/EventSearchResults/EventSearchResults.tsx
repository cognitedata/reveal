import React from 'react';
import { EventFilter, CogniteEvent } from '@cognite/sdk';
import { SearchResultToolbar } from 'containers/SearchResults';
import { ResourceItem } from 'types';
import { EventNewTable } from 'containers/Events';

import { RelatedResourceType } from 'hooks/RelatedResourcesHooks';
import { EnsureNonEmptyResource } from 'components';
import { Loader } from '@cognite/cogs.js';
import { ColumnToggleProps } from 'components/ReactTable';
import { useEventsSearchResultQuery } from 'domain/events/internal/queries/useEventsSearchResultQuery';

export const EventSearchResults = ({
  query = '',
  filter = {},
  onClick,
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
} & ColumnToggleProps<CogniteEvent>) => {
  const { data, isLoading, hasNextPage, fetchNextPage } =
    useEventsSearchResultQuery({ query, eventsFilters: filter });

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
        onRowClick={(event: CogniteEvent) => onClick(event)}
        // relatedResourceType={relatedResourceType}
      />
    </EnsureNonEmptyResource>
  );
};
