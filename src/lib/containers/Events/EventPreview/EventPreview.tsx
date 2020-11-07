import React from 'react';
import { Row, Col } from 'antd';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { CogniteEvent } from '@cognite/sdk';
import { ErrorFeedback, Loader, SpacedRow } from 'lib/components';
import { EventDetails } from 'lib/containers/Events';
import { ResourceDetailsSidebar } from 'lib/containers/ResoureDetails';
import { useRelationships } from 'lib/hooks/RelationshipHooks';

export const EventPreview = ({
  eventId,
  extraActions,
}: {
  eventId: number;
  extraActions?: React.ReactNode[];
}) => {
  const { data: event, error, isFetched } = useCdfItem<CogniteEvent>('events', {
    id: eventId,
  });

  const { data: relationships } = useRelationships(event?.externalId);

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
      <SpacedRow>{extraActions}</SpacedRow>
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
