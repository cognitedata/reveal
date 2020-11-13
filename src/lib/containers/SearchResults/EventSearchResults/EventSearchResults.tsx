import React from 'react';
import { EventFilter, CogniteEvent } from '@cognite/sdk';
import { SearchResultToolbar } from 'lib/containers/SearchResults';
import { SelectableItemsProps } from 'lib/CommonProps';
import { SearchResultLoader } from 'lib';
import { EventTable } from 'lib/containers/Events';

export const EventSearchResults = ({
  query = '',
  filter,
  onClick,
  ...selectionProps
}: {
  query?: string;
  filter: EventFilter;
  onClick: (item: CogniteEvent) => void;
} & SelectableItemsProps) => {
  return (
    <>
      <SearchResultToolbar
        api={query.length > 0 ? 'search' : 'list'}
        type="events"
        filter={filter}
        query={query}
      />
      <SearchResultLoader<CogniteEvent>
        type="event"
        filter={filter}
        query={query}
        {...selectionProps}
      >
        {props => (
          <EventTable {...props} onRowClick={event => onClick(event)} />
        )}
      </SearchResultLoader>
    </>
  );
};
