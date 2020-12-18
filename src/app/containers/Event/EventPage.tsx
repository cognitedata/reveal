import React from 'react';
import { useParams } from 'react-router-dom';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { CogniteEvent } from '@cognite/sdk';
import { renderTitle } from 'lib/utils/EventsUtils';
import { PageTitle } from '@cognite/cdf-utilities';
import { EventPreview } from './EventPreview';

export const EventPage = () => {
  const { id: eventIdString } = useParams<{
    id: string;
  }>();
  const eventId = parseInt(eventIdString, 10);

  const { data: event } = useCdfItem<CogniteEvent>('events', {
    id: eventId,
  });

  if (!eventIdString) {
    return null;
  }

  return (
    <>
      <PageTitle title={renderTitle(event)} />
      <EventPreview eventId={eventId} />
    </>
  );
};
