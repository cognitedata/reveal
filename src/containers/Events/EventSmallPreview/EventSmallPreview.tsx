import React from 'react';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { CogniteEvent } from '@cognite/sdk';
import {
  ErrorFeedback,
  Loader,
  InfoGrid,
  InfoCell,
  SpacedRow,
} from 'components';
import { Title, Body, Colors } from '@cognite/cogs.js';
import { renderTitle } from 'utils/EventsUtils';
import { ResourceIcons } from 'components/ResourceIcons/ResourceIcons';
import { EventDetails } from 'containers/Events';
import { SmallPreviewProps, SelectableItemProps } from 'CommonProps';
import { useSelectionButton } from 'hooks/useSelection';

export const EventSmallPreview = ({
  eventId,
  actions,
  extras,
  children,
  statusText,
  selectionMode = 'none',
  isSelected = false,
  onSelect = () => {},
}: {
  eventId: number;
} & SmallPreviewProps &
  Partial<SelectableItemProps>) => {
  const { data: event, isFetched, error } = useCdfItem<CogniteEvent>('events', {
    id: eventId,
  });

  const selectionButton = useSelectionButton(
    selectionMode,
    { type: 'event', id: eventId },
    isSelected,
    onSelect
  );

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

      <InfoCell noBorders>
        <SpacedRow>
          {selectionButton}
          {actions}
        </SpacedRow>
      </InfoCell>
      <EventDetails event={event} />
      {children}
    </InfoGrid>
  );
};
