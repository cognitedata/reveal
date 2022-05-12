import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { trackUsage } from 'app/utils/Metrics';

import ResourceTitleRow from 'app/components/ResourceTitleRow';
import {
  EventDetails,
  ErrorFeedback,
  Loader,
  Metadata,
} from '@cognite/data-exploration';
import { Tabs } from '@cognite/cogs.js';
import { renderTitle } from 'app/utils/EventsUtils';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { CogniteEvent } from '@cognite/sdk';

import { ResourceDetailsTabs, TabTitle } from 'app/containers/ResourceDetails';
import { useOnPreviewTabChange } from 'app/hooks';

export type EventPreviewTabType =
  | 'details'
  | 'assets'
  | 'timeseries'
  | 'files'
  | 'sequences'
  | 'events';

export const EventPreview = ({
  eventId,
  actions,
}: {
  eventId: number;
  actions?: React.ReactNode;
}) => {
  const { tabType } = useParams<{
    tabType: EventPreviewTabType;
  }>();
  const activeTab = tabType || 'details';

  const onTabChange = useOnPreviewTabChange(tabType, 'event');

  useEffect(() => {
    trackUsage('Exploration.Preview.Event', { eventId });
  }, [eventId]);
  const {
    data: event,
    error,
    isFetched,
  } = useCdfItem<CogniteEvent>('events', {
    id: eventId,
  });

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
        item={{ id: eventId, type: 'event' }}
        getTitle={renderTitle}
        afterDefaultActions={actions}
      />
      <ResourceDetailsTabs
        parentResource={{
          type: 'event',
          id: event.id,
          externalId: event.externalId,
        }}
        tab={activeTab}
        onTabChange={onTabChange}
        additionalTabs={[
          <Tabs.TabPane tab={<TabTitle>Details</TabTitle>} key="details">
            <EventDetails event={event} />
            <Metadata metadata={event.metadata} />
          </Tabs.TabPane>,
        ]}
      />
    </>
  );
};
