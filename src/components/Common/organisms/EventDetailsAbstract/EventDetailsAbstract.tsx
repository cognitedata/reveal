import React from 'react';
import styled from 'styled-components';
import { Icon, Title, Body, Colors } from '@cognite/cogs.js';
import { InfoGrid, InfoCell, DetailsItem, ButtonRow } from 'components/Common';
import { CogniteEvent } from 'cognite-sdk-v3';
import moment from 'moment';
import { useResourcesState } from 'context/ResourceSelectionContext';
import { renderTitle } from 'containers/Events/EventsUtils';
import { EventInfoGrid } from './EventInfoGrid';

interface AssetDetailsProps {
  event: CogniteEvent;
  actions?: React.ReactNode[];
  extras?: React.ReactNode;
  children?: React.ReactNode;
}

const IconWrapper = styled.span`
  background: #f5f5f5;
  padding: 5px;
  padding-bottom: 1px;
  border-radius: 4px;
  margin-right: 8px;
  vertical-align: -0.225em;
`;

export const EventDetailsAbstract = ({
  event,
  actions,
  extras,
  children,
}: AssetDetailsProps) => {
  const resourcesState = useResourcesState();

  const currentlyViewing = resourcesState.find(
    el => el.type === 'event' && el.state === 'active'
  );
  return (
    <InfoGrid
      className="event-info-grid"
      noBorders
      style={{ flexDirection: 'column' }}
    >
      {event.id === (currentlyViewing || {}).id && (
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
            <Icon type="Eye" style={{ marginRight: 8 }} /> Currently Viewing
            Event
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
          <IconWrapper>
            <Icon type="Events" />
          </IconWrapper>
          <span
            style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            {renderTitle(event)}
          </span>
        </Title>
      </InfoCell>

      {actions && (
        <InfoCell noBorders>
          <ButtonRow>{actions}</ButtonRow>
        </InfoCell>
      )}
      <EventInfoGrid
        event={event}
        additionalRows={[
          <DetailsItem
            key="externalId"
            name="External ID"
            value={event.externalId}
          />,
          <DetailsItem
            key="description"
            name="Description"
            value={event.description}
          />,
          <DetailsItem
            key="createdTime"
            name="Created at"
            value={moment(event.createdTime).format('MM/DD/YYYY HH:MM')}
          />,
          <DetailsItem
            key="lastUpdatedTime"
            name="Updated at"
            value={moment(event.lastUpdatedTime).format('MM/DD/YYYY HH:MM')}
          />,
        ]}
      />
      {children}
    </InfoGrid>
  );
};

EventDetailsAbstract.EventInfoGrid = EventInfoGrid;
