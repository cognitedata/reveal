import { Loader } from '@data-exploration/components';
import React from 'react';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { CogniteError, CogniteEvent } from '@cognite/sdk';
import {
  ErrorFeedback,
  InfoGrid,
  InfoCell,
  SpacedRow,
} from '@data-exploration-components/components';
import { Title, Body, Colors } from '@cognite/cogs.js';
import { renderTitle } from '@data-exploration-components/utils';
import { ResourceIcons } from '@data-exploration-components/components/ResourceIcons/ResourceIcons';
import noop from 'lodash/noop';
import {
  SmallPreviewProps,
  SelectableItemProps,
} from '@data-exploration-components/types';
import { useSelectionButton } from '@data-exploration-components/hooks/useSelection';
import { EventInfo } from '@data-exploration/containers';

export const EventSmallPreview = ({
  eventId,
  actions,
  extras,
  children,
  statusText,
  selectionMode = 'none',
  isSelected = false,
  onSelect = noop,
}: {
  eventId: number;
} & SmallPreviewProps &
  Partial<SelectableItemProps>) => {
  const {
    data: event,
    isFetched,
    error,
  } = useCdfItem<CogniteEvent>('events', {
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
    return <ErrorFeedback error={error as CogniteError} />;
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
            color: Colors['decorative--grayscale--600'],
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
      <EventInfo event={event} />
      {children}
    </InfoGrid>
  );
};
