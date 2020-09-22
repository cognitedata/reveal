import React, { useEffect, useContext } from 'react';
import { EventTable } from 'components/Common';
import { EventSearchRequest, EventFilter } from 'cognite-sdk-v3';
import {
  useResourcesSelector,
  useResourcesDispatch,
} from '@cognite/cdf-resources-store';
import {
  searchSelector,
  search,
} from '@cognite/cdf-resources-store/dist/events';
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
  const dispatch = useResourcesDispatch();
  const { eventFilter } = useContext(ResourceSelectionContext);
  const { openPreview } = useResourcePreview();

  const { items: events } = useResourcesSelector(searchSelector)(
    buildEventsFilterQuery(eventFilter, query)
  );

  useEffect(() => {
    dispatch(search(buildEventsFilterQuery(eventFilter, query)));
  }, [dispatch, eventFilter, query]);

  return (
    <EventTable
      events={events}
      onEventClicked={event =>
        openPreview({ item: { id: event.id, type: 'event' } })
      }
      query={query}
    />
  );
};
