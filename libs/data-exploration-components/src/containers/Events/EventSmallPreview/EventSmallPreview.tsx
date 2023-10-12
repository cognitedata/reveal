import React from 'react';

import { Loader } from '@data-exploration/components';
import noop from 'lodash/noop';

import { Title, Body, Colors } from '@cognite/cogs.js';
import { CogniteError, CogniteEvent } from '@cognite/sdk';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';

import {
  ErrorFeedback,
  InfoCell,
  InfoGrid,
  ResourceIcons,
  SpacedRow,
} from '../../../components';
import { useSelectionButton } from '../../../hooks';
import { SelectableItemProps, SmallPreviewProps } from '../../../types';
import { renderTitle } from '../../../utils';
// import { EventInfo } from '@data-exploration/containers';

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
      {/* <EventInfo event={event} /> */}
      {children}
    </InfoGrid>
  );
};
