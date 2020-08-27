import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { itemSelector, retrieve } from 'modules/events';
import { Icon, Title } from '@cognite/cogs.js';
import { EventDetailsAbstract, DetailsItem, Wrapper } from 'components/Common';
import { DescriptionList } from '@cognite/gearbox/dist/components/DescriptionList';
import { Tabs } from 'antd';
import moment from 'moment';
import { renderTitle } from './EventsUtils';

const formatMetadata = (metadata: { [key: string]: any }) =>
  Object.keys(metadata).reduce(
    (agg, cur) => ({
      ...agg,
      [cur]: String(metadata[cur]) || '',
    }),
    {}
  );

export const EventPreview = ({
  eventId,
  extraActions,
}: {
  eventId: number;
  extraActions?: React.ReactNode[];
}) => {
  const dispatch = useDispatch();
  const event = useSelector(itemSelector)(eventId);

  useEffect(() => {
    if (!event) {
      dispatch(retrieve([{ id: eventId }]));
    }
  }, [dispatch, event, eventId]);

  return (
    <Wrapper>
      <h1>
        <Icon type="Events" />
        {renderTitle(event)}
      </h1>
      {extraActions}
      {event && (
        <Tabs>
          <Tabs.TabPane key="details" tab="Event Details">
            <Title level={4} style={{ marginTop: 12, marginBottom: 12 }}>
              Details
            </Title>
            <DetailsItem name="External ID" value={event.externalId} />
            <DetailsItem name="Description" value={event.description} />
            <DetailsItem
              name="Created at"
              value={moment(event.createdTime).format('MM/DD/YYYY HH:MM')}
            />
            <DetailsItem
              name="Updated at"
              value={moment(event.lastUpdatedTime).format('MM/DD/YYYY HH:MM')}
            />
            <DetailsItem name="External ID" value={event.externalId} />
            <Title level={4} style={{ marginTop: 12, marginBottom: 12 }}>
              Metadata
            </Title>
            <EventDetailsAbstract.EventInfoGrid event={event} showAll />
          </Tabs.TabPane>
          <Tabs.TabPane key="metadata" tab="Metadata">
            <DescriptionList valueSet={formatMetadata(event.metadata ?? {})} />
          </Tabs.TabPane>
        </Tabs>
      )}
    </Wrapper>
  );
};
