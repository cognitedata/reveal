import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { trackUsage } from 'app/utils/Metrics';
import { EventPreview } from './EventPreview';

export const EventPage = () => {
  const { id: eventIdString } = useParams<{
    id: string;
  }>();
  const eventId = parseInt(eventIdString, 10);

  useEffect(() => {
    trackUsage('Exploration.EventPage', { eventId });
  }, [eventId]);

  if (!eventIdString) {
    return null;
  }

  return (
    <EventPreview
      eventId={eventId}
      actions={['Download', 'Collections', 'Copy']}
    />
  );
};
