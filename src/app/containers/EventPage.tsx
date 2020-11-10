import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { trackUsage } from 'app/utils/Metrics';
import ResourceTitleRow from 'app/components/ResourceTitleRow';
import { EventDetails } from 'lib/containers/Events';
import { renderTitle } from 'lib/utils/EventsUtils';
import { Row, Col } from 'antd';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { CogniteEvent } from '@cognite/sdk';
import { ErrorFeedback, Loader } from 'lib/components';
import { ResourceDetailsSidebar } from 'lib/containers/ResoureDetails';
import { useRelationships } from 'lib/hooks/RelationshipHooks';

export const EventPage = () => {
  const { id: eventIdString } = useParams<{
    id: string;
  }>();
  const eventId = parseInt(eventIdString, 10);

  useEffect(() => {
    trackUsage('Exploration.Event', { eventId });
  }, [eventId]);
  const { data: event, error, isFetched } = useCdfItem<CogniteEvent>('events', {
    id: eventId,
  });

  const { data: relationships } = useRelationships(event?.externalId);

  if (!eventIdString) {
    return null;
  }

  if (!eventId || !Number.isFinite(eventId)) {
    return <>Invalid event id: {eventId}</>;
  }

  if (!isFetched) {
    return <Loader />;
  }

  if (error) {
    return <ErrorFeedback error={error} />;
  }

  if (!event) {
    return <>Event {eventId} not found!</>;
  }

  return (
    <>
      <ResourceTitleRow
        id={eventId}
        type="event"
        icon="Events"
        getTitle={renderTitle}
      />
      <Row>
        <Col span={18}>
          <EventDetails event={event} showAll />
        </Col>
        <Col span={6}>
          <ResourceDetailsSidebar relations={relationships} />
        </Col>
      </Row>
    </>
  );
};
