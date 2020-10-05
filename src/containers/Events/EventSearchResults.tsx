import React, { useContext } from 'react';
import { EventTable } from 'components/Common';
import { EventSearchRequest, EventFilter } from '@cognite/sdk';
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
    <EventTable
      onEventClicked={event =>
        openPreview({ item: { id: event.id, type: 'event' } })
      }
      query={query}
      filter={eventFilter}
    />
  );
};
