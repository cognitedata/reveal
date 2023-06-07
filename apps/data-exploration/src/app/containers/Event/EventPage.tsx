import { useParams } from 'react-router-dom';

import { PageTitle } from '@cognite/cdf-utilities';
import { CogniteEvent } from '@cognite/sdk';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';

import { renderTitle } from '@data-exploration-app/utils/EventsUtils';

import { EventPreview } from './EventPreview';

export const EventPage = () => {
  const { id: eventIdString = '' } = useParams<{
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
