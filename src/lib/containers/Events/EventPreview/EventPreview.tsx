import React from 'react';
import { Icon, Title } from '@cognite/cogs.js';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { CogniteEvent } from '@cognite/sdk';
import {
  DetailsItem,
  ErrorFeedback,
  Loader,
  SpacedRow,
  TimeDisplay,
  Wrapper,
} from 'lib/components';
import { renderTitle } from 'lib/utils/EventsUtils';
import { EventDetailsAbstract } from 'lib/containers/Events';

const EventDetails = ({ event }: { event: CogniteEvent }) => (
  <div>
    <Title level={4} style={{ marginTop: 12, marginBottom: 12 }}>
      Details
    </Title>
    <DetailsItem name="ID" value={event.id} />
    <DetailsItem name="Description" value={event.description} />
    <DetailsItem
      name="Created at"
      value={<TimeDisplay value={event.createdTime} />}
    />
    <DetailsItem
      name="Updated at"
      value={<TimeDisplay value={event.lastUpdatedTime} />}
    />
    <DetailsItem name="External ID" value={event.externalId} />
    <Title level={4} style={{ marginTop: 12, marginBottom: 12 }}>
      Metadata
    </Title>
    <EventDetailsAbstract.EventInfoGrid event={event} showAll />
  </div>
);

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
    <Wrapper>
      <h1>
        <Icon type="Events" />
        {renderTitle(event)}
      </h1>
      <SpacedRow>{extraActions}</SpacedRow>
      <EventDetails event={event} />
    </Wrapper>
  );
};
