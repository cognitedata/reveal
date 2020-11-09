import React, { useMemo } from 'react';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { CogniteEvent } from '@cognite/sdk';
import {
  ErrorFeedback,
  Loader,
  InfoGrid,
  InfoCell,
  SpacedRow,
} from 'lib/components';
import { Title, Body, Colors } from '@cognite/cogs.js';
import { useResourceActionsContext } from 'lib/context';
import { renderTitle } from 'lib/utils/EventsUtils';
import { ResourceIcons } from 'lib/components/ResourceIcons/ResourceIcons';
import { EventDetails } from 'lib/containers/Events';
import { SmallPreviewProps } from 'lib/CommonProps';

export const EventSmallPreview = ({
  eventId,
  actions: propActions,
  extras,
  children,
  statusText,
}: {
  eventId: number;
} & SmallPreviewProps) => {
  const renderResourceActions = useResourceActionsContext();

  const { data: event, isFetched, error } = useCdfItem<CogniteEvent>('events', {
    id: eventId,
  });

  const actions = useMemo(() => {
    const items: React.ReactNode[] = [];
    items.push(...(propActions || []));
    items.push(
      ...renderResourceActions({
        id: eventId,
        type: 'event',
      })
    );
    return items;
  }, [renderResourceActions, eventId, propActions]);

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
    <InfoGrid
      className="event-info-grid"
      noBorders
      style={{ flexDirection: 'column' }}
    >
      {statusText && (
        <InfoCell
          noBorders
          containerStyles={{
            display: 'flex',
            alignItems: 'center',
            color: Colors['greyscale-grey6'].hex(),
          }}
        >
          <Body
            level={2}
            strong
            style={{
              alignItems: 'center',
              display: 'flex',
            }}
          >
            {statusText}
          </Body>
        </InfoCell>
      )}
      {extras && (
        <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
          {extras}
        </div>
      )}
      <InfoCell noBorders noPadding>
        <Title level={5} style={{ display: 'flex', alignItems: 'center' }}>
          <ResourceIcons.Event />
          <span
            style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            {renderTitle(event)}
          </span>
        </Title>
      </InfoCell>

      {actions && (
        <InfoCell noBorders>
          <SpacedRow>{actions}</SpacedRow>
        </InfoCell>
      )}
      <EventDetails event={event} />
      {children}
    </InfoGrid>
  );
};
