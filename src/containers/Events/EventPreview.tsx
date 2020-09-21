import React, { useEffect, useMemo, useState } from 'react';
import {
  useResourcesSelector,
  useResourcesDispatch,
} from '@cognite/cdf-resources-store';
import {
  itemSelector,
  retrieve,
} from '@cognite/cdf-resources-store/dist/events';
import { Button, Icon, Title } from '@cognite/cogs.js';
import {
  EventDetailsAbstract,
  DetailsItem,
  Wrapper,
  TimeDisplay,
  SpacedRow,
} from 'components/Common';
import { DescriptionList } from '@cognite/gearbox/dist/components/DescriptionList';
import { renderTitle } from 'utils/EventsUtils';

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
  const dispatch = useResourcesDispatch();
  const event = useResourcesSelector(itemSelector)(eventId);

  useEffect(() => {
    if (!event) {
      dispatch(retrieve([{ id: eventId }]));
    }
  }, [dispatch, event, eventId]);
  const tabs = {
    'event-metadata': 'Event details',
    metadata: 'Metadata',
  };

  const [currentTab, setTab] = useState<keyof typeof tabs>('event-metadata');

  const content = useMemo(() => {
    if (event) {
      switch (currentTab) {
        case 'event-metadata': {
          return (
            <>
              <Title level={4} style={{ marginTop: 12, marginBottom: 12 }}>
                Details
              </Title>
              <DetailsItem name="External ID" value={event.externalId} />
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
            </>
          );
        }
        case 'metadata': {
          return (
            <DescriptionList valueSet={formatMetadata(event.metadata ?? {})} />
          );
        }
      }
    }
    return <></>;
  }, [event, currentTab]);

  return (
    <Wrapper>
      <h1>
        <Icon type="Events" />
        {renderTitle(event)}
      </h1>
      <SpacedRow>{extraActions}</SpacedRow>
      <SpacedRow>
        {Object.keys(tabs).map(el => {
          const key = el as keyof typeof tabs;
          return (
            <Button
              variant={key === currentTab ? 'default' : 'ghost'}
              type={key === currentTab ? 'primary' : 'secondary'}
              onClick={() => setTab(key)}
              key={key}
            >
              {tabs[key]}
            </Button>
          );
        })}
      </SpacedRow>
      {event && content}
    </Wrapper>
  );
};
