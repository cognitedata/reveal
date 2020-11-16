import React, { useEffect } from 'react';
import { useParams, useRouteMatch, useLocation } from 'react-router-dom';
import { trackUsage } from 'app/utils/Metrics';
import ResourceTitleRow from 'app/components/ResourceTitleRow';
import { EventDetails } from 'lib/containers/Events';
import { renderTitle } from 'lib/utils/EventsUtils';
import { Row, Col } from 'antd';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { CogniteEvent } from '@cognite/sdk';
import { ErrorFeedback, Loader, Tabs } from 'lib/components';
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

export const EventPage = () => {
  const history = useHistory();
  const { id: eventIdString } = useParams<{
    id: string;
  }>();
  const eventId = parseInt(eventIdString, 10);

  useEffect(() => {
    trackUsage('Exploration.Event', { eventId });
  }, [eventId]);
  const { data: event, error, isFetched } = useCdfItem<CogniteEvent>('events', {
    id: eventId,
  });

  const match = useRouteMatch();
  const location = useLocation();
  const activeTab = location.pathname
    .replace(match.url, '')
    .slice(1) as EventPreviewTabType;

  if (!eventIdString) {
    return null;
  }

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
        id={eventId}
        type="event"
        icon="Events"
        getTitle={renderTitle}
      />
      <Row>
        <Col span={24}>
          <ResourceDetailsTabs
            parentResource={{
              type: 'event',
              id: event.id,
              externalId: event.externalId,
            }}
            tab={activeTab}
            onTabChange={newTab =>
              history.push(
                createLink(
                  `${match.url.substr(match.url.indexOf('/', 1))}/${newTab}`
                )
              )
            }
            additionalTabs={[
              <Tabs.Pane title={<TabTitle>Details</TabTitle>} key="details">
                <EventDetails event={event} showAll />
              </Tabs.Pane>,
            ]}
          />
        </Col>
      </Row>
    </>
  );
};
