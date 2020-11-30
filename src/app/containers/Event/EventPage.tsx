import React from 'react';
import { useParams } from 'react-router-dom';
import { EventPreview } from './EventPreview';

export const EventPage = () => {
  const { id: eventIdString } = useParams<{
    id: string;
  }>();
  const eventId = parseInt(eventIdString, 10);

  if (!eventIdString) {
    return null;
  }

  return <EventPreview eventId={eventId} />;
};
