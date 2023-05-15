import { Loader } from '@data-exploration/components';
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { trackUsage } from '@data-exploration-app/utils/Metrics';

import ResourceTitleRow from '@data-exploration-app/components/ResourceTitleRow';
import {
  EventDetails,
  ErrorFeedback,
  Metadata,
} from '@cognite/data-exploration';
import { Tabs } from '@cognite/cogs.js';
import { renderTitle } from '@data-exploration-app/utils/EventsUtils';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { CogniteError, CogniteEvent } from '@cognite/sdk';

import { ResourceDetailsTabs } from '@data-exploration-app/containers/ResourceDetails';
import {
  useCurrentResourceId,
  useOnPreviewTabChange,
} from '@data-exploration-app/hooks/hooks';
import { DetailsTabWrapper } from '@data-exploration-app/containers/Common/element';
import { Breadcrumbs } from '@data-exploration-app/components/Breadcrumbs/Breadcrumbs';

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
  const [, openPreview] = useCurrentResourceId();

  const handlePreviewClose = () => {
    openPreview(undefined);
  };

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
    const { errorMessage: message, status, requestId } = error as CogniteError;
    return (
      <ErrorFeedback
        error={{ message, status, requestId }}
        onPreviewClose={handlePreviewClose}
      />
    );
  }

  if (!event) {
    return <>Event {eventId} not found!</>;
  }

  return (
    <>
      <Breadcrumbs currentResource={{ title: renderTitle(event) }} />
      <ResourceTitleRow
        item={{ id: eventId, type: 'event' }}
        title={renderTitle(event)}
        afterDefaultActions={actions}
      />
      <ResourceDetailsTabs
        parentResource={{
          type: 'event',
          id: event.id,
          externalId: event.externalId,
          title: renderTitle(event),
        }}
        onTabChange={onTabChange}
        tab={activeTab}
        additionalTabs={[
          <Tabs.Tab key="details" label="Details" tabKey="details">
            <DetailsTabWrapper>
              <EventDetails event={event} />
              <Metadata metadata={event.metadata} />
            </DetailsTabWrapper>
          </Tabs.Tab>,
        ]}
      />
    </>
  );
};
