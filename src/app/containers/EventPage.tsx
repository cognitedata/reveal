import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { trackUsage } from 'app/utils/Metrics';
import { EventPreview } from 'lib/containers/Events';
import ResourceTitleRow from 'app/components/ResourceTitleRow';
import { renderTitle } from 'lib/utils/EventsUtils';

export const EventPage = () => {
  const { eventId } = useParams<{
    eventId: string | undefined;
  }>();
  const eventIdNumber = eventId ? parseInt(eventId, 10) : undefined;

  useEffect(() => {
    trackUsage('Exploration.Event', { eventId: eventIdNumber });
  }, [eventIdNumber]);

  if (!eventId || !eventIdNumber || !Number.isFinite(eventIdNumber)) {
    return <>Invalid event id: {eventId}</>;
  }

  return (
    <>
      <ResourceTitleRow
        id={eventIdNumber}
        type="event"
        icon="Events"
        getTitle={renderTitle}
      />
      <EventPreview eventId={eventIdNumber} />
    </>
  );
};
