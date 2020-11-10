import React from 'react';
import { EventSearchRequest, EventFilter, CogniteEvent } from '@cognite/sdk';
import { useResourcePreview } from 'lib/context';
import { SearchResultTable } from 'lib/components/Search/SearchPageTable';
import { SearchResultToolbar } from 'lib/containers/SearchResults';
import { SelectableItemsProps } from 'lib/CommonProps';

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

export const EventSearchResults = ({
  query = '',
  filter,
  ...selectionProps
}: { query?: string; filter: EventFilter } & SelectableItemsProps) => {
  const { openPreview } = useResourcePreview();

  return (
    <>
      <SearchResultToolbar
        api={query.length > 0 ? 'search' : 'list'}
        type="events"
        filter={filter}
        query={query}
      />
      <SearchResultTable<CogniteEvent>
        api="events"
        filter={filter}
        query={query}
        onRowClick={event =>
          openPreview({ item: { id: event.id, type: 'event' } })
        }
        {...selectionProps}
      />
    </>
  );
};
