import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { Loader, Metadata } from '@data-exploration/components';
import { EventInfo } from '@data-exploration/containers';
import { useCdfUserHistoryService } from '@user-history';
import styled from 'styled-components/macro';

import { Tabs } from '@cognite/cogs.js';
import { ErrorFeedback } from '@cognite/data-exploration';
import { CogniteError, CogniteEvent } from '@cognite/sdk';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';

import { useTranslation, SUB_APP_PATH } from '@data-exploration-lib/core';

import { BreadcrumbsV2 } from '../../components/Breadcrumbs/BreadcrumbsV2';
import ResourceTitleRow from '../../components/ResourceTitleRow';
import { useEndJourney, useResourceDetailSelectedTab } from '../../hooks';
import { renderTitle } from '../../utils/EventsUtils';
import { trackUsage } from '../../utils/Metrics';
import { AllTab } from '../All';
import { DetailsTabWrapper } from '../Common/element';
import { ResourceDetailsTabs } from '../ResourceDetails';

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
  const { t } = useTranslation();

  const [selectedTab, setSelectedTab] = useResourceDetailSelectedTab();
  const [endJourney] = useEndJourney();

  const activeTab = selectedTab || 'details';

  const { pathname, search: searchParams } = useLocation();
  const userHistoryService = useCdfUserHistoryService();

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
    isFetched: isEventFetched,
  } = useCdfItem<CogniteEvent>('events', {
    id: eventId,
  });

  useEffect(() => {
    if (isEventFetched && event) {
      // save Event preview as view resource in user history
      if (event?.id)
        userHistoryService.logNewResourceView({
          application: SUB_APP_PATH,
          name: renderTitle(event),
          path: pathname.concat(searchParams),
        });
    }
  }, [isEventFetched, event]);

  if (!eventId || !Number.isFinite(eventId)) {
    return (
      <>
        {t('INVALID_EVENT_ID', 'Invalid event id')}: {eventId}
      </>
    );
  }

  if (!isEventFetched) {
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
    return (
      <>
        {t('RESOURCE_NOT_FOUND', `Event ${eventId} not found!`, {
          resourceType: t('EVENT', 'Event'),
          id: eventId,
        })}
      </>
    );
  }

  const filter = {
    assetIds: event.assetIds ? event.assetIds.map((id) => ({ value: id })) : [],
  };

  return (
    <EventDetailWrapper data-testid="event-detail">
      <BreadcrumbsV2 />
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
        onTabChange={handleTabChange}
        tab={activeTab}
        additionalTabs={[
          <Tabs.Tab
            key="details"
            label={t('DETAILS', 'Details')}
            tabKey="details"
          >
            <DetailsTabWrapper>
              <EventInfo event={event} />
              <Metadata metadata={event.metadata} />
            </DetailsTabWrapper>
          </Tabs.Tab>,
          <Tabs.Tab
            label={t('ALL_RESOURCES', 'All resources')}
            key="all-resources"
            tabKey="all-resources"
          >
            <AllTab
              filters={{
                asset: filter,
                file: filter,
                sequence: filter,
              }}
              selectedResourceExternalId={event.externalId}
              setCurrentResourceType={(type) => type && setSelectedTab(type)}
            />
          </Tabs.Tab>,
        ]}
      />
    </EventDetailWrapper>
  );
};
const EventDetailWrapper = styled.div`
  display: contents;
`;
