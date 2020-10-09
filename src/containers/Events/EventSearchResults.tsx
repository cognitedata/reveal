import React, { useContext } from 'react';
import { ResourceTable } from 'components/Common';
import { EventSearchRequest, EventFilter, CogniteEvent } from '@cognite/sdk';
import ResourceSelectionContext from 'context/ResourceSelectionContext';
import { useResourcePreview } from 'context/ResourcePreviewContext';

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
    <ResourceTable<CogniteEvent>
      api="events"
      filter={eventFilter}
      query={query}
      onRowClick={event =>
        openPreview({ item: { id: event.id, type: 'event' } })
      }
    />
  );
};
