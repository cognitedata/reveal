import React, { useContext } from 'react';
import { EventSearchRequest, EventFilter, CogniteEvent } from '@cognite/sdk';
import { useResourcePreview, ResourceSelectionContext } from 'lib/context';
import { SearchResultTable } from 'lib/components/Search/SearchPageTable';
import { SearchResultToolbar } from 'lib/containers/SearchResults';

export const buildEventsFilterQuery = (
  filter: EventFilter,
  query: string | undefined
): EventSearchRequest => {
  return {
    ...(query &&
      query.length > 0 && {
        search: {
          description: query,
        },
      }),
    filter,
  };
};

export const EventSearchResults = ({ query = '' }: { query?: string }) => {
  const { eventFilter } = useContext(ResourceSelectionContext);
  const { openPreview } = useResourcePreview();

  return (
    <>
      <SearchResultToolbar
        api={query.length > 0 ? 'search' : 'list'}
        type="events"
        filter={eventFilter}
        query={query}
      />
      <SearchResultTable<CogniteEvent>
        api="events"
        filter={eventFilter}
        query={query}
        onRowClick={event =>
          openPreview({ item: { id: event.id, type: 'event' } })
        }
      />
    </>
  );
};
