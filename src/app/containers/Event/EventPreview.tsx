import React, { useEffect } from 'react';
import { useRouteMatch, useLocation } from 'react-router-dom';
import { trackUsage } from 'app/utils/Metrics';
import ResourceTitleRow from 'app/components/ResourceTitleRow';
import {
  EventDetails,
  ErrorFeedback,
  Loader,
  Tabs,
  Metadata,
} from '@cognite/data-exploration';
import { renderTitle } from 'app/utils/EventsUtils';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { CogniteEvent } from '@cognite/sdk';
import { useHistory } from 'react-router';
import { createLink } from '@cognite/cdf-utilities';
import { ResourceDetailsTabs, TabTitle } from 'app/containers/ResourceDetails';

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
  const history = useHistory();

  useEffect(() => {
    trackUsage('Exploration.Preview.Event', { eventId });
  }, [eventId]);
  const { data: event, error, isFetched } = useCdfItem<CogniteEvent>('events', {
    id: eventId,
  });

  const match = useRouteMatch();
  const location = useLocation();
  const activeTab = location.pathname
    .replace(match.url, '')
    .slice(1) as EventPreviewTabType;

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
        onTabChange={newTab => {
          history.push(
            createLink(
              `${match.url.substr(match.url.indexOf('/', 1))}/${newTab}`
            )
          );
          trackUsage('Exploration.Details.TabChange', {
            type: 'event',
            tab: newTab,
          });
        }}
        additionalTabs={[
          <Tabs.Pane title={<TabTitle>Details</TabTitle>} key="details">
            <EventDetails event={event} />
            <Metadata metadata={event.metadata} />
          </Tabs.Pane>,
        ]}
      />
    </>
  );
};
