import React, { useEffect } from 'react';

import { Loader, Metadata } from '@data-exploration/components';
import { EventInfo } from '@data-exploration/containers';

import { Tabs } from '@cognite/cogs.js';
import { ErrorFeedback } from '@cognite/data-exploration';
import { CogniteError, CogniteEvent } from '@cognite/sdk';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';

import { BreadcrumbsV2 } from '@data-exploration-app/components/Breadcrumbs/BreadcrumbsV2';
import ResourceTitleRowV2 from '@data-exploration-app/components/ResourceTitleRowV2';
import { DetailsTabWrapper } from '@data-exploration-app/containers/Common/element';
import { ResourceDetailsTabsV2 } from '@data-exploration-app/containers/ResourceDetails';
import {
  useEndJourney,
  useResourceDetailSelectedTab,
} from '@data-exploration-app/hooks';
import { renderTitle } from '@data-exploration-app/utils/EventsUtils';
import { trackUsage } from '@data-exploration-app/utils/Metrics';

// EventPreviewTabType;
// - details
// - assets
// - timeseries
// - files
// - sequences
// - events

export const EventDetail = ({
  eventId,
  actions,
}: {
  eventId: number;
  actions?: React.ReactNode;
}) => {
  const [selectedTab, setSelectedTab] = useResourceDetailSelectedTab();
  const [endJourney] = useEndJourney();

  const activeTab = selectedTab || 'details';

  const handlePreviewClose = () => {
    endJourney();
  };

  const handleTabChange = (newTab: string) => {
    setSelectedTab(newTab);
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
      <BreadcrumbsV2 />
      <ResourceTitleRowV2
        item={{ id: eventId, type: 'event' }}
        title={renderTitle(event)}
        afterDefaultActions={actions}
      />
      <ResourceDetailsTabsV2
        parentResource={{
          type: 'event',
          id: event.id,
          externalId: event.externalId,
          title: renderTitle(event),
        }}
        onTabChange={handleTabChange}
        tab={activeTab}
        additionalTabs={[
          <Tabs.Tab key="details" label="Details" tabKey="details">
            <DetailsTabWrapper>
              <EventInfo event={event} />
              <Metadata metadata={event.metadata} />
            </DetailsTabWrapper>
          </Tabs.Tab>,
        ]}
      />
    </>
  );
};
